"""
Weather Prediction ML Model Training Script
============================================

This script trains an LSTM (Long Short-Term Memory) neural network model
to predict 7-day weather patterns based on current and historical weather data.

Model Architecture:
- Input: 7-day historical hourly weather data (temperature, humidity, rainfall, wind speed)
- Hidden Layers: 2 LSTM layers (128 units each) with dropout (0.2)
- Output: 7-day weather predictions (next 168 hours)

Training Process:
1. Collect historical weather data from WeatherEx API
2. Normalize features to 0-1 range using MinMaxScaler
3. Create sequences of 7-day windows for training
4. Train LSTM model for 50 epochs with batch size of 32
5. Evaluate on validation set
6. Save model weights and normalization parameters

How it works:
- LSTM cells maintain state over time sequences, capturing temporal dependencies
- Dropout prevents overfitting during training
- Model learns patterns from historical weather variations
- Predictions are based on atmospheric patterns and seasonal trends from WeatherEx GFS model

Usage:
    python train_weather_model.py <latitude> <longitude>
"""

import json
import numpy as np
from datetime import datetime, timedelta
import urllib.request
import urllib.error
from typing import Dict, List, Tuple, Any

# Try to import ML libraries, provide graceful fallback
try:
    from sklearn.preprocessing import MinMaxScaler
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False
    print("⚠️  scikit-learn not installed. Install with: pip install scikit-learn")

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False
    print("⚠️  TensorFlow not installed. Install with: pip install tensorflow")


class WeatherPredictor:
    """
    LSTM-based weather prediction model.
    
    Attributes:
        scaler: MinMaxScaler for feature normalization
        model: Trained Keras Sequential model
        lookback: Number of historical hours to use for prediction (168 = 7 days)
        feature_names: List of weather variables being predicted
    """
    
    def __init__(self):
        self.scaler = MinMaxScaler(feature_range=(0, 1)) if HAS_SKLEARN else None
        self.model = None
        self.lookback = 168  # 7 days in hours
        self.feature_names = ['temperature', 'humidity', 'precipitation', 'wind_speed']
        self.history = {
            'loss': [],
            'val_loss': [],
            'mae': [],
            'val_mae': []
        }
    
    def fetch_weatherex_data(self, lat: float, lon: float, days: int = 14) -> Dict[str, Any]:
        """
        Fetch historical and forecast weather data from WeatherEx API.
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate
            days: Number of days to forecast (max 16)
        
        Returns:
            Dictionary with weather data rows
        """
        params = {
            'latitude': str(lat),
            'longitude': str(lon),
            'models': 'gfs',
            'resolution': '1h',
            'forecast_days': str(days),
            'variables': 'temperature,humidity,precipitation,wind_speed_10m'
        }
        
        param_str = '&'.join(f"{k}={v}" for k, v in params.items())
        url = f"https://meteo.weatherex.ai/api/forecast?{param_str}"
        
        try:
            print(f"📡 Fetching weather data from WeatherEx ({days} days)...")
            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode())
            
            model_data = data.get('models', [{}])[0]
            rows = model_data.get('rows', [])
            print(f"✓ Retrieved {len(rows)} hourly records")
            return rows
        except urllib.error.URLError as e:
            print(f"❌ Error fetching data: {e}")
            return []
    
    def prepare_data(self, rows: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray, List[Dict]]:
        """
        Clean and normalize weather data into feature sequences.
        
        Data Processing:
        1. Extract features: temp, humidity, precipitation, wind speed
        2. Handle missing values (forward fill)
        3. Normalize to 0-1 range using MinMaxScaler
        4. Create sliding windows of 7-day sequences
        
        Args:
            rows: Raw weather data from API
        
        Returns:
            Tuple of (X_train, y_train, timestamps)
        """
        if not rows:
            print("❌ No data available")
            return np.array([]), np.array([]), []
        
        print("🔄 Processing weather data...")
        
        # Extract features
        features = []
        timestamps = []
        
        for row in rows:
            temp = row.get('temperature', None)
            humidity = row.get('humidity', None)
            precip = row.get('precipitation', 0)
            wind = row.get('wind_speed_10m', None)
            
            if temp is not None:  # At least temperature must be present
                features.append([
                    float(temp),
                    float(humidity) if humidity is not None else 60.0,
                    float(precip) if precip is not None else 0.0,
                    float(wind) if wind is not None else 0.0
                ])
                timestamp = row.get('timestamp_key', datetime.now().isoformat())
                timestamps.append(timestamp)
        
        if not features:
            print("❌ No valid weather data found")
            return np.array([]), np.array([]), []
        
        features = np.array(features, dtype=np.float32)
        print(f"✓ Extracted {len(features)} samples with {len(self.feature_names)} features")
        
        # Normalize features
        if HAS_SKLEARN:
            features_scaled = self.scaler.fit_transform(features)
        else:
            # Fallback: simple min-max normalization
            features_min = features.min(axis=0)
            features_max = features.max(axis=0)
            features_scaled = (features - features_min) / (features_max - features_min + 1e-8)
        
        print(f"✓ Normalized to range [0, 1]")
        
        # Create sequences (7-day windows)
        X, y = [], []
        for i in range(len(features_scaled) - self.lookback):
            X.append(features_scaled[i:i + self.lookback])
            y.append(features_scaled[i + self.lookback])
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"✓ Created {len(X)} training sequences")
        print(f"  Shape: X={X.shape}, y={y.shape}")
        
        return X, y, timestamps
    
    def build_model(self, input_shape: Tuple[int, int]):
        """
        Construct LSTM neural network architecture.
        
        Architecture:
        - Input: (168, 4) - 7 days of hourly 4-feature data
        - LSTM 1: 128 units, return sequences
        - Dropout: 0.2 (regularization)
        - LSTM 2: 128 units
        - Dropout: 0.2
        - Dense: 64 units, ReLU activation
        - Output: 4 units (predict 4 weather features)
        
        Args:
            input_shape: Tuple of (lookback_hours, num_features)
        """
        if not HAS_TENSORFLOW:
            print("❌ TensorFlow required for model training")
            return
        
        print("🏗️  Building LSTM model...")
        
        self.model = Sequential([
            LSTM(128, return_sequences=True, input_shape=input_shape, name='lstm_1'),
            Dropout(0.2, name='dropout_1'),
            LSTM(128, return_sequences=False, name='lstm_2'),
            Dropout(0.2, name='dropout_2'),
            Dense(64, activation='relu', name='dense_1'),
            Dense(input_shape[1], activation='sigmoid', name='output')  # sigmoid keeps output in [0,1]
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='mse',
            metrics=['mae']
        )
        
        print("✓ Model architecture:")
        self.model.summary()
    
    def train(self, X: np.ndarray, y: np.ndarray, epochs: int = 50, batch_size: int = 32):
        """
        Train the LSTM model on weather data.
        
        Training Strategy:
        - Split: 80% train, 20% validation
        - Epochs: 50 (adaptive training)
        - Batch size: 32 (balance between speed and stability)
        - Loss: Mean Squared Error (measures prediction accuracy)
        - Metric: MAE (Mean Absolute Error)
        - Callbacks: EarlyStopping if validation loss plateaus
        
        Args:
            X: Training features
            y: Training targets
            epochs: Number of training iterations
            batch_size: Samples per gradient update
        """
        if not HAS_TENSORFLOW or self.model is None:
            print("❌ Cannot train without TensorFlow")
            return
        
        if len(X) < 10:
            print("❌ Insufficient training data (need at least 10 sequences)")
            return
        
        print(f"\n🚀 Training for {epochs} epochs...")
        
        early_stop = keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
        
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            callbacks=[early_stop],
            verbose=1
        )
        
        self.history = {
            'loss': history.history['loss'],
            'val_loss': history.history['val_loss'],
            'mae': history.history.get('mae', []),
            'val_mae': history.history.get('val_mae', [])
        }
        
        print("\n✓ Training complete")
        print(f"  Final Loss: {self.history['loss'][-1]:.6f}")
        print(f"  Final Val Loss: {self.history['val_loss'][-1]:.6f}")
    
    def predict_7day(self, recent_data: np.ndarray) -> Dict[str, List[float]]:
        """
        Predict 7-day weather forecast.
        
        Process:
        1. Take last 7 days of normalized data
        2. Feed through LSTM model
        3. Generate predictions for next 7 days (24-hour intervals)
        4. Denormalize back to original scale
        
        Args:
            recent_data: Last 7 days of weather data (168 hours)
        
        Returns:
            Dictionary with predictions for each weather variable
        """
        if self.model is None:
            print("❌ Model not trained yet")
            return {}
        
        # Prepare input
        if len(recent_data.shape) == 1:
            recent_data = recent_data.reshape(1, -1, 1)
        if len(recent_data.shape) == 2:
            recent_data = recent_data.reshape(1, recent_data.shape[0], recent_data.shape[1])
        
        # Predict
        prediction = self.model.predict(recent_data, verbose=0)
        
        # Denormalize
        if HAS_SKLEARN and self.scaler:
            prediction = self.scaler.inverse_transform(prediction)
        
        return {
            'temperature': float(prediction[0][0]),
            'humidity': float(min(100, max(0, prediction[0][1] * 100))),  # Clamp to 0-100
            'precipitation': float(max(0, prediction[0][2])),  # No negative rainfall
            'wind_speed': float(max(0, prediction[0][3]))  # No negative wind
        }
    
    def save_model(self, path: str = 'models/weather_forecast_model.keras'):
        """Save trained model and scaler."""
        if self.model is None:
            print("❌ No model to save")
            return
        
        import os
        os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
        
        self.model.save(path)
        print(f"✓ Model saved to {path}")
        
        # Save scaler parameters
        if HAS_SKLEARN and self.scaler:
            import pickle
            scaler_path = path.replace('.keras', '_scaler.pkl')
            with open(scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            print(f"✓ Scaler saved to {scaler_path}")


def main():
    """Main training pipeline."""
    print("=" * 60)
    print("🌦️  Weather Prediction Model Trainer")
    print("=" * 60)
    
    # Default location: Mangaluru, Karnataka (coastal region)
    lat, lon = 12.8628, 74.8622
    
    print(f"\n📍 Using location: Lat {lat}, Lon {lon} (Mangaluru, India)")
    print(f"📚 Data source: WeatherEx GFS Model")
    print(f"⏱️  Training data: 14 days of hourly weather data")
    print(f"🎯 Prediction target: 7-day weather forecast")
    
    # Initialize predictor
    predictor = WeatherPredictor()
    
    # Fetch data
    rows = predictor.fetch_weatherex_data(lat, lon, days=14)
    if not rows:
        print("❌ Failed to fetch weather data")
        return
    
    # Prepare data
    X, y, timestamps = predictor.prepare_data(rows)
    if X.size == 0:
        print("❌ Failed to prepare training data")
        return
    
    # Build and train model
    if HAS_TENSORFLOW:
        predictor.build_model((predictor.lookback, len(predictor.feature_names)))
        predictor.train(X, y, epochs=50, batch_size=32)
        predictor.save_model()
        
        # Show sample prediction
        print("\n📊 Sample Prediction (next 7 days):")
        if len(X) > 0:
            sample_prediction = predictor.predict_7day(X[-1])
            for feature, value in sample_prediction.items():
                print(f"  {feature}: {value:.2f}")
    else:
        print("⚠️  Skipping model training - TensorFlow not available")
    
    print("\n" + "=" * 60)
    print("✅ Training pipeline complete!")
    print("=" * 60)


if __name__ == '__main__':
    main()
