from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.schemas.form import FormExplainRequest, FormExplainResponse, FormParseResponse
from backend.app.services.form_service import form_service
from backend.app.core.exceptions import NotFoundError, PermissionDeniedError
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/forms", tags=["Form Saathi"])

@router.post("/explain", response_model=FormExplainResponse)
async def explain_field(
    payload: FormExplainRequest,
    current_user: User = Depends(get_current_user)
):
    return await form_service.explain_field(
        field_label=payload.field_label,
        context=payload.form_context,
        language=payload.language or "hi"
    )

@router.post("/parse/{document_id}", response_model=FormParseResponse)
async def parse_form_document(
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

    return form_service.parse_fields_from_text(
        document_id=doc.id,
        text=doc.extracted_text or ""
    )
