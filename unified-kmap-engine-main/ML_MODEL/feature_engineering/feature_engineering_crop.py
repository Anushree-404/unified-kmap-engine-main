"""
Feature engineering for the crop recommendation model.

Reads:  ML_MODEL/dataset/processed/crop_recommendation_processed.csv
Writes: ML_MODEL/dataset/processed/crop_recommendation_features.csv
        ML_MODEL/reports/feature_engineering_report.txt

Engineering steps:
- Interaction features: N×P, N×K, P×K (nutrient synergy proxies)
- Polynomial features: ph², temperature², rainfall²
- Ratio features: N/P, N/K
- Humidity-temperature stress index
- Feature correlation analysis
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = ROOT / "dataset" / "processed"
REPORTS_DIR = ROOT / "reports"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)

INPUT_FILE = PROCESSED_DIR / "crop_recommendation_processed.csv"
OUTPUT_FILE = PROCESSED_DIR / "crop_recommendation_features.csv"
REPORT_FILE = REPORTS_DIR / "feature_engineering_report.txt"


def run() -> None:
    report: list[str] = []

    def log(msg: str) -> None:
        print(msg)
        report.append(msg)

    log("=" * 60)
    log("AGROVA AI — Crop Recommendation Feature Engineering")
    log("=" * 60)

    log(f"\n[1] Loading processed data: {INPUT_FILE}")
    df = pd.read_csv(INPUT_FILE)
    log(f"    Shape: {df.shape}")

    # Interaction features
    log("\n[2] Creating interaction features:")
    df["NP_interaction"] = df["N"] * df["P"]
    df["NK_interaction"] = df["N"] * df["K"]
    df["PK_interaction"] = df["P"] * df["K"]
    log("    NP_interaction, NK_interaction, PK_interaction")

    # Ratio features
    log("\n[3] Creating ratio features:")
    df["N_P_ratio"] = df["N"] / (df["P"] + 1e-6)
    df["N_K_ratio"] = df["N"] / (df["K"] + 1e-6)
    log("    N_P_ratio, N_K_ratio")

    # Polynomial features
    log("\n[4] Creating polynomial features:")
    df["ph_squared"] = df["ph"] ** 2
    df["temp_squared"] = df["temperature"] ** 2
    df["rainfall_log"] = np.log1p(df["rainfall"])
    log("    ph_squared, temp_squared, rainfall_log")

    # Stress index
    log("\n[5] Creating humidity-temperature stress index:")
    df["humidity_temp_stress"] = df["humidity"] * df["temperature"] / 100
    log("    humidity_temp_stress")

    # Correlation with label_encoded
    if "label_encoded" in df.columns:
        log("\n[6] Top feature correlations with label_encoded:")
        numeric_cols = df.select_dtypes(include="number").columns.drop("label_encoded", errors="ignore")
        corr = df[numeric_cols].corrwith(df["label_encoded"]).abs().sort_values(ascending=False)
        log(corr.head(10).to_string())

    df.to_csv(OUTPUT_FILE, index=False)
    log(f"\n[7] Saved engineered features → {OUTPUT_FILE}")
    log(f"    Final shape: {df.shape}")
    log("\n[OK] Feature engineering complete.")

    REPORT_FILE.write_text("\n".join(report), encoding="utf-8")
    print(f"Report saved → {REPORT_FILE}")


if __name__ == "__main__":
    run()
