"""
AGROVA AI Backend — FastAPI application entry point.

Run with:
    uvicorn app:app --reload --host 0.0.0.0 --port 8000

Or in production:
    gunicorn app:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
"""
import logging

from fastapi import FastAPI

from app.config import get_settings
from app.middleware import add_cors_middleware
from app.routes import register_routes

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(name)s  %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── Middleware ────────────────────────────────────────────────────────────────
add_cors_middleware(app)

# ── Routes ────────────────────────────────────────────────────────────────────
register_routes(app)

logger.info("AGROVA AI Backend started — docs at /docs")
