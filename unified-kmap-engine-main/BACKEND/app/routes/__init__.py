from fastapi import FastAPI
from .crop import router as crop_router
from .health import router as health_router


def register_routes(app: FastAPI) -> None:
    """Register all API routers with the FastAPI application."""
    app.include_router(health_router)
    app.include_router(crop_router)
