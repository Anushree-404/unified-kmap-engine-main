"""
Model artifact verification script.
Checks which trained model files exist in ML_MODEL/models/ and
tests that the crop inference pipeline works end-to-end.

Usage:
    python ML_MODEL/scripts/check_models.py
"""
from __future__ import annotations

from pathlib import Path

ML_ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ML_ROOT / "models"
FRONTEND_DATA = ML_ROOT.parent / "FRONTEND" / "src" / "data"

EXPECTED_MODELS = [
    MODELS_DIR / "crop_rf_model.pkl",
    MODELS_DIR / "best_model.pkl",
    MODELS_DIR / "random_forest.pkl",
    MODELS_DIR / "gradient_boosting.pkl",
    FRONTEND_DATA / "crop-model.json",
    FRONTEND_DATA / "crop-model.ts",
    FRONTEND_DATA / "weather-model.json",
]

print("=" * 60)
print("AGROVA AI — Model Artifact Check")
print("=" * 60)

for p in EXPECTED_MODELS:
    if p.exists():
        size_kb = p.stat().st_size // 1024
        print(f"  ✓  {p.relative_to(ML_ROOT.parent)}  ({size_kb} KB)")
    else:
        print(f"  ✗  {p.relative_to(ML_ROOT.parent)}  — NOT FOUND")

# Quick end-to-end crop inference test
print("\n── Crop Inference Smoke Test ─────────────────────────")
try:
    import sys
    sys.path.insert(0, str(ML_ROOT / "inference"))
    from crop_inference import predict, validate_input  # type: ignore

    validate_input(nitrogen=90, phosphorus=42, potassium=43,
                   temperature=20.9, humidity=82.0, ph=6.5, rainfall=202.9)
    results = predict(90, 42, 43, 20.9, 82.0, 6.5, 202.9, top_n=3)
    print(f"  ✓ Inference OK — Top crop: {results[0]['crop']} ({results[0]['score']}%)")
except FileNotFoundError as e:
    print(f"  ✗ Inference failed (model not trained yet): {e}")
except Exception as e:
    print(f"  ✗ Inference error: {e}")
