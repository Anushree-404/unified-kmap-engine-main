"""
Preprocessing pipeline for the crop fertilizer recommendation dataset.

Input:  ML_MODEL/dataset/raw/crop_fertilizer_recommendation_dataset.csv
Output: ML_MODEL/dataset/processed/fertilizer_processed.csv
        ML_MODEL/reports/fertilizer_preprocessing_report.txt
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.preprocessing import LabelEncoder

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "dataset" / "raw"
PROCESSED_DIR = ROOT / "dataset" / "processed"
REPORTS_DIR = ROOT / "reports"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = RAW_DIR / "crop_fertilizer_recommendation_dataset.csv"
OUTPUT_FILE = PROCESSED_DIR / "fertilizer_processed.csv"
REPORT_FILE = REPORTS_DIR / "fertilizer_preprocessing_report.txt"


def run() -> None:
    report: list[str] = []

    def log(msg: str) -> None:
        print(msg)
        report.append(msg)

    log("=" * 60)
    log("AGROVA AI — Fertilizer Recommendation Preprocessing")
    log("=" * 60)

    log(f"\n[1] Loading: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)
    log(f"    Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    log(f"    Columns: {list(df.columns)}")

    missing = df.isnull().sum()
    log("\n[2] Missing values:")
    log(missing[missing > 0].to_string() if missing.any() else "    None")
    df = df.dropna()
    df = df.drop_duplicates()

    # Encode categorical columns
    cat_cols = df.select_dtypes(include="object").columns.tolist()
    log(f"\n[3] Encoding categorical columns: {cat_cols}")
    encoders: dict[str, LabelEncoder] = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[f"{col}_encoded"] = le.fit_transform(df[col])
        encoders[col] = le
        log(f"    {col}: {list(le.classes_[:5])}{'...' if len(le.classes_) > 5 else ''}")

    df.to_csv(OUTPUT_FILE, index=False)
    log(f"\n[4] Saved processed data → {OUTPUT_FILE}")
    log(f"    Final shape: {df.shape}")
    log("\n[OK] Preprocessing complete.")

    REPORT_FILE.write_text("\n".join(report), encoding="utf-8")
    print(f"Report saved → {REPORT_FILE}")


if __name__ == "__main__":
    run()
