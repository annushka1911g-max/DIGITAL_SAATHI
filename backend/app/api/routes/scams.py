import json
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.models.scam import ScamAnalysis
from backend.app.models.task import TaskHistory
from backend.app.schemas.scam import ScamAnalyzeRequest, ScamAnalyzeResponse
from backend.app.services.scam_service import scam_service
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/scams", tags=["Scam Saathi"])

@router.post("/analyze", response_model=ScamAnalyzeResponse)
async def analyze_message(
    payload: ScamAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = scam_service.analyze_message(payload.message, language=payload.language or "hi")

    # Save analysis audit record
    scam_record = ScamAnalysis(
        owner_id=current_user.id,
        input_text=payload.message[:200],  # store sanitized snippet to preserve user privacy
        risk_level=result["risk_level"],
        confidence_score=result["confidence_score"],
        detected_signs_json=json.dumps([s.model_dump() for s in result["detected_warning_signs"]]),
        explanations_json=json.dumps([result["simple_explanation"]]),
        recommended_actions_json=json.dumps(result["recommended_actions"]),
        language=result["language"],
        analysis_version="1.0.0"
    )
    db.add(scam_record)

    # Log task history
    task = TaskHistory(
        owner_id=current_user.id,
        task_type="scam_analysis",
        title=f"संदेश जाँच: {payload.message[:25]}... (जोखिम: {result['risk_level']})",
        status="completed"
    )
    db.add(task)
    await db.commit()
    await db.refresh(scam_record)

    return ScamAnalyzeResponse(
        id=scam_record.id,
        risk_level=result["risk_level"],
        confidence_score=result["confidence_score"],
        detected_warning_signs=result["detected_warning_signs"],
        simple_explanation=result["simple_explanation"],
        recommended_actions=result["recommended_actions"],
        official_reporting_links=result["official_reporting_links"],
        language=result["language"],
        created_at=scam_record.created_at
    )
