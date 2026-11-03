# AGROVA AI — ML_MODEL

All machine learning resources for the AGROVA AI platform: datasets, preprocessing scripts, training scripts, evaluation, inference utilities, and reports.

---

## Directory Structure

```
ML_MODEL/
├── dataset/
│   ├── raw/                           # Original unmodified CSVs
│   │   ├── Crop_recommendation (1).csv
│   │   ├── crop_fertilizer_recommendation_dataset.csv
│   │   ├── irrigation_prediction.csv
│   │   ├── rainfall.csv
│   │   ├── soil_data.csv
│   │   ├── temp.csv
│   │   ├── weather_data.csv
│   │   └── yield.csv
│   └── processed/                     # Cleaned, encoded, feature-engineered data
│       ├── crop_recommendation_processed.csv
│       ├── crop_recommendation_features.csv
│       ├── irrigation_processed.csv
│       └── fertilizer_processed.csv
│
├── preprocessing/
│   ├── preprocess_crop.py             # Crop recommendation dataset pipeline
│   ├── preprocess_irrigation.py       # Irrigation prediction dataset pipeline
│   └── preprocess_fertilizer.py       # Fertilizer recommendation dataset pipeline
│
├── feature_engineering/
│   └── feature_engineering_crop.py   # Interaction, polynomial & ratio features
│
├── training/
│   ├── train_crop_model.py           # Random Forest → crop-model.ts + .json + .pkl
│   ├── train_models.py               # RF / GBM / CatBoost → irrigation models
│   └── train_weather_model.py        # LSTM → weather_forecast_model.keras
│
├── models/                           # Trained model artifacts (git-ignored)
│   ├── crop_rf_model.pkl
│   ├── best_model.pkl
│   ├── random_forest.pkl
│   ├── gradient_boosting.pkl
│   ├── catboost.pkl                  (if CatBoost installed)
│   ├── weather_forecast_model.keras  (if TensorFlow installed)
│   └── results_summary.pkl
│
├── evaluation/
│   ├── evaluate_crop_model.py        # Classification report + confusion matrix
│   ├── classification_report_crop.txt
│   ├── confusion_matrix_crop.png
│   └── visualizations/
│       ├── feature_importance.png
│       ├── confusion_matrices.png
│       ├── roc_curves.png
│       └── model_comparison.png
│
├── reports/                          # Auto-generated text reports
│   ├── preprocessing_report.txt
│   ├── irrigation_preprocessing_report.txt
│   ├── fertilizer_preprocessing_report.txt
│   ├── feature_engineering_report.txt
│   ├── model_training_report.txt
│   ├── evaluation_report.txt
│   └── weather_training_report.txt
│
├── inference/
│   └── crop_inference.py             # Standalone prediction function + CLI
│
├── scripts/
│   ├── check_datasets.py             # Verify all CSVs are present
│   ├── check_models.py               # Verify model artifacts + smoke test
│   ├── train_crop_model.py           # Symlink/copy of training script
│   └── train_weather_model.py        # Symlink/copy of training script
│
├── requirements.txt
└── README.md                         ← this file
```

---

## Prerequisites

- Python 3.11+
- pip

---

## Setup

```bash
cd ML_MODEL
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate
# Activate (macOS/Linux)
source .venv/bin/activate

pip install -r requirements.txt
```

For weather LSTM training, also install TensorFlow:
```bash
pip install tensorflow==2.18.0
```

For CatBoost irrigation model:
```bash
pip install catboost==1.2.7
```

---

## Workflow

### 1 — Verify datasets

```bash
python scripts/check_datasets.py
```

### 2 — Preprocess

```bash
python preprocessing/preprocess_crop.py
python preprocessing/preprocess_irrigation.py
python preprocessing/preprocess_fertilizer.py
```

### 3 — Feature engineering

```bash
python feature_engineering/feature_engineering_crop.py
```

### 4 — Train models

```bash
# Crop recommendation (generates FRONTEND/src/data/crop-model.ts + .json)
python training/train_crop_model.py

# Irrigation prediction (generates ML_MODEL/models/best_model.pkl etc.)
python training/train_models.py

# Weather LSTM (requires TensorFlow + internet access)
python training/train_weather_model.py
```

### 5 — Evaluate

```bash
python evaluation/evaluate_crop_model.py
```

### 6 — Verify model artifacts

```bash
python scripts/check_models.py
```

---

## Datasets

| File | Purpose | Rows (approx) |
|------|---------|---------------|
| `Crop_recommendation (1).csv` | Crop classification | 2,200 |
| `crop_fertilizer_recommendation_dataset.csv` | Fertilizer recommendation | — |
| `irrigation_prediction.csv` | Irrigation need classification | — |
| `rainfall.csv` | Historical rainfall data | — |
| `soil_data.csv` | Soil nutrient profiles | — |
| `temp.csv` | Temperature records | — |
| `weather_data.csv` | Multi-variable weather history | — |
| `yield.csv` | Historical crop yield records | — |

---

## How Models Integrate with FRONTEND and BACKEND

```
train_crop_model.py
        │
        ▼
FRONTEND/src/data/crop-model.ts   ← bundled into Vite build (client-side RF inference)
FRONTEND/src/data/crop-model.json ← read by BACKEND ml_inference.py at runtime
ML_MODEL/models/crop_rf_model.pkl ← used by evaluation scripts
        │
        ▼
BACKEND/app/services/ml_inference.py  → POST /api/crop/recommend
```

The crop model runs **in-browser** via the TypeScript port (zero latency, no server call needed).  
The BACKEND service loads the JSON copy for server-side inference or API-level calls.

---

## Reports

All training and evaluation scripts append timestamped reports to `ML_MODEL/reports/`.  
Do not edit these files manually — they are always regenerated by the scripts.
