"""
Evaluate the trained crop recommendation model.

Reads:  ML_MODEL/models/crop_rf_model.pkl
        ML_MODEL/dataset/raw/Crop_recommendation (1).csv
Writes: ML_MODEL/evaluation/classification_report_crop.txt
        ML_MODEL/evaluation/confusion_matrix_crop.png
        ML_MODEL/reports/evaluation_report.txt

Usage:
    python ML_MODEL/evaluation/evaluate_crop_model.py
"""
from __future__ import annotations

from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split

ML_ROOT = Path(__file__).resolve().parents[1]
DATASET = ML_ROOT / "dataset" / "raw" / "Crop_recommendation (1).csv"
MODEL_PATH = ML_ROOT / "models" / "crop_rf_model.pkl"
EVAL_DIR = ML_ROOT / "evaluation"
REPORTS_DIR = ML_ROOT / "reports"

EVAL_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

print("Loading model and dataset...")
model = joblib.load(MODEL_PATH)
df = pd.read_csv(DATASET)

X = df[FEATURES]
y = df["label"]

_, X_test, _, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average="weighted")
clf_report = classification_report(y_test, y_pred)

print(f"Accuracy : {acc:.4f}")
print(f"F1 Score : {f1:.4f}")
print(clf_report)

# Save classification report
(EVAL_DIR / "classification_report_crop.txt").write_text(clf_report, encoding="utf-8")

# Confusion matrix
classes = sorted(y.unique())
cm = confusion_matrix(y_test, y_pred, labels=classes)
fig, ax = plt.subplots(figsize=(max(10, len(classes)), max(8, len(classes) * 0.6)))
sns.heatmap(cm, annot=True, fmt="d", cmap="Greens", ax=ax,
            xticklabels=classes, yticklabels=classes)
ax.set_title("Crop Recommendation — Confusion Matrix", fontsize=13, fontweight="bold")
ax.set_ylabel("Actual")
ax.set_xlabel("Predicted")
plt.tight_layout()
plt.savefig(EVAL_DIR / "confusion_matrix_crop.png", dpi=120, bbox_inches="tight")
plt.close()
print(f"Confusion matrix saved → {EVAL_DIR / 'confusion_matrix_crop.png'}")

report_text = "\n".join([
    "=" * 60,
    "AGROVA AI — Crop Model Evaluation Report",
    "=" * 60,
    f"Model     : {MODEL_PATH}",
    f"Dataset   : {DATASET}",
    f"Test rows : {len(X_test)}",
    f"Accuracy  : {acc:.4f}",
    f"F1 Score  : {f1:.4f}",
    "",
    "Classification Report:",
    clf_report,
])
(REPORTS_DIR / "evaluation_report.txt").write_text(report_text, encoding="utf-8")
print(f"Report saved → {REPORTS_DIR / 'evaluation_report.txt'}")
print("\n[OK] Evaluation complete.")
