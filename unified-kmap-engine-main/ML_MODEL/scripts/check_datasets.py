"""
Dataset verification script.
Checks that all expected CSV files exist in ML_MODEL/dataset/raw/
and prints a summary of each.

Usage:
    python ML_MODEL/scripts/check_datasets.py
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ML_ROOT / "dataset" / "raw"

EXPECTED_FILES = [
    "Crop_recommendation (1).csv",
    "crop_fertilizer_recommendation_dataset.csv",
    "irrigation_prediction.csv",
    "rainfall.csv",
    "soil_data.csv",
    "temp.csv",
    "weather_data.csv",
    "yield.csv",
]

print("=" * 60)
print("AGROVA AI — Dataset Verification")
print("=" * 60)
print(f"Looking in: {RAW_DIR}\n")

all_ok = True
for fname in EXPECTED_FILES:
    path = RAW_DIR / fname
    if path.exists():
        try:
            df = pd.read_csv(path, nrows=5)
            size_kb = path.stat().st_size // 1024
            print(f"  ✓  {fname}")
            print(f"       Size   : {size_kb} KB")
            print(f"       Columns: {list(df.columns)}")
        except Exception as e:
            print(f"  ✗  {fname} — could not read: {e}")
            all_ok = False
    else:
        print(f"  ✗  {fname} — MISSING")
        all_ok = False
    print()

if all_ok:
    print("[OK] All datasets present.")
else:
    print("[WARN] Some datasets are missing. Check the list above.")
