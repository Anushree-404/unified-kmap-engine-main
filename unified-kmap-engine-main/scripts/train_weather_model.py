"""
AGROVA AI — Weather model training entry point (project root convenience wrapper).

Delegates to: ML_MODEL/training/train_weather_model.py
"""
import runpy
from pathlib import Path

canonical = Path(__file__).resolve().parents[1] / "ML_MODEL" / "training" / "train_weather_model.py"
runpy.run_path(str(canonical), run_name="__main__")
