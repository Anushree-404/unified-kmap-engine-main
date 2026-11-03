# AGROVA AI — Backend

The AGROVA AI backend is a **Python FastAPI** service that:
- Exposes REST API endpoints for ML inference
- Loads trained models from `ML_MODEL/models/`
- Validates all inputs with Pydantic
- Is designed to be called by the FRONTEND (or any HTTP client)

> **Note:** The existing AGROVA frontend uses TanStack Start server functions for most server-side operations (weather, soil, land analysis). This FastAPI backend supplements it with dedicated ML inference endpoints and is the recommended integration point for future features (disease detection, yield prediction, etc.).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115 |
| Server | Uvicorn + Gunicorn |
| Validation | Pydantic v2 |
| ML inference | scikit-learn, joblib, NumPy |
| Language | Python 3.11+ |

---

## Directory Structure

```
BACKEND/
├── app/
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py        # Pydantic-settings configuration
│   ├── controllers/
│   │   ├── __init__.py
│   │   └── crop_controller.py # Validates + delegates to service
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── cors.py            # CORS — only allows configured origins
│   ├── models/
│   │   ├── __init__.py
│   │   ├── crop.py            # Request/response Pydantic models
│   │   └── irrigation.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── crop.py            # POST /api/crop/recommend
│   │   └── health.py          # GET  /api/health
│   ├── services/
│   │   ├── __init__.py
│   │   └── ml_inference.py    # Loads models, runs predictions
│   ├── utils/
│   │   ├── __init__.py
│   │   └── validation.py
│   └── __init__.py
├── tests/
│   ├── __init__.py
│   └── test_crop_endpoint.py
├── .env.example
├── app.py                     # FastAPI application entry point
├── requirements.txt
└── README.md                  ← this file
```

---

## Prerequisites

- Python 3.11+
- pip

---

## Setup

```bash
cd BACKEND
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate
# Activate (macOS/Linux)
source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env to set CORS_ORIGINS, API keys, etc.
```

---

## Running the Server

```bash
# Development (auto-reload on file changes)
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Production
gunicorn app:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`  
ReDoc: `http://localhost:8000/redoc`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/crop/recommend` | Crop recommendation (top 5) |

### POST /api/crop/recommend

**Request body:**
```json
{
  "nitrogen": 90,
  "phosphorus": 42,
  "potassium": 43,
  "temperature": 20.9,
  "humidity": 82.0,
  "ph": 6.5,
  "rainfall": 202.9
}
```

**Response:**
```json
{
  "recommendations": [
    { "crop": "rice", "score": 91.2 },
    { "crop": "maize", "score": 72.5 }
  ],
  "model": "Random Forest Crop Classifier v1",
  "validation_accuracy": 0.9945
}
```

---

## Running Tests

```bash
pytest tests/ -v
```

---

## ML Model Dependency

The inference service reads:
- `FRONTEND/src/data/crop-model.json` — serialised crop Random Forest
- `ML_MODEL/models/best_model.pkl` — best irrigation model (joblib)

Run `ML_MODEL/training/train_crop_model.py` and `ML_MODEL/training/train_models.py` to generate these files before starting the backend.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `false` | Enable debug logging |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `8000` | Bind port |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed frontend origins |
| `GOOGLE_MAPS_API_KEY` | — | Server-side Google Maps key |
| `OPENWEATHER_API_KEY` | — | OpenWeather API key |
| `OPENAI_API_KEY` | — | OpenAI key (for chatbot) |
| `DATABASE_URL` | — | PostgreSQL connection string |
