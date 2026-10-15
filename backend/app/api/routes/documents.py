import os
import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.models.task import TaskHistory
from backend.app.schemas.document import (
    DocumentResponse, DocumentSummaryResponse, DocumentAskRequest, DocumentAskResponse
)
from backend.app.services.document_service import document_service
from backend.app.core.config import settings
from backend.app.core.exceptions import NotFoundError, PermissionDeniedError, FileProcessingError
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/documents", tags=["Document Saathi"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    file_size = len(content)

    # 1. Size limit validation
    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise FileProcessingError(f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB")

    # 2. Magic byte mime-type validation
    mime_type = document_service.validate_file_header(content, file.filename or "doc")

    # 3. Secure disk storage with unique UUID filename
    file_ext = os.path.splitext(file.filename or "")[1]
    safe_filename = f"{uuid.uuid4()}{file_ext}"
    storage_path = os.path.join(settings.STORAGE_DIR, safe_filename)

    with open(storage_path, "wb") as f:
        f.write(content)

    # 4. Extract text and page count
    extracted_text, page_count, _ = document_service.extract_text_and_pages(storage_path, mime_type)
    entities = document_service.extract_key_entities(extracted_text)

    # 5. Save database record
    doc_record = Document(
        owner_id=current_user.id,
        original_filename=file.filename or "Uploaded Document",
        file_path=storage_path,
        mime_type=mime_type,
        file_size_bytes=file_size,
        page_count=page_count,
        processing_status="processed",
        extracted_text=extracted_text,
        key_entities_json=json.dumps(entities)
    )
    db.add(doc_record)
    await db.flush()

    # 6. Record task history
    task = TaskHistory(
        owner_id=current_user.id,
        task_type="doc_upload",
        title=f"दस्तावेज़ अपलोड: {doc_record.original_filename}",
        status="completed"
    )
    db.add(task)
    await db.commit()
    await db.refresh(doc_record)

    return DocumentResponse(
        id=doc_record.id,
        original_filename=doc_record.original_filename,
        mime_type=doc_record.mime_type,
        file_size_bytes=doc_record.file_size_bytes,
        page_count=doc_record.page_count,
        processing_status=doc_record.processing_status,
        summary=doc_record.summary,
        summary_hi=doc_record.summary_hi,
        key_entities=entities,
        created_at=doc_record.created_at
    )

@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Document).where(Document.owner_id == current_user.id).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    out = []
    for d in docs:
        entities = json.loads(d.key_entities_json) if d.key_entities_json else {}
        out.append(DocumentResponse(
            id=d.id,
            original_filename=d.original_filename,
            mime_type=d.mime_type,
            file_size_bytes=d.file_size_bytes,
            page_count=d.page_count,
            processing_status=d.processing_status,
            summary=d.summary,
            summary_hi=d.summary_hi,
            key_entities=entities,
            created_at=d.created_at
        ))
    return out

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document not found")
    if doc.owner_id != current_user.id:
        raise PermissionDeniedError("You do not have access to this document")

    entities = json.loads(doc.key_entities_json) if doc.key_entities_json else {}
    return DocumentResponse(
        id=doc.id,
        original_filename=doc.original_filename,
        mime_type=doc.mime_type,
        file_size_bytes=doc.file_size_bytes,
        page_count=doc.page_count,
        processing_status=doc.processing_status,
        summary=doc.summary,
        summary_hi=doc.summary_hi,
        key_entities=entities,
        created_at=doc.created_at
    )

@router.post("/{document_id}/summarize", response_model=DocumentSummaryResponse)
async def summarize_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document not found")
    if doc.owner_id != current_user.id:
        raise PermissionDeniedError("You do not have access to this document")

    summary_data = await document_service.summarize_document(
        text=doc.extracted_text or "",
        original_filename=doc.original_filename
    )

    doc.summary = summary_data["summary"]
    doc.summary_hi = summary_data["summary_hi"]
    await db.commit()

    return DocumentSummaryResponse(
        document_id=doc.id,
        summary=summary_data["summary"],
        summary_hi=summary_data["summary_hi"],
        important_dates=summary_data["important_dates"],
        amounts_mentioned=summary_data["amounts_mentioned"],
        action_items=summary_data["action_items"],
        confidence="high"
    )

@router.post("/{document_id}/ask", response_model=DocumentAskResponse)
async def ask_document(
    document_id: str,
    payload: DocumentAskRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document not found")
    if doc.owner_id != current_user.id:
        raise PermissionDeniedError("You do not have access to this document")

    qa_result = await document_service.answer_question(
        text=doc.extracted_text or "",
        question=payload.question,
        language=payload.language or "hi"
    )

    return DocumentAskResponse(
        question=payload.question,
        answer=qa_result["answer"],
        language=qa_result["language"],
        page_references=qa_result["page_references"],
        evidence_snippets=qa_result["evidence_snippets"],
        confidence=qa_result["confidence"]
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise NotFoundError("Document not found")
    if doc.owner_id != current_user.id:
        raise PermissionDeniedError("You do not have access to this document")

    # Secure file removal from disk
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return {"message": "Document successfully deleted", "status": "success"}
