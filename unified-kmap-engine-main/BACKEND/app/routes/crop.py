"""
/api/crop — Crop recommendation API routes.
"""
from fastapi import APIRouter, HTTPException

from app.controllers.crop_controller import handle_crop_recommendation
from app.models.crop import CropRecommendationRequest, CropRecommendationResponse

router = APIRouter(prefix="/api/crop", tags=["Crop Recommendation"])


@router.post(
    "/recommend",
    response_model=CropRecommendationResponse,
    summary="Get top crop recommendations",
    description=(
        "Given soil nutrients, temperature, humidity, pH and rainfall, "
        "returns the top 5 recommended crops ranked by suitability score."
    ),
)
def recommend_crops(request: CropRecommendationRequest) -> CropRecommendationResponse:
    try:
        return handle_crop_recommendation(request)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal inference error") from exc
