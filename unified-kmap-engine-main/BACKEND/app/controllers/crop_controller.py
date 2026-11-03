"""
Controller for crop recommendation: validates input, calls the ML service,
and returns a structured response.
"""
from app.models.crop import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    CropPrediction,
)
from app.services.ml_inference import predict_crop, get_crop_model_meta


def handle_crop_recommendation(
    request: CropRecommendationRequest,
) -> CropRecommendationResponse:
    """Validate input, run inference, return ranked crop predictions."""
    raw = predict_crop(
        nitrogen=request.nitrogen,
        phosphorus=request.phosphorus,
        potassium=request.potassium,
        temperature=request.temperature,
        humidity=request.humidity,
        ph=request.ph,
        rainfall=request.rainfall,
        top_n=5,
    )
    meta = get_crop_model_meta()
    predictions = [CropPrediction(crop=r["crop"], score=r["score"]) for r in raw]
    return CropRecommendationResponse(
        recommendations=predictions,
        model=meta["model"],
        validation_accuracy=meta["validation_accuracy"],
    )
