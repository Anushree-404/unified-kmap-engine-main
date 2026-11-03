# 09 — ML Pipeline Execution Log

> This log documents the actual operations performed during the inspection and organization of the AGROVA AI project.  
> Each step states the actual operation, the file or tool used, and the verified outcome.  
> No operation is claimed as executed unless it was actually performed.

---

## Step 1: Project Inspection

| Property | Detail |
|----------|--------|
| Operation | Full project file tree inspection |
| Tool | `list_directory` (recursive, depth 5) |
| Input | `unified-kmap-engine-main/` root |
| Status | ✅ Completed |

**Findings:**
- Identified FRONTEND (TanStack Start + React), BACKEND (FastAPI), ML_MODEL directories
- Found 8 CSV datasets in `ML_MODEL/dataset/raw/`
- Found 3 Python training scripts in `ML_MODEL/training/` and `scripts/`
- Found embedded model files: `crop-model.json` (380 KB), `weather-model.json` in `FRONTEND/src/data/`
- Found no CNN model, no image dataset, no disease detection training script

---

## Step 2: Dataset Discovery

| Property | Detail |
|----------|--------|
| Operation | List and inspect all CSV files |
| Tool | `list_directory`, `Get-ChildItem`, `ReadAllLines` |
| Status | ✅ Completed |

**Files discovered:**

| # | File | Rows | Cols |
|---|------|------|------|
| 1 | Crop_recommendation (1).csv | 2,200 | 8 |
| 2 | crop_fertilizer_recommendation_dataset.csv | 2,200 | 13 |
| 3 | irrigation_prediction.csv | 10,000 | 20 |
| 4 | rainfall.csv | 6,727 | 3 |
| 5 | soil_data.csv | 1,000 | 11 |
| 6 | temp.csv | 71,311 | 3 |
| 7 | weather_data.csv | 1,460 | 12 |
| 8 | yield.csv | 56,717 | 12 |

---

## Step 3: Dataset Loading and Analysis

| Property | Detail |
|----------|--------|
| Operation | Read headers, sample rows, compute statistics |
| Tool | PowerShell `[System.IO.File]::ReadAllLines()` |
| Input | All 8 raw CSV files |
| Status | ✅ Completed |

**Operations performed:**
- Extracted column headers and data types for all 8 datasets
- Read first 2 and last 5 rows of each file
- Computed min/mean/max for 7 numeric features in crop recommendation dataset
- Counted class distributions for crop labels (22 classes × 100 samples each)
- Counted Irrigation_Need distribution (Low: 5,864 / Medium: 3,800 / High: 336)
- Counted Season distribution in irrigation dataset (near-equal: Kharif/Rabi/Zaid)

---

## Step 4: Data Quality Checks

| Property | Detail |
|----------|--------|
| Operation | Missing value check, duplicate detection |
| Tool | PowerShell string splitting, hash table deduplication |
| Status | ✅ Completed |

**Results:**

| Dataset | Missing Values | Duplicates |
|---------|---------------|------------|
| Crop recommendation | 0 | 0 |
| Fertilizer | 0 | 0 |
| Irrigation | 0 | 0 |
| Rainfall | 0 (header whitespace only) | — |
| Soil data | 40 (water_retention col) | — |
| Temp | 0 | — |
| Weather data | 0 | — |
| Yield | 0 | — |

---

## Step 5: Data Preprocessing

| Property | Detail |
|----------|--------|
| Operation | Generate 9 processed CSV files |
| Tool | PowerShell `StreamWriter`, `ReadAllLines`, label encoding |
| Input | `ML_MODEL/dataset/raw/` |
| Output | `ML_MODEL/dataset/processed/` |
| Status | ✅ Completed |

**Files generated:**

| Output File | Rows | Cols | Key Operation |
|-------------|------|------|---------------|
| crop_recommendation_processed.csv | 2,200 | 9 | label_encoded added |
| crop_recommendation_features.csv | 2,200 | 18 | 9 engineered features |
| irrigation_processed.csv | 10,000 | 29 | 9 categorical cols encoded |
| fertilizer_processed.csv | 2,200 | 18 | 5 categorical cols encoded |
| rainfall_processed.csv | 6,727 | 3 | Header whitespace fixed |
| soil_data_processed.csv | 1,000 | 11 | 40 missing values filled |
| temp_processed.csv | 71,311 | 3 | Pass-through copy |
| weather_data_processed.csv | 1,460 | 12 | Pass-through copy |
| yield_processed.csv | 56,717 | 5 | 5 columns selected |

---

## Step 6: Feature Selection (Crop Model)

| Property | Detail |
|----------|--------|
| Operation | Verify feature selection in training script |
| File | `ML_MODEL/training/train_crop_model.py` |
| Status | ✅ Verified from source code |

**Confirmed in source:**
```python
FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
X = frame[FEATURES]
y = frame["label"]
```

---

## Step 7: Train-Test Splitting

| Property | Detail |
|----------|--------|
| Operation | Verify split configuration |
| File | `ML_MODEL/training/train_crop_model.py` |
| Status | ✅ Verified from source code |

**Confirmed:**
- test_size = 0.2 → 440 test samples, 1,760 training samples
- stratify = y → balanced class representation in both splits
- random_state = 42 → reproducible

---

## Step 8: Model Training (Crop RF)

| Property | Detail |
|----------|--------|
| Operation | Verify training script configuration |
| File | `ML_MODEL/training/train_crop_model.py` |
| Status | ✅ Script verified; model output verified from crop-model.json |
| Actual execution | Training was performed (proof: crop-model.json exists with validationAccuracy=0.9955) |

**Verified model metadata from crop-model.json:**
- `"model": "Random Forest Crop Classifier v1"`
- `"validationAccuracy": 0.9955`
- `"trainingRows": 1760`
- `"trees": 80` (counted from `"childrenLeft"` occurrences)
- `"classes": 22` (all 22 crop names present)

---

## Step 9: Model Evaluation

| Property | Detail |
|----------|--------|
| Operation | Extract evaluation metrics |
| Source | `crop-model.json` (validationAccuracy field) |
| Status | ✅ Completed — accuracy verified |

**Verified:** validationAccuracy = 0.9955 (99.55%)

**Note:** Full classification report (per-class precision/recall/F1) is printed by `train_crop_model.py` at runtime but is not stored in any currently committed file (model_training_report.txt is empty until training is run).

---

## Step 10: Model Export

| Property | Detail |
|----------|--------|
| Operation | Verify model export targets |
| Status | ✅ Verified from file existence |

| Output | Path | Status |
|--------|------|--------|
| TypeScript constant | `FRONTEND/src/data/crop-model.ts` | ✅ Exists |
| JSON copy | `FRONTEND/src/data/crop-model.json` | ✅ Exists (large file) |
| sklearn pickle | `ML_MODEL/models/crop_rf_model.pkl` | ⚠️ Generated when training script runs |

---

## Step 11: Application Integration Check

| Property | Detail |
|----------|--------|
| Operation | Trace model usage in application code |
| Files checked | `crop-recommendation.ts`, `demo.tsx`, `analysis.functions.ts` |
| Status | ✅ Completed |

**Integration verified:**
- `FRONTEND/src/lib/crop-recommendation.ts` imports `CROP_MODEL` from `crop-model.ts` and implements in-browser RF inference
- `FRONTEND/src/routes/demo.tsx` uses `CROP_RECOMMENDATION_MODEL` string from `crop-recommendation.ts`
- `FRONTEND/src/lib/analysis.functions.ts` uses `scoreCrops()` (rule-based crop suitability — separate from the RF model)
- FastAPI `BACKEND/app/services/ml_inference.py` reads `crop-model.json` for server-side inference

---

## Step 12: Prediction Testing

| Property | Detail |
|----------|--------|
| Operation | Verify prediction pathway end-to-end |
| Status | ⚠️ Partial — code verified; live inference requires running server |

**Verified:**
- TypeScript inference traverses 80 decision trees using threshold comparisons
- Returns sorted class scores as percentages
- Backend reads the same JSON model and follows equivalent logic in Python

**Not verified (requires running app):**
- Actual live prediction output for specific input values

---

## Step 13: Disease Detection — Not Found

| Property | Detail |
|----------|--------|
| Operation | Search for CNN model, training scripts, image dataset |
| Result | Not found — confirmed UI mockup only |
| Status | ❌ CNN not implemented |

**Search performed across:**
- All `.py` files in FRONTEND, BACKEND, ML_MODEL, scripts
- All `.ts` / `.tsx` files in FRONTEND/src
- All JSON files in FRONTEND/src/data
- Root-level directories

No CNN model file, training script, or disease image dataset was found.

---

## Summary of Pipeline Execution

| Step | Operation | Status |
|------|-----------|--------|
| 1 | Project inspection | ✅ Done |
| 2 | Dataset discovery | ✅ Done |
| 3 | Dataset loading and stats | ✅ Done |
| 4 | Data quality checks | ✅ Done |
| 5 | Data preprocessing (9 files) | ✅ Done |
| 6 | Feature selection verification | ✅ Done |
| 7 | Train-test split verification | ✅ Done |
| 8 | Model training verification | ✅ Done (output exists) |
| 9 | Model evaluation | ✅ Done (accuracy verified) |
| 10 | Model export | ✅ Done (files exist) |
| 11 | Application integration | ✅ Done (code traced) |
| 12 | Live prediction test | ⚠️ Partial (needs running server) |
| 13 | CNN disease detection search | ❌ Not found |
