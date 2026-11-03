# 02 — Dataset Analysis

> All figures in this report are derived directly from the CSV files in `ML_MODEL/dataset/raw/`.  
> Row counts exclude the header line.

---

## 1. Crop Recommendation Dataset

**File:** `Crop_recommendation (1).csv`  
**Purpose:** Primary training dataset for the Random Forest crop recommendation model.  
**Production use:** Yes — directly used by `ML_MODEL/training/train_crop_model.py`.

### 1.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 2,200 |
| Columns | 8 |
| File size | 144.4 KB |

### 1.2 Column Schema

| Column | Type | Description |
|--------|------|-------------|
| N | float | Nitrogen content in soil (kg/ha) |
| P | float | Phosphorus content in soil (kg/ha) |
| K | float | Potassium content in soil (kg/ha) |
| temperature | float | Mean temperature (°C) |
| humidity | float | Relative humidity (%) |
| ph | float | Soil pH |
| rainfall | float | Annual rainfall (mm) |
| label | string | Target crop class |

### 1.3 First Five Records

| N | P | K | temperature | humidity | ph | rainfall | label |
|---|---|---|-------------|----------|----|----------|-------|
| 90 | 42 | 43 | 20.8797 | 82.0027 | 6.5030 | 202.935 | rice |
| 85 | 58 | 41 | 21.7705 | 80.3196 | 7.0381 | 226.655 | rice |
| 60 | 55 | 44 | 23.0047 | 82.3207 | 7.8400 | 263.964 | rice |
| 74 | 35 | 40 | 26.4914 | 80.1585 | 6.9809 | 242.864 | rice |
| 78 | 42 | 42 | 20.1302 | 81.6048 | 7.6284 | 262.717 | rice |

### 1.4 Last Five Records

| N | P | K | temperature | humidity | ph | rainfall | label |
|---|---|---|-------------|----------|----|----------|-------|
| 99 | 59 | 34 | 16.002 | 84.997 | 5.919 | 69.282 | coffee |
| 91 | 53 | 36 | 16.001 | 83.999 | 5.792 | 80.879 | coffee |
| 92 | 50 | 39 | 18.001 | 84.998 | 5.800 | 82.997 | coffee |
| 86 | 54 | 39 | 18.001 | 84.956 | 5.876 | 77.046 | coffee |
| 93 | 48 | 41 | 17.002 | 84.998 | 5.823 | 74.971 | coffee |

### 1.5 Feature Statistical Summary

| Feature | Min | Mean | Max |
|---------|-----|------|-----|
| N (Nitrogen) | 0 | 50.552 | 140 |
| P (Phosphorus) | 5 | 53.363 | 145 |
| K (Potassium) | 5 | 48.149 | 205 |
| temperature (°C) | 8.826 | 25.616 | 43.675 |
| humidity (%) | 14.258 | 71.482 | 99.982 |
| ph | 3.505 | 6.469 | 9.935 |
| rainfall (mm) | 20.211 | 103.464 | 298.560 |

### 1.6 Missing Values
**None.** All 2,200 rows × 8 columns are complete.

### 1.7 Duplicate Records
**None detected** (all 2,200 rows are unique by the feature-label combination).

### 1.8 Class Distribution (Target: `label`)

Each of the 22 crop classes has exactly **100 samples** — a perfectly balanced dataset.

| Crop | Count | Crop | Count |
|------|-------|------|-------|
| apple | 100 | mango | 100 |
| banana | 100 | mothbeans | 100 |
| blackgram | 100 | mungbean | 100 |
| chickpea | 100 | muskmelon | 100 |
| coconut | 100 | orange | 100 |
| coffee | 100 | papaya | 100 |
| cotton | 100 | pigeonpeas | 100 |
| grapes | 100 | pomegranate | 100 |
| jute | 100 | rice | 100 |
| kidneybeans | 100 | watermelon | 100 |
| lentil | 100 | maize | 100 |

### 1.9 Dataset Quality Observations
- Perfectly balanced (100 samples/class) — no class weighting needed.
- No missing values or duplicate rows.
- Feature ranges are physically plausible for agricultural inputs.
- pH range 3.5–9.9 covers all crop tolerance bounds in the crop suitability engine.

---

## 2. Crop Fertilizer Recommendation Dataset

**File:** `crop_fertilizer_recommendation_dataset.csv`  
**Purpose:** Reference dataset for fertilizer recommendation per crop.  
**Production use:** Not currently wired to any model or API endpoint.

### 2.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 2,200 |
| Columns | 13 |
| File size | 310.9 KB |

### 2.2 Column Schema

| Column | Type | Description |
|--------|------|-------------|
| N, P, K | float | Soil nutrients |
| temperature | float | Temperature (°C) |
| humidity | float | Humidity (%) |
| ph | float | Soil pH |
| rainfall | float | Rainfall (mm) |
| label | string | Crop name |
| fertilizer | string | Recommended fertilizer |
| N_status | string | Nitrogen level (Low/Normal/High) |
| P_status | string | Phosphorus level |
| K_status | string | Potassium level |
| recommendation_note | string | Free-text note |

### 2.3 Sample Records

| label | fertilizer | N_status | P_status | K_status |
|-------|------------|----------|----------|----------|
| rice | Balanced NPK (14-14-14) | Normal | Normal | Normal |
| rice | Balanced NPK (14-14-14) | Normal | Normal | Normal |

### 2.4 Quality Observations
- Shares the same 2,200 rows and NPK/climate columns as the crop recommendation dataset.
- The additional columns (fertilizer, status, note) make this suitable for a fertilizer recommendation module.
- Not used in the currently deployed application.

---

## 3. Irrigation Prediction Dataset

**File:** `irrigation_prediction.csv`  
**Purpose:** Multi-class irrigation need prediction (Low / Medium / High).  
**Production use:** Training script exists (`train_models.py`); not integrated into frontend or backend.

### 3.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 10,000 |
| Columns | 20 |
| File size | 1,171.4 KB |

### 3.2 Column Schema

| Column | Type | Description |
|--------|------|-------------|
| Soil_Type | string | Soil classification |
| Soil_pH | float | Soil pH |
| Soil_Moisture | float | Current moisture % |
| Organic_Carbon | float | Organic carbon % |
| Electrical_Conductivity | float | EC (dS/m) |
| Temperature_C | float | Air temperature |
| Humidity | float | Relative humidity % |
| Rainfall_mm | float | Recent rainfall |
| Sunlight_Hours | float | Daily sunshine hours |
| Wind_Speed_kmh | float | Wind speed |
| Crop_Type | string | Crop being grown |
| Crop_Growth_Stage | string | Phenological stage |
| Season | string | Kharif / Rabi / Zaid |
| Irrigation_Type | string | Canal / Drip / Rainfed etc. |
| Water_Source | string | Source of irrigation water |
| Field_Area_hectare | float | Field area |
| Mulching_Used | string | Yes / No |
| Previous_Irrigation_mm | float | Last irrigation amount |
| Region | string | North / South / East / West / Central |
| Irrigation_Need | string | **Target: Low / Medium / High** |

### 3.3 Target Variable Distribution

| Irrigation_Need | Count | Percentage |
|-----------------|-------|------------|
| Low | 5,864 | 58.6% |
| Medium | 3,800 | 38.0% |
| High | 336 | 3.4% |

> **Note:** The dataset is imbalanced. The `High` class has only 3.4% representation. Class-weighted training or SMOTE oversampling is recommended before model deployment.

### 3.4 Season Distribution

| Season | Count |
|--------|-------|
| Kharif | 3,362 |
| Rabi | 3,383 |
| Zaid | 3,255 |

### 3.5 Missing Values
**None detected** across all 20 columns.

### 3.6 Quality Observations
- Large dataset (10,000 rows) with no missing values.
- Class imbalance in the target variable must be addressed during training.
- Nine categorical columns requiring label encoding before model training.

---

## 4. Rainfall Dataset

**File:** `rainfall.csv`  
**Purpose:** Historical average annual rainfall (mm/year) by country and year.  
**Production use:** Not connected to any model in the current codebase.

### 4.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 6,727 |
| Columns | 3 |
| File size | 126.9 KB |

### 4.2 Column Schema

| Column | Type | Description |
|--------|------|-------------|
| Area | string | Country name |
| Year | integer | Year |
| average_rain_fall_mm_per_year | float | Average rainfall (mm) |

> The raw file has a leading space in the `Area` column header; corrected in `rainfall_processed.csv`.

### 4.3 Sample Records

| Area | Year | average_rain_fall_mm_per_year |
|------|------|-------------------------------|
| Afghanistan | 1985 | 327 |
| Afghanistan | 1986 | 327 |

### 4.4 Quality Observations
- Global historical dataset; not region-specific to Karnataka.
- Could be used as a reference for rainfall normalization in yield/crop models.

---

## 5. Soil Data Dataset

**File:** `soil_data.csv`  
**Purpose:** Synthetic soil sample profiles with physical and chemical properties.  
**Production use:** Not connected to any model; may serve as a reference lookup.

### 5.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 1,000 |
| Columns | 11 |
| File size | 170.7 KB |

### 5.2 Column Schema

| Column | Type | Description |
|--------|------|-------------|
| sample_id | integer | Row ID |
| soil_type | string | Loamy / Sandy / Clay etc. |
| sand_pct | float | Sand percentage |
| silt_pct | float | Silt percentage |
| clay_pct | float | Clay percentage |
| organic_matter | float | Organic matter % |
| water_retention | float | Water retention (some missing) |
| bulk_density | float | Bulk density (kg/dm³) |
| ec_ds_m | float | Electrical conductivity |
| ph | float | Soil pH |
| cec | float | Cation exchange capacity |

### 5.3 Missing Values

| Column | Missing Count |
|--------|---------------|
| water_retention | 40 out of 1,000 |

> Filled with column mean (0.2949) in `soil_data_processed.csv`.

---

## 6. Temperature Dataset

**File:** `temp.csv`  
**Purpose:** Historical average annual temperature by country and year.  
**Production use:** Not connected to any model.

### 6.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 71,311 |
| Columns | 3 |
| File size | 1,388.1 KB |

### 6.2 Column Schema

| Column | Description |
|--------|-------------|
| year | Year |
| country | Country name |
| avg_temp | Average temperature (°C) |

### 6.3 Quality Observations
- Largest dataset by row count (71,311). Records start from 1849.
- Global scope; not region-specific to Karnataka or India.
- Could supplement yield prediction models with climate trend data.

---

## 7. Weather Data Dataset

**File:** `weather_data.csv`  
**Purpose:** Simulated multi-variable daily weather records across 4 Indian regions.  
**Production use:** Not directly used; the production weather system calls Open-Meteo and WeatherEx APIs.

### 7.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 1,460 |
| Columns | 12 |
| File size | 177.1 KB |

### 7.2 Column Schema

| Column | Description |
|--------|-------------|
| date | Date (MM/DD/YYYY) |
| region | South / West / North / East |
| temp_max_c | Maximum temperature |
| temp_min_c | Minimum temperature |
| temp_avg_c | Average temperature |
| rainfall_mm | Daily rainfall |
| humidity_pct | Humidity |
| wind_speed_kmh | Wind speed |
| sunshine_hours | Daily sunshine hours |
| uv_index | UV index |
| cloud_cover_pct | Cloud cover % |
| evapotrans_mm | Evapotranspiration (mm) |

---

## 8. Yield Dataset

**File:** `yield.csv`  
**Purpose:** FAO historical crop yield data (hg/ha) by country, crop, and year.  
**Production use:** **Not used.** No yield prediction module is implemented.

### 8.1 Dimensions

| Property | Value |
|----------|-------|
| Rows | 56,717 |
| Columns | 12 |
| File size | 3,892.8 KB |

### 8.2 Key Columns

| Column | Description |
|--------|-------------|
| Area | Country |
| Item | Crop name |
| Year | Year of record |
| Unit | hg/ha |
| Value | Yield value |

> **Important:** The presence of this dataset does **not** mean a yield prediction model is implemented. No training script, model file, or API endpoint for yield prediction exists in the current project.

---

## 9. Dataset Usage Summary

| Dataset | Rows | Used in Production | Remarks |
|---------|------|--------------------|---------|
| Crop_recommendation (1).csv | 2,200 | **Yes** | RF model training dataset |
| crop_fertilizer_recommendation_dataset.csv | 2,200 | No | Available; not wired |
| irrigation_prediction.csv | 10,000 | No | Script only; not deployed |
| rainfall.csv | 6,727 | No | Reference only |
| soil_data.csv | 1,000 | No | Reference only |
| temp.csv | 71,311 | No | Reference only |
| weather_data.csv | 1,460 | No | Production uses live APIs |
| yield.csv | 56,717 | No | No yield model implemented |
