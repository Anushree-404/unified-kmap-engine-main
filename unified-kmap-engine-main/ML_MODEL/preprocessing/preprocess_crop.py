"""
Preprocessing pipeline for the crop recommendation dataset.

Input:  ML_MODEL/dataset/raw/Crop_recommendation (1).csv
Output: ML_MODEL/dataset/processed/crop_recommendation_processed.csv
        ML_MODEL/reports/preprocessing_report.txt

Steps:
1. Load raw data
2. Check for missing values
3. Check for duplicate rows
4. Validate value ranges for each feature
5. Encode the label column
6. Save processed data and report
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
from sklearn.preprocessing import LabelEncoder

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "dataset" / "raw"
PROCESSED_DIR = ROOT / "dataset" / "processed"
REPORTS_DIR = ROOT / "reports"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = RAW_DIR / "Crop_recommendation (1).csv"
OUTPUT_FILE = PROCESSED_DIR / "crop_recommendation_processed.csv"
REPORT_FILE = REPORTS_DIR / "preprocessing_report.txt"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
LABEL = "label"

VALID_RANGES = {
    "N": (0, 300),
    "P": (0, 300),
    "K": (0, 300),
    "temperature": (-10, 60),
    "humidity": (0, 100),
    "ph": (0, 14),
    "rainfall": (0, 5000),
}


def run() -> None:
    report: list[str] = []

    def log(msg: str) -> None:
        print(msg)
        report.append(msg)

    log("=" * 60)
    log("AGROVA AI — Crop Recommendation Preprocessing")
    log("=" * 60)

    # 1. Load
    log(f"\n[1] Loading: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)
    log(f"    Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    log(f"    Columns: {list(df.columns)}")

    # 2. Missing values
    missing = df.isnull().sum()
    log("\n[2] Missing values:")
    log(missing.to_string())
    df = df.dropna()
    log(f"    After dropna: {df.shape[0]} rows")

    # 3. Duplicates
    dups = df.duplicated().sum()
    log(f"\n[3] Duplicate rows: {dups}")
    df = df.drop_duplicates()
    log(f"    After dedup: {df.shape[0]} rows")

    # 4. Range validation
    log("\n[4] Feature range validation:")
    for col, (lo, hi) in VALID_RANGES.items():
        if col not in df.columns:
            log(f"    WARN: {col} not found in dataset")
            continue
        out = df[(df[col] < lo) | (df[col] > hi)]
        log(f"    {col}: {len(out)} out-of-range values (expected {lo}–{hi})")
    
    # 5. Encode label
    log(f"\n[5] Encoding label column '{LABEL}':")
    le = LabelEncoder()
    df["label_encoded"] = le.fit_transform(df[LABEL])
    classes = list(le.classes_)
    log(f"    Classes ({len(classes)}): {classes[:10]}{'...' if len(classes) > 10 else ''}")

    # 6. Save
    df.to_csv(OUTPUT_FILE, index=False)
    log(f"\n[6] Saved processed data → {OUTPUT_FILE}")
    log(f"    Final shape: {df.shape}")

    log("\n[OK] Preprocessing complete.")

    REPORT_FILE.write_text("\n".join(report), encoding="utf-8")
    print(f"Report saved → {REPORT_FILE}")


if __name__ == "__main__":
    run()
