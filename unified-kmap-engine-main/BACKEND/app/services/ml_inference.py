"""
ML inference service — loads trained models from ML_MODEL/models/ and
exposes prediction functions consumed by controllers.

The service lazy-loads models on first use to keep startup fast.
Model files are written by the ML_MODEL training scripts:
  - ML_MODEL/training/train_crop_model.py  → crop_rf_model.pkl
  - ML_MODEL/training/train_models.py      → best_model.pkl (irrigation)
"""
from __future__ import annotations

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

ML_MODEL_DIR = Path(__file__).resolve().parents[3] / "ML_MODEL" / "models"
FRONTEND_DATA_DIR = (
    Path(__file__).resolve().parents[3] / "FRONTEND" / "src" / "data"
)


# ── Crop recommendation ───────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_crop_model() -> dict[str, Any]:
    """Load the serialised crop random-forest from the FRONTEND data directory.

    The model is stored as a TypeScript file (crop-model.ts) but also as a
    plain JSON file (crop-model.json) that is more convenient for Python.
    Falls back to the .ts file by stripping the export declaration.
    """
    json_path = FRONTEND_DATA_DIR / "crop-model.json"
    ts_path = FRONTEND_DATA_DIR / "crop-model.ts"

    if json_path.exists():
        with json_path.open(encoding="utf-8") as f:
            return json.load(f)

    if ts_path.exists():
        text = ts_path.read_text(encoding="utf-8")
        # Strip "export const CROP_MODEL = " prefix and trailing "as const;\n"
        start = text.index("{")
        end = text.rindex("}") + 1
        return json.loads(text[start:end])

    raise FileNotFoundError(
        "crop-model.json not found. Run ML_MODEL/training/train_crop_model.py first."
    )


def predict_crop(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
    top_n: int = 5,
) -> list[dict[str, Any]]:
    """Run the embedded Random Forest for crop recommendation.

    Returns a list of ``{"crop": str, "score": float}`` dicts sorted by score
    descending (score is a percentage 0–100).
    """
    model = _load_crop_model()
    features = FEATURES = model["features"]  # ["N","P","K","temperature","humidity","ph","rainfall"]
    values = [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]
    feature_map = dict(zip(features, values))

    classes: list[str] = model["classes"]
    trees: list[dict[str, Any]] = model["trees"]
    votes = [0.0] * len(classes)

    for tree in trees:
        node = 0
        while tree["childrenLeft"][node] != -1:
            feat_idx = tree["features"][node]
            feat_name = FEATURES[feat_idx]
            val = feature_map[feat_name]
            if val <= tree["thresholds"][node]:
                node = tree["childrenLeft"][node]
            else:
                node = tree["childrenRight"][node]
        leaf = tree["values"][node]
        total = sum(leaf) or 1
        for i, v in enumerate(leaf):
            votes[i] += v / total

    n_trees = len(trees)
    results = [
        {"crop": classes[i], "score": round((votes[i] / n_trees) * 100, 1)}
        for i in range(len(classes))
    ]
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]


def get_crop_model_meta() -> dict[str, Any]:
    """Return model name and validation accuracy."""
    model = _load_crop_model()
    return {
        "model": model.get("model", "Random Forest Crop Classifier"),
        "validation_accuracy": model.get("validationAccuracy", 0.0),
    }


# ── Irrigation prediction ─────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_irrigation_model() -> Any:
    """Load the best irrigation model saved by ML_MODEL/training/train_models.py."""
    try:
        import joblib
    except ImportError:
        raise ImportError("joblib is required. Install with: pip install joblib")

    model_path = ML_MODEL_DIR / "best_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(
            f"Irrigation model not found at {model_path}. "
            "Run ML_MODEL/training/train_models.py first."
        )
    return joblib.load(model_path)


def predict_irrigation(features: list[float]) -> dict[str, Any]:
    """Predict whether irrigation is needed.

    Args:
        features: Feature vector matching the training schema from
                  ML_MODEL/dataset/raw/irrigation_prediction.csv.

    Returns:
        Dict with keys ``irrigate`` (bool), ``confidence`` (float),
        ``probability`` (list[float]).
    """
    import numpy as np

    model = _load_irrigation_model()
    X = np.array(features).reshape(1, -1)
    prediction = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0].tolist() if hasattr(model, "predict_proba") else [0.5, 0.5]
    confidence = float(max(proba))
    return {
        "irrigate": bool(prediction),
        "confidence": confidence,
        "probability": proba,
    }
