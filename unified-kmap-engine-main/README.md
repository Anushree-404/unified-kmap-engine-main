# AGROVA AI — Precision Agriculture Intelligence Platform

> "Growing Intelligence. Harvesting Tomorrow."

AGROVA AI is a full-stack, AI-powered precision agriculture platform that unifies crop recommendation, weather intelligence, soil analysis, yield prediction, disease detection, and multilingual farmer advisory in a single web application.

---

## Project Architecture

```
AGROVA/
├── FRONTEND/          React 19 + TanStack Start SSR app (TypeScript, Tailwind CSS)
├── BACKEND/           Python FastAPI service (ML inference API)
├── ML_MODEL/          Datasets, training scripts, models, evaluation, inference
├── docs/              Architecture documents, ADRs, diagrams
├── tests/             Cross-component integration tests
├── .gitignore
├── docker-compose.yml
└── README.md          ← this file
```

### How the three components interact

```
User Browser
     │
     ▼ (HTTPS)
FRONTEND (TanStack Start SSR)
     │  ├─ Client-side crop RF inference  (crop-model.ts embedded in bundle)
     │  ├─ Server functions (weather, soil, land, OSM) — run at the edge
     │  └─ Optional: calls BACKEND REST API for extended ML features
     │
     ▼ (HTTP REST  /api/*)
BACKEND (FastAPI)
     │  ├─ Validates requests (Pydantic)
     │  ├─ Loads crop-model.json + sklearn .pkl files from ML_MODEL/
     │  └─ Returns JSON predictions
     │
     ▼ (file system — model files)
ML_MODEL
     ├─ Training scripts generate model artifacts
     └─ Inference module used by BACKEND service
```

---

## Components

### FRONTEND

| Item | Detail |
|------|--------|
| Framework | TanStack Start 1.x (React 19, TypeScript, Vite 8) |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix UI) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Data fetching | TanStack Query v5 |
| Package manager | Bun |
| Server runtime | Nitro → Cloudflare Workers |

Key features:
- **KMap** — interactive crop advisor for Coastal Karnataka (Leaflet map + ML-backed soil/weather analysis)
- **Crop Recommendation** — in-browser Random Forest inference (zero network latency)
- **15-day Weather Forecast** — ridge regression model running as a TanStack Start server function
- **Multilingual** — English / Kannada with `LanguageProvider` and translation dictionary
- **Responsive** — mobile-first Tailwind layout

### BACKEND

| Item | Detail |
|------|--------|
| Framework | FastAPI 0.115 |
| Server | Uvicorn + Gunicorn |
| Validation | Pydantic v2 |
| Language | Python 3.11+ |

Endpoints:
- `GET  /api/health` — liveness check
- `POST /api/crop/recommend` — crop recommendation (top 5)
- Interactive docs: `http://localhost:8000/docs`

### ML_MODEL

| Module | Algorithm | Dataset |
|--------|-----------|---------|
| Crop recommendation | Random Forest (80 trees, depth 12) | `Crop_recommendation (1).csv` |
| Irrigation prediction | RF / GBM / CatBoost ensemble | `irrigation_prediction.csv` |
| Weather forecasting | Ridge regression (offline ERA5) + LSTM | WeatherEx API |
| Yield prediction | Gradient Boosting Regressor | `yield.csv` |

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js or Bun | ≥ 20 / ≥ 1.1 | Frontend |
| Python | ≥ 3.11 | Backend + ML |
| pip | latest | Python packages |

---

## Installation

### 1 — Clone

```bash
git clone <repository-url>
cd <repository-name>
```

### 2 — Frontend

```bash
cd FRONTEND
cp .env.example .env
# Edit .env: set VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY

bun install         # or: npm install
```

### 3 — Backend

```bash
cd BACKEND
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env: set CORS_ORIGINS and any API keys you need
```

### 4 — ML Model

```bash
cd ML_MODEL
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

---

## Running the Application

### Frontend (development)

```bash
cd FRONTEND
bun run dev         # or: npm run dev
```

Opens at **http://localhost:3000**

### Backend

```bash
cd BACKEND
# Activate your Python virtual environment first
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

API docs at **http://localhost:8000/docs**

### Using Docker (backend only)

```bash
docker-compose up --build
```

---

## ML Model Training

Before the backend can serve ML predictions, train the models:

```bash
cd ML_MODEL
# Activate ML virtual environment

# 1. Verify datasets are present
python scripts/check_datasets.py

# 2. Preprocess
python preprocessing/preprocess_crop.py
python preprocessing/preprocess_irrigation.py

# 3. Train crop model (also writes FRONTEND/src/data/crop-model.ts + .json)
python training/train_crop_model.py

# 4. Train irrigation models
python training/train_models.py

# 5. Evaluate
python evaluation/evaluate_crop_model.py

# 6. Verify all artifacts
python scripts/check_models.py
```

After step 3, rebuild the frontend to bundle the updated crop model:

```bash
cd FRONTEND && bun run build
```

---

## Environment Variables

### FRONTEND (`FRONTEND/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY` | Google Maps JS API key (browser) |
| `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID` | Lovable connector tracking ID |
| `VITE_API_BASE_URL` | Optional: external backend URL |

### BACKEND (`BACKEND/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEBUG` | `false` | Debug logging |
| `PORT` | `8000` | Bind port |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |
| `GOOGLE_MAPS_API_KEY` | — | Server-side Google Maps key |
| `OPENWEATHER_API_KEY` | — | OpenWeather API key |
| `OPENAI_API_KEY` | — | OpenAI key (for AI chatbot) |
| `DATABASE_URL` | — | PostgreSQL connection string |

> **Never commit `.env` files.** Only `.env.example` files (containing no secrets) are tracked in git.

---

## Running Tests

### Frontend (lint)

```bash
cd FRONTEND
bun run lint
```

### Backend

```bash
cd BACKEND
# Activate .venv
pytest tests/ -v
```

---

## Building for Production

### Frontend

```bash
cd FRONTEND
bun run build
# Output: FRONTEND/.output/ (Nitro Cloudflare Workers bundle)
```

### Backend

```bash
# Using Gunicorn in production
cd BACKEND
gunicorn app:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
```

---

## Key Pages (Frontend Routes)

| Route | Description |
|-------|-------------|
| `/` | Home — hero, metrics, features |
| `/kmap` | KMap — interactive Coastal Karnataka crop advisor |
| `/demo` | AI demo — crop recommendation & disease detection |
| `/field-analysis` | Field-level soil + weather + crop analysis |
| `/agronomist` | AI agronomist chat |
| `/solutions` | Platform solutions |
| `/education` | Knowledge hub |
| `/pricing` | Pricing plans |
| `/about` | About AGROVA AI |
| `/contact` | Contact form |

---

## Project Documentation

| Document | Location |
|----------|---------|
| Frontend setup | `FRONTEND/README.md` |
| Backend setup | `BACKEND/README.md` |
| ML model guide | `ML_MODEL/README.md` |
| Route conventions | `FRONTEND/src/routes/README.md` |
| ML tech stack | `ML_TECH_STACK.md` |

---

## Built With

This project was initially scaffolded with [Lovable](https://lovable.dev) and continues to be developed with Kiro AI.

> Commits to the connected branch sync back to Lovable. Avoid force-pushing or rewriting published git history.
