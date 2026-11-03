"""
/api/health — Liveness / readiness probe.
"""
from fastapi import APIRouter
from pydantic import BaseModel

from app.config import get_settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str


@router.get("/api/health", response_model=HealthResponse, summary="Health check")
def health() -> HealthResponse:
    """Returns 200 OK when the server is running."""
    s = get_settings()
    return HealthResponse(status="ok", app=s.APP_NAME, version=s.APP_VERSION)
