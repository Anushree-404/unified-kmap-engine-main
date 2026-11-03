"""
AGROVA AI — Crop model training entry point (project root convenience wrapper).

This file re-exports the canonical training script at:
    ML_MODEL/training/train_crop_model.py

Run from the project root:
    python scripts/train_crop_model.py

Or run the canonical script directly:
    python ML_MODEL/training/train_crop_model.py
"""
import runpy
from pathlib import Path

canonical = Path(__file__).resolve().parents[1] / "ML_MODEL" / "training" / "train_crop_model.py"
runpy.run_path(str(canonical), run_name="__main__")
