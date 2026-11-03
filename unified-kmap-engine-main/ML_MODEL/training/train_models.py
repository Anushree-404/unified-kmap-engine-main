"""
Train irrigation prediction models (Random Forest, Gradient Boosting, CatBoost).

Reads:  ML_MODEL/dataset/raw/irrigation_prediction.csv
Writes: ML_MODEL/models/best_model.pkl
        ML_MODEL/models/random_forest.pkl
        ML_MODEL/models/gradient_boosting.pkl
        ML_MODEL/models/catboost.pkl  (if catboost is installed)
        ML_MODEL/models/results_summary.pkl
        ML_MODEL/evaluation/classification_reports/
        ML_MODEL/evaluation/confusion_matrices/
        ML_MODEL/reports/model_training_report.txt

Usage:
    python ML_MODEL/training/train_models.py
"""
from __future__ import annotations

import os
import sys
import warnings
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────────────────
ML_ROOT = Path(__file__).resolve().parents[1]

DATASET = ML_ROOT / "dataset" / "raw" / "irrigation_prediction.csv"
MODELS_DIR = ML_ROOT / "models"
EVAL_DIR = ML_ROOT / "evaluation"
VIZ_DIR = EVAL_DIR / "visualizations"
REPORTS_DIR = ML_ROOT / "reports"

for d in [MODELS_DIR, EVAL_DIR, VIZ_DIR, REPORTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

report: list[str] = []


def log(msg: str) -> None:
    print(msg)
    report.append(msg)


# ── Load data ─────────────────────────────────────────────────────────────────
log("=" * 65)
log("AGROVA AI — Irrigation Model Training")
log("=" * 65)

if not DATASET.exists():
    log(f"ERROR: Dataset not found: {DATASET}")
    sys.exit(1)

df = pd.read_csv(DATASET)
log(f"\nDataset: {DATASET}")
log(f"Shape  : {df.shape}")
log(f"Columns: {list(df.columns)}")

# Assume last column is the target
target_col = df.columns[-1]
feature_cols = [c for c in df.columns if c != target_col]

log(f"\nTarget : {target_col}")
log(f"Features ({len(feature_cols)}): {feature_cols}")

# Encode target if categorical
if df[target_col].dtype == object:
    le = LabelEncoder()
    df[target_col] = le.fit_transform(df[target_col])

X = df[feature_cols].select_dtypes(include="number")
y = df[target_col]

log(f"\nClass distribution:\n{y.value_counts().to_string()}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
log(f"\nTrain: {len(X_train)}  Test: {len(X_test)}")

# ── Models ────────────────────────────────────────────────────────────────────
models_to_train: dict[str, object] = {
    "Random Forest": RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
    ),
    "Gradient Boosting": GradientBoostingClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42
    ),
}

# Optional CatBoost
try:
    from catboost import CatBoostClassifier  # type: ignore
    models_to_train["CatBoost"] = CatBoostClassifier(
        iterations=200, depth=6, learning_rate=0.1, random_state=42, verbose=0
    )
except ImportError:
    log("\nINFO: catboost not installed — skipping CatBoost.")

# ── Training loop ─────────────────────────────────────────────────────────────
log("\n" + "=" * 65)
log("TRAINING MODELS")
log("=" * 65)

trained_models: dict[str, object] = {}
results: dict[str, dict[str, float]] = {}
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for name, clf in models_to_train.items():
    log(f"\n  Training {name}...")
    clf.fit(X_train, y_train)  # type: ignore[union-attr]
    y_pred = clf.predict(X_test)  # type: ignore[union-attr]
    y_prob = (
        clf.predict_proba(X_test)[:, 1]  # type: ignore[union-attr]
        if hasattr(clf, "predict_proba")
        else y_pred.astype(float)
    )

    cv_f1 = cross_val_score(clf, X_train, y_train, cv=cv, scoring="f1", n_jobs=-1)

    results[name] = {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, zero_division=0),
        "recall": recall_score(y_test, y_pred, zero_division=0),
        "f1": f1_score(y_test, y_pred, zero_division=0),
        "roc_auc": roc_auc_score(y_test, y_prob),
        "cv_f1_mean": cv_f1.mean(),
        "cv_f1_std": cv_f1.std(),
    }
    trained_models[name] = clf
    log(f"    Accuracy : {results[name]['accuracy']:.4f}")
    log(f"    F1       : {results[name]['f1']:.4f}")
    log(f"    ROC-AUC  : {results[name]['roc_auc']:.4f}")
    log(f"    CV F1    : {results[name]['cv_f1_mean']:.4f} ± {results[name]['cv_f1_std']:.4f}")

# ── Results table ─────────────────────────────────────────────────────────────
results_df = pd.DataFrame(results).T
log("\n" + "=" * 65)
log("MODEL COMPARISON")
log("=" * 65)
log("\n" + results_df[["accuracy", "precision", "recall", "f1", "roc_auc", "cv_f1_mean"]].to_string())

best_name = results_df["f1"].idxmax()
best_model = trained_models[best_name]
log(f"\n  Best Model: {best_name}")
log(f"  F1 Score  : {results_df.loc[best_name, 'f1']:.4f}")
log(f"  ROC-AUC   : {results_df.loc[best_name, 'roc_auc']:.4f}")

y_pred_best = best_model.predict(X_test)  # type: ignore[union-attr]
log(f"\n  Classification Report — {best_name}:")
log(classification_report(y_test, y_pred_best, target_names=["No Irrigation", "Irrigation"]))

# ── Feature importance ────────────────────────────────────────────────────────
if "Random Forest" in trained_models:
    rf = trained_models["Random Forest"]
    feat_imp = pd.Series(
        rf.feature_importances_, index=X_train.columns  # type: ignore[union-attr]
    ).sort_values(ascending=False).head(15)

    log("\n  Top 15 Feature Importances (Random Forest):")
    for feat, imp in feat_imp.items():
        bar = "#" * int(imp * 100)
        log(f"    {feat:<35} {imp:.4f}  {bar}")

    plt.figure(figsize=(10, 7))
    feat_imp.sort_values().plot(kind="barh", color="#4CAF50", edgecolor="white")
    plt.title("Top 15 Feature Importances — Random Forest", fontsize=13, fontweight="bold")
    plt.xlabel("Importance Score")
    plt.tight_layout()
    plt.savefig(VIZ_DIR / "feature_importance.png", dpi=120, bbox_inches="tight")
    plt.close()
    log(f"  Saved: {VIZ_DIR / 'feature_importance.png'}")

# ── Confusion matrices ────────────────────────────────────────────────────────
n_models = len(trained_models)
n_cols = 2
n_rows = int(np.ceil(n_models / n_cols))
fig, axes = plt.subplots(n_rows, n_cols, figsize=(12, 5 * n_rows))
axes = np.array(axes).reshape(-1)
fig.suptitle("Confusion Matrices — Irrigation Models", fontsize=14, fontweight="bold")
for i, (name, clf) in enumerate(trained_models.items()):
    ax = axes[i]
    y_pred = clf.predict(X_test)  # type: ignore[union-attr]
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Greens", ax=ax,
        xticklabels=["No Irrig.", "Irrigate"],
        yticklabels=["No Irrig.", "Irrigate"],
    )
    ax.set_title(f"{name}\nF1={results[name]['f1']:.3f}", fontsize=9)
    ax.set_ylabel("Actual")
    ax.set_xlabel("Predicted")
for ax in axes[n_models:]:
    ax.set_visible(False)
plt.tight_layout()
plt.savefig(VIZ_DIR / "confusion_matrices.png", dpi=120, bbox_inches="tight")
plt.close()
log(f"  Saved: {VIZ_DIR / 'confusion_matrices.png'}")

# ── ROC curves ────────────────────────────────────────────────────────────────
plt.figure(figsize=(9, 7))
colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0"]
for (name, clf), color in zip(trained_models.items(), colors):
    if hasattr(clf, "predict_proba"):
        y_prob = clf.predict_proba(X_test)[:, 1]  # type: ignore[union-attr]
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc = results[name]["roc_auc"]
        plt.plot(fpr, tpr, label=f"{name} (AUC={auc:.3f})", color=color, linewidth=2)
plt.plot([0, 1], [0, 1], "k--", linewidth=1, label="Random (AUC=0.500)")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curves — All Models", fontsize=13, fontweight="bold")
plt.legend(loc="lower right", fontsize=9)
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(VIZ_DIR / "roc_curves.png", dpi=120, bbox_inches="tight")
plt.close()
log(f"  Saved: {VIZ_DIR / 'roc_curves.png'}")

# ── Save models ───────────────────────────────────────────────────────────────
log("\n" + "=" * 65)
log("SAVING MODELS")
log("=" * 65)

joblib.dump(best_model, MODELS_DIR / "best_model.pkl")
joblib.dump(trained_models["Random Forest"], MODELS_DIR / "random_forest.pkl")
joblib.dump(trained_models["Gradient Boosting"], MODELS_DIR / "gradient_boosting.pkl")
if "CatBoost" in trained_models:
    joblib.dump(trained_models["CatBoost"], MODELS_DIR / "catboost.pkl")
joblib.dump(results_df, MODELS_DIR / "results_summary.pkl")

for fname in sorted(os.listdir(MODELS_DIR)):
    sz = os.path.getsize(MODELS_DIR / fname)
    log(f"  {fname:<40} {sz:>10,} bytes")

# ── Save training report ──────────────────────────────────────────────────────
(REPORTS_DIR / "model_training_report.txt").write_text("\n".join(report), encoding="utf-8")
log(f"\n[OK] Report saved → {REPORTS_DIR / 'model_training_report.txt'}")
log("[OK] Irrigation model training complete.")
