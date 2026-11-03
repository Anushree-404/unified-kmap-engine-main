"""
Preprocessing pipeline for the irrigation prediction dataset.

Input:  ML_MODEL/dataset/raw/irrigation_prediction.csv
Output: ML_MODEL/dataset/processed/irrigation_processed.csv
        ML_MODEL/reports/irrigation_preprocessing_report.txt
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "dataset" / "raw"
PROCESSED_DIR = ROOT / "dataset" / "processed"
REPORTS_DIR = ROOT / "reports"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = RAW_DIR / "irrigation_prediction.csv"
OUTPUT_FILE = PROCESSED_DIR / "irrigation_processed.csv"
REPORT_FILE = REPORTS_DIR / "irrigation_preprocessing_report.txt"


def run() -> None:
    report: list[str] = []

    def log(msg: str) -> None:
        print(msg)
        report.append(msg)

    log("=" * 60)
    log("AGROVA AI — Irrigation Prediction Preprocessing")
    log("=" * 60)

    log(f"\n[1] Loading: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)
    log(f"    Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    log(f"    Columns: {list(df.columns)}")

    missing = df.isnull().sum()
    log("\n[2] Missing values:")
    log(missing[missing > 0].to_string() if missing.any() else "    None")
    df = df.dropna()

    dups = df.duplicated().sum()
    log(f"\n[3] Duplicate rows: {dups}")
    df = df.drop_duplicates()

    log("\n[4] Data types:")
    log(df.dtypes.to_string())

    log("\n[5] Class distribution (target column):")
    target_col = df.columns[-1]
    log(f"    Target: {target_col}")
    log(df[target_col].value_counts().to_string())

    df.to_csv(OUTPUT_FILE, index=False)
    log(f"\n[6] Saved processed data → {OUTPUT_FILE}")
    log(f"    Final shape: {df.shape}")
    log("\n[OK] Preprocessing complete.")

    REPORT_FILE.write_text("\n".join(report), encoding="utf-8")
    print(f"Report saved → {REPORT_FILE}")


if __name__ == "__main__":
    run()
