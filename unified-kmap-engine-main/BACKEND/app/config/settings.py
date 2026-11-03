"""
Application configuration loaded from environment variables.
Uses pydantic-settings for validation and .env file support.
"""
from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings."""

    # ── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "AGROVA AI Backend"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Server ────────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed frontend origins
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── ML model paths ────────────────────────────────────────────────────────
    ML_MODEL_DIR: Path = Path(__file__).resolve().parents[3] / "ML_MODEL" / "models"

    # ── API keys (server-side only — never send to client) ────────────────────
    GOOGLE_MAPS_API_KEY: str = ""
    OPENWEATHER_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # ── Database (optional — not yet wired) ───────────────────────────────────
    DATABASE_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton of application settings."""
    return Settings()
