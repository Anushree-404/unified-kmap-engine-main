"""
Crop recommendation inference module.

Can be used standalone (Python) or called from the BACKEND service.
Reads the crop model from FRONTEND/src/data/crop-model.json (preferred)
or from ML_MODEL/models/crop_rf_model.pkl as a fallback.

Usage:
    python ML_MODEL/inference/crop_inference.py \
        --N 90 --P 42 --K 43 \
        --temperature 20.9 --humidity 82 --ph 6.5 --rainfall 202.9
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ML_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = ML_ROOT.parent
FRONTEND_DATA = PROJECT_ROOT / "FRONTEND" / "src" / "data"
MODELS_DIR = ML_ROOT / "models"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def _load_json_model() -> dict[str, Any] | None:
    for candidate in [FRONTEND_DATA / "crop-model.json", FRONTEND_DATA / "crop-model.ts"]:
        if not candidate.exists():
            continue
        text = candidate.read_text(encoding="utf-8")
        if candidate.suffix == ".ts":
            start = text.index("{")
            end = text.rindex("}") + 1
            text = text[start:end]
        return json.loads(text)
    return None


def _load_sklearn_model():
    pkl = MODELS_DIR / "crop_rf_model.pkl"
    if not pkl.exists():
        return None
    try:
        import joblib
        return joblib.load(pkl)
    except Exception:
        return None


def predict(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
    top_n: int = 5,
) -> list[dict[str, Any]]:
    """Return top-N crop predictions as list of {crop, score} dicts."""
    values = [nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]

    # Prefer JSON model (pure Python, no sklearn needed at inference time)
    model_data = _load_json_model()
    if model_data:
        feature_map = dict(zip(model_data["features"], values))
        classes: list[str] = model_data["classes"]
        trees: list[dict[str, Any]] = model_data["trees"]
        votes = [0.0] * len(classes)

        for tree in trees:
            node = 0
            while tree["childrenLeft"][node] != -1:
                feat_name = model_data["features"][tree["features"][node]]
                val = feature_map[feat_name]
                node = (tree["childrenLeft"][node]
                        if val <= tree["thresholds"][node]
                        else tree["childrenRight"][node])
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

    # Fallback: sklearn pickle
    clf = _load_sklearn_model()
    if clf:
        import numpy as np
        X = np.array(values).reshape(1, -1)
        proba = clf.predict_proba(X)[0]
        classes_sk = list(clf.classes_)
        results = [
            {"crop": classes_sk[i], "score": round(float(proba[i]) * 100, 1)}
            for i in range(len(classes_sk))
        ]
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n]

    raise FileNotFoundError(
        "No crop model found. Run ML_MODEL/training/train_crop_model.py first."
    )


def validate_input(**kwargs: float) -> None:
    """Raise ValueError if any input is out of acceptable range."""
    limits = {
        "nitrogen": (0, 300),
        "phosphorus": (0, 300),
        "potassium": (0, 300),
        "temperature": (-10, 60),
        "humidity": (0, 100),
        "ph": (0, 14),
        "rainfall": (0, 10000),
    }
    for name, (lo, hi) in limits.items():
        if name in kwargs and not (lo <= kwargs[name] <= hi):
            raise ValueError(f"{name} must be between {lo} and {hi}, got {kwargs[name]}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crop recommendation inference")
    parser.add_argument("--N", "--nitrogen", type=float, required=True)
    parser.add_argument("--P", "--phosphorus", type=float, required=True)
    parser.add_argument("--K", "--potassium", type=float, required=True)
    parser.add_argument("--temperature", type=float, required=True)
    parser.add_argument("--humidity", type=float, required=True)
    parser.add_argument("--ph", type=float, required=True)
    parser.add_argument("--rainfall", type=float, required=True)
    parser.add_argument("--top", type=int, default=5)
    args = parser.parse_args()

    try:
        validate_input(
            nitrogen=args.N, phosphorus=args.P, potassium=args.K,
            temperature=args.temperature, humidity=args.humidity,
            ph=args.ph, rainfall=args.rainfall,
        )
        results = predict(
            nitrogen=args.N, phosphorus=args.P, potassium=args.K,
            temperature=args.temperature, humidity=args.humidity,
            ph=args.ph, rainfall=args.rainfall,
            top_n=args.top,
        )
        print(json.dumps(results, indent=2))
    except (ValueError, FileNotFoundError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
