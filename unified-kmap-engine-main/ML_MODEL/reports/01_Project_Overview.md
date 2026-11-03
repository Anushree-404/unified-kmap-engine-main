# 01 — Project Overview

**AGROVA AI: Data-Driven Farming Recommendation and Smart Crop Disease Detection System**

---

## 1. Project Introduction

AGROVA AI is a full-stack, AI-powered precision agriculture web platform designed to help farmers, cooperatives, agritech enterprises, and government bodies make evidence-based decisions across the crop lifecycle. It combines machine learning models, real-time weather intelligence, geospatial mapping, and a multilingual advisory chatbot in a single browser-accessible application.

The frontend is a **TanStack Start** (React 19 / TypeScript / Vite) SSR application deployable to Cloudflare Workers. The backend is a **Python FastAPI** service. Machine learning models are trained offline and consumed either by the frontend at runtime (client-side inference for crop recommendation) or by the backend API (server-side inference).

---

## 2. Problem Statement

Indian smallholder farmers face persistent productivity challenges:

- Lack of data-driven crop selection guidance leads to mismatched crops and soil/climate conditions.
- Disease identification relies on visual inspection without quantitative confidence measures.
- Weather-related crop losses occur due to insufficient advance forecast access.
- Advisory information is unavailable in local languages.

AGROVA AI addresses these gaps by delivering AI-generated recommendations, forecasts, and advisory content directly to the browser with no external ML API dependency.

---

## 3. Objectives

1. Implement a Random Forest crop recommendation model trained on soil-nutrient and climate features.
2. Provide a 15-day weather forecast using a ridge-regression model trained on ERA5 reanalysis data.
3. Deliver interactive crop advisory in English and Kannada via a rule-based chatbot.
4. Provide soil, land-cover, and place-analysis for any clicked coordinate on the Coastal Karnataka KMap.
5. Present a disease detection demo interface (UI-level mockup with sample diagnoses; no trained CNN exists in the current codebase).
6. Make the entire inference pipeline available in the browser without calling any external ML API.

---

## 4. AGROVA AI Architecture

```
User Browser
     │
     ▼  HTTPS
FRONTEND (TanStack Start SSR — Nitro / Cloudflare Workers)
     │
     ├── Client-side: Crop RF inference (crop-model.ts embedded in JS bundle)
     ├── Server functions: Weather, soil (SoilGrids), land cover (OpenStreetMap), place (Google Maps)
     └── Server function: 15-day forecast (ridge regression, weather-model.json)
     │
     ▼  HTTP REST
BACKEND (FastAPI — Python 3.11)
     │
     ├── POST /api/crop/recommend  →  ml_inference.py  →  crop-model.json
     └── GET  /api/health
     │
     ▼  File system (model artifacts)
ML_MODEL/
     ├── dataset/raw/               — 8 raw CSV datasets
     ├── dataset/processed/         — 9 preprocessed CSV files
     ├── training/                  — Python training scripts
     ├── models/                    — Trained .pkl artifacts (post-training)
     └── Reports/                   — This documentation
```

---

## 5. ML Modules

| # | Module | Algorithm | Implementation Status |
|---|--------|-----------|----------------------|
| 1 | Crop Recommendation | Random Forest Classifier | **Implemented and deployed** — model embedded in frontend bundle |
| 2 | 15-Day Weather Forecast | Ridge Regression (multi-horizon) | **Implemented and deployed** — model embedded as weather-model.json |
| 3 | Agricultural Advisory Chatbot | Rule-based keyword matching | **Implemented** — no trained ML model; rule engine in TypeScript |
| 4 | Crop Disease Detection | CNN (planned) | **Not implemented** — UI mockup with static sample diagnoses |
| 5 | Irrigation Prediction | RF / GBM / CatBoost | **Script exists** — not integrated into frontend or backend |

---

## 6. Algorithms Used

### 6.1 Random Forest Classifier (Crop Recommendation)

An ensemble of 80 decision trees trained with:
- `n_estimators = 80`
- `max_depth = 12`
- `random_state = 42`
- `test_size = 0.2` (stratified)

Each tree votes on the class; the final prediction is the majority vote. The model is serialised to JSON and TypeScript for in-browser inference.

### 6.2 Ridge Regression (Weather Forecast)

A multi-horizon direct regression model trained offline on ~22 years of ERA5 daily reanalysis data for five Coastal Karnataka taluks (~39,000 samples, 29 features). Produces day-ahead predictions for:
- Maximum temperature (°C)
- Minimum temperature (°C)
- Daily precipitation (mm)
- Mean relative humidity (%)

Evaluation metric: Mean Absolute Error (MAE) on the held-out last 15% of the time series.

### 6.3 Rule-Based Advisory (Chatbot)

The `AgronomistChat` component implements a keyword-lookup engine across 13 agricultural topic categories in English and Kannada. No ML model is involved.

---

## 7. Dataset Overview

| Dataset File | Rows | Columns | Purpose | Used in Production |
|---|---|---|---|---|
| `Crop_recommendation (1).csv` | 2,200 | 8 | Train crop RF model | Yes |
| `crop_fertilizer_recommendation_dataset.csv` | 2,200 | 13 | Fertilizer reference | No (not yet wired) |
| `irrigation_prediction.csv` | 10,000 | 20 | Irrigation model training | Script only |
| `rainfall.csv` | 6,727 | 3 | Historical rainfall reference | No |
| `soil_data.csv` | 1,000 | 11 | Soil profile reference | No |
| `temp.csv` | 71,311 | 3 | Temperature records reference | No |
| `weather_data.csv` | 1,460 | 12 | Regional weather reference | No |
| `yield.csv` | 56,717 | 12 | Crop yield historical data | No |

---

## 8. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | TanStack Start 1.x (React 19, TypeScript 5, Vite 8) |
| Styling | Tailwind CSS v4, shadcn/ui (Radix UI) |
| Routing | TanStack Router (file-based) |
| ML — Crop model training | Python 3.11, scikit-learn 1.5, pandas 2.2, joblib 1.4 |
| ML — Crop model inference | Pure TypeScript (in-browser Random Forest traversal) |
| ML — Weather model | Pre-trained Ridge Regression embedded in `weather-model.json` |
| Backend API | Python FastAPI 0.115, Uvicorn, Pydantic v2 |
| Package manager (frontend) | Bun |
| Deployment target | Nitro / Cloudflare Workers (frontend), Uvicorn/Gunicorn (backend) |

---

## 9. ML Workflow

```
Raw CSV Dataset
      │
      ▼
Feature Selection (N, P, K, temperature, humidity, ph, rainfall)
      │
      ▼
Train-Test Split (80% train / 20% test, stratified by label)
      │
      ▼
Random Forest Training (80 trees, max_depth=12, random_state=42)
      │
      ▼
Evaluation (accuracy_score, classification_report)
      │
      ├─→ FRONTEND/src/data/crop-model.ts   (TypeScript constant — bundled)
      ├─→ FRONTEND/src/data/crop-model.json (JSON — backend inference)
      └─→ ML_MODEL/models/crop_rf_model.pkl (sklearn pickle — evaluation)
```

---

## 10. Project Scope and Limitations

**In scope (implemented):**
- Crop recommendation via in-browser Random Forest
- 15-day weather forecast via embedded Ridge Regression
- KMap: click-based soil, land cover, weather, and crop analysis for 5 Coastal Karnataka taluks
- Rule-based agricultural advisory chatbot (English + Kannada)
- FastAPI backend with crop recommendation endpoint

**Out of scope / not yet implemented:**
- CNN-based crop disease detection (UI present, no trained model)
- Yield prediction (dataset available, no model wired)
- Fertilizer recommendation model (dataset available, not wired)
- Real-time IoT sensor integration
- Satellite NDVI monitoring
- LLM-powered chatbot
- User authentication and farm profile persistence
