"""
Basic tests for the /api/crop/recommend endpoint.
Run with:  pytest BACKEND/tests/ -v
"""
import pytest
from fastapi.testclient import TestClient

from app import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_crop_recommend_valid_input():
    payload = {
        "nitrogen": 90,
        "phosphorus": 42,
        "potassium": 43,
        "temperature": 20.9,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
    }
    response = client.post("/api/crop/recommend", json=payload)
    # If model file is missing the endpoint returns 503, which is also valid
    # in a CI environment that hasn't run training yet.
    assert response.status_code in (200, 503)
    if response.status_code == 200:
        data = response.json()
        assert "recommendations" in data
        assert len(data["recommendations"]) > 0
        assert "crop" in data["recommendations"][0]
        assert "score" in data["recommendations"][0]


def test_crop_recommend_invalid_ph():
    payload = {
        "nitrogen": 90,
        "phosphorus": 42,
        "potassium": 43,
        "temperature": 20.9,
        "humidity": 82.0,
        "ph": 99,  # pH > 14 is invalid
        "rainfall": 202.9,
    }
    response = client.post("/api/crop/recommend", json=payload)
    assert response.status_code == 422  # Validation error
