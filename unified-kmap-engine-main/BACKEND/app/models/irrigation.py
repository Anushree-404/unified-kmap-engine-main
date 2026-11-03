"""
Pydantic request / response models for the irrigation prediction endpoint.
"""
from pydantic import BaseModel, Field


class IrrigationRequest(BaseModel):
    """Input features for irrigation need prediction."""

    temperature: float = Field(..., description="Current temperature (°C)")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity (%)")
    rainfall: float = Field(..., ge=0, description="Recent rainfall (mm)")
    soil_moisture: float = Field(..., ge=0, le=100, description="Current soil moisture (%)")
    crop_stage: str = Field(..., description="Crop growth stage (e.g. 'vegetative')")


class IrrigationResponse(BaseModel):
    """Irrigation recommendation result."""

    irrigate: bool
    confidence: float = Field(..., ge=0, le=1)
    recommended_amount_mm: float | None = None
    reason: str
