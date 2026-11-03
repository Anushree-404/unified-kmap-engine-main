"""
Pydantic request / response models for the crop recommendation endpoint.
"""
from pydantic import BaseModel, Field


class CropRecommendationRequest(BaseModel):
    """Input features for crop recommendation."""

    nitrogen: float = Field(..., ge=0, le=300, description="Soil nitrogen (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=300, description="Soil phosphorus (kg/ha)")
    potassium: float = Field(..., ge=0, le=300, description="Soil potassium (kg/ha)")
    temperature: float = Field(..., ge=-10, le=60, description="Mean temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity (%)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH")
    rainfall: float = Field(..., ge=0, description="Annual rainfall (mm)")


class CropPrediction(BaseModel):
    """Single crop prediction with confidence score."""

    crop: str
    score: float = Field(..., ge=0, le=100, description="Confidence score (0–100)")


class CropRecommendationResponse(BaseModel):
    """Ranked list of crop recommendations."""

    recommendations: list[CropPrediction]
    model: str
    validation_accuracy: float
