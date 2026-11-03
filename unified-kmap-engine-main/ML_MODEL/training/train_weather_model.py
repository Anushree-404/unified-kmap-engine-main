"""
Weather Prediction LSTM Model Training Script
=============================================

Trains an LSTM neural network to predict 7-day weather patterns.
Model is saved to ML_MODEL/models/weather_forecast_model.keras

Reads live weather data from WeatherEx API (requires internet access).

Usage:
    python ML_MODEL/training/train_weather_model.py
"""
from __future__ import annotations

import json
import pickle
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np

# ── Paths ─────────────────────────────────────────────────────────────────────
ML_ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ML_ROOT / "models"
REPORTS_DIR = ML_ROOT / "reports"

MODELS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODELS_DIR / "weather_forecast_model.keras"
SCALER_PATH = MODELS_DIR / "weather_forecast_scaler.pkl"
REPORT_PATH = REPORTS_DIR / "weather_training_report.txt"

# ── Optional ML library imports ───────────────────────────────────────────────
try:
    from sklearn.preprocessing import MinMaxScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("⚠️  scikit-learn not installed. Install with: pip install scikit-learn")

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.layers import Dense, Dropout, LSTM  # type: ignore
    from tensorflow.keras.models import Sequential  # type: ignore
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    print("⚠️  TensorFlow not installed. Install with: pip install tensorflow")


class WeatherPredictor:
    """LSTM-based weather prediction model."""

    def __init__(self) -> None:
        self.scaler = MinMaxScaler(feature_range=(0, 1)) if HAS_SKLEARN else None
        self.model = None
        self.lookback = 168  # 7 days in hours
        self.feature_names = ["temperature", "humidity", "precipitation", "wind_speed"]
        self.history: dict[str, list[float]] = {"loss": [], "val_loss": [], "mae": [], "val_mae": []}

    def fetch_weatherex_data(self, lat: float, lon: float, days: int = 14) -> list[dict[str, Any]]:
        params = {
            "latitude": str(lat),
            "longitude": str(lon),
            "models": "gfs",
            "resolution": "1h",
            "forecast_days": str(days),
            "variables": "temperature,humidity,precipitation,wind_speed_10m",
        }
        param_str = "&".join(f"{k}={v}" for k, v in params.items())
        url = f"https://meteo.weatherex.ai/api/forecast?{param_str}"
        try:
            print(f"📡 Fetching weather data from WeatherEx ({days} days)...")
            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode())
            rows = data.get("models", [{}])[0].get("rows", [])
            print(f"✓ Retrieved {len(rows)} hourly records")
            return rows
        except urllib.error.URLError as e:
            print(f"❌ Error fetching data: {e}")
            return []

    def prepare_data(
        self, rows: list[dict[str, Any]]
    ) -> tuple[np.ndarray, np.ndarray, list[Any]]:
        if not rows:
            return np.array([]), np.array([]), []

        features = []
        timestamps = []
        for row in rows:
            temp = row.get("temperature")
            if temp is None:
                continue
            features.append([
                float(temp),
                float(row.get("humidity") or 60.0),
                float(row.get("precipitation") or 0.0),
                float(row.get("wind_speed_10m") or 0.0),
            ])
            timestamps.append(row.get("timestamp_key", datetime.now().isoformat()))

        if not features:
            return np.array([]), np.array([]), []

        features_arr = np.array(features, dtype=np.float32)
        if HAS_SKLEARN and self.scaler:
            features_scaled = self.scaler.fit_transform(features_arr)
        else:
            fmin = features_arr.min(axis=0)
            fmax = features_arr.max(axis=0)
            features_scaled = (features_arr - fmin) / (fmax - fmin + 1e-8)

        X, y = [], []
        for i in range(len(features_scaled) - self.lookback):
            X.append(features_scaled[i : i + self.lookback])
            y.append(features_scaled[i + self.lookback])

        return np.array(X), np.array(y), timestamps

    def build_model(self, input_shape: tuple[int, int]) -> None:
        if not HAS_TENSORFLOW:
            return
        self.model = Sequential([
            LSTM(128, return_sequences=True, input_shape=input_shape, name="lstm_1"),
            Dropout(0.2, name="dropout_1"),
            LSTM(128, return_sequences=False, name="lstm_2"),
            Dropout(0.2, name="dropout_2"),
            Dense(64, activation="relu", name="dense_1"),
            Dense(input_shape[1], activation="sigmoid", name="output"),
        ])
        self.model.compile(optimizer="adam", loss="mse", metrics=["mae"])
        self.model.summary()

    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 50, batch_size: int = 32) -> None:
        if not HAS_TENSORFLOW or self.model is None or len(X) < 10:
            return
        early_stop = keras.callbacks.EarlyStopping(
            monitor="val_loss", patience=10, restore_best_weights=True, verbose=1
        )
        history = self.model.fit(
            X, y, epochs=epochs, batch_size=batch_size,
            validation_split=0.2, callbacks=[early_stop], verbose=1,
        )
        self.history = {
            "loss": history.history["loss"],
            "val_loss": history.history["val_loss"],
            "mae": history.history.get("mae", []),
            "val_mae": history.history.get("val_mae", []),
        }

    def save_model(self) -> None:
        if self.model is None:
            return
        self.model.save(str(MODEL_PATH))
        print(f"✓ Model saved → {MODEL_PATH}")
        if HAS_SKLEARN and self.scaler:
            with open(SCALER_PATH, "wb") as f:
                pickle.dump(self.scaler, f)
            print(f"✓ Scaler saved → {SCALER_PATH}")


def main() -> None:
    print("=" * 60)
    print("🌦️  AGROVA AI — Weather Model Trainer")
    print("=" * 60)

    lat, lon = 12.8628, 74.8622  # Mangaluru, Karnataka
    print(f"\n📍 Location: {lat}°N, {lon}°E (Mangaluru)")

    predictor = WeatherPredictor()
    rows = predictor.fetch_weatherex_data(lat, lon, days=14)
    if not rows:
        print("❌ Could not fetch weather data — exiting.")
        sys.exit(1)

    X, y, _ = predictor.prepare_data(rows)
    if X.size == 0:
        print("❌ Insufficient data after preparation — exiting.")
        sys.exit(1)

    if HAS_TENSORFLOW:
        predictor.build_model((predictor.lookback, len(predictor.feature_names)))
        predictor.train(X, y, epochs=50, batch_size=32)
        predictor.save_model()

        report_lines = [
            "AGROVA AI — Weather LSTM Training Report",
            f"Location   : {lat}°N, {lon}°E",
            f"Sequences  : {len(X)}",
            f"Epochs     : {len(predictor.history['loss'])}",
            f"Final loss : {predictor.history['loss'][-1]:.6f}" if predictor.history["loss"] else "N/A",
            f"Val loss   : {predictor.history['val_loss'][-1]:.6f}" if predictor.history["val_loss"] else "N/A",
        ]
        REPORT_PATH.write_text("\n".join(report_lines), encoding="utf-8")
        print(f"Report saved → {REPORT_PATH}")
    else:
        print("⚠️  Skipping model training — TensorFlow not available.")

    print("\n" + "=" * 60)
    print("✅ Weather training pipeline complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
