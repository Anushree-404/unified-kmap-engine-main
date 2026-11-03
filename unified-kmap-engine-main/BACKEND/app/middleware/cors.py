"""
CORS middleware configuration.
Only allows origins listed in settings.CORS_ORIGINS.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings


def add_cors_middleware(app: FastAPI) -> None:
    """Register CORS middleware with the FastAPI application."""
    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )
