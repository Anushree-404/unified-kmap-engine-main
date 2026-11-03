# 06 — Crop Disease Detection Model

---

## ⚠️ Implementation Status Notice

> **A trained CNN model for crop disease detection does NOT exist in the current project.**

After a thorough search of the entire codebase, the following were **not found**:

| Item | Status |
|------|--------|
| Disease image dataset (PlantVillage or any other) | ❌ Not found |
| CNN training script | ❌ Not found |
| Trained model weights (.h5, .keras, .pt, .pth, .tflite) | ❌ Not found |
| Disease class labels file | ❌ Not found |
| Image preprocessing pipeline | ❌ Not found |
| Leaf image upload → prediction integration | ❌ Not implemented (UI mockup only) |

**What exists in the current codebase:**

The `demo.tsx` route contains a disease detection UI tab. When a user uploads a leaf image, the application picks one of three **hard-coded static sample diagnoses** based on the file size modulo 3:

```typescript
// FRONTEND/src/routes/demo.tsx (verified from source)
function handleFile(file: File) {
  setPreview(URL.createObjectURL(file));
  setDiagnosis(null);
  setScanning(true);
  const pick = SAMPLE_DIAGNOSES[file.size % SAMPLE_DIAGNOSES.length] ?? SAMPLE_DIAGNOSES[0];
  window.setTimeout(() => {
    setDiagnosis(pick);
    setScanning(false);
  }, 1400);  // simulated 1.4-second "analysis" delay
}
```

The three static diagnoses are:
1. Early Blight (Alternaria solani) — confidence 94%
2. Bacterial Leaf Blight — confidence 91%
3. Leaf Rust (Puccinia spp.) — confidence 89%

**No actual ML model is called. The confidence scores and disease names are static strings.**

---

## 1. Problem Statement (Planned)

The intended module would:
- Accept a photograph of a crop leaf as input
- Use a CNN to classify the disease present
- Return the disease name, confidence score, affected area severity, and treatment recommendations

---

## 2. Planned Dataset

| Property | Planned Value |
|----------|---------------|
| Dataset source | PlantVillage (open-source on Kaggle) |
| Total images | ~50,000+ labeled leaf images |
| Disease categories | ~38–39 disease-crop combinations |
| Healthy class | Included |
| Image format | JPEG/PNG |
| Resolution | 256×256 px (standard) |

> **Note:** None of these images are present in the project repository.

---

## 3. Planned CNN Architecture

The `ML_TECH_STACK.md` planning document references EfficientNet, MobileNetV3, and ResNet-50. Since no training has been performed, the architecture below represents the planned design only.

### 3.1 Transfer Learning Approach (Planned)

```
Pre-trained Base: EfficientNet-B0 (ImageNet weights)
│
├── Freeze early convolutional layers (feature extraction)
├── Fine-tune later layers on PlantVillage data
└── Replace final classification head with 39-class Dense layer
```

### 3.2 Planned Architecture Layers

| Layer | Output Shape | Parameters |
|-------|-------------|------------|
| Input | (224, 224, 3) | — |
| EfficientNet-B0 (frozen) | (7, 7, 1280) | ~4M (frozen) |
| GlobalAveragePooling2D | (1280,) | 0 |
| Dense(256, ReLU) | (256,) | 327,936 |
| Dropout(0.5) | (256,) | 0 |
| Dense(39, Softmax) | (39,) | 10,023 |

### 3.3 Convolution Operation (Mathematical Background)

For completeness, the standard 2D convolution:

```
(f * g)[i,j] = Σ_m Σ_n f[m,n] * g[i+m, j+n]
```

Where `f` is the input feature map and `g` is the learned kernel.

### 3.4 ReLU Activation

```
ReLU(x) = max(0, x)
```

Introduces non-linearity while avoiding vanishing gradient.

### 3.5 Softmax Output

```
softmax(z_i) = exp(z_i) / Σ_j exp(z_j)
```

Converts logits to class probabilities summing to 1.

### 3.6 Loss Function

Categorical Cross-Entropy:

```
L = -Σ_c y_c * log(ŷ_c)
```

---

## 4. Planned Training Configuration

| Parameter | Planned Value |
|-----------|---------------|
| Optimizer | Adam (lr=0.001) |
| Batch size | 32 |
| Epochs | 100 (with early stopping) |
| Train/Val/Test split | 70% / 15% / 15% |
| Data augmentation | Rotation, flip, zoom, brightness |
| Loss function | Categorical cross-entropy |

---

## 5. Planned Evaluation Metrics

| Metric | Target |
|--------|--------|
| Overall accuracy | >90% |
| Per-class F1-score | >0.85 |
| Inference time | <200ms |
| Model size | <150 MB |

> **None of these metrics are actual results.** They are targets from the planning document.

---

## 6. What Must Be Done to Implement This Module

1. Download PlantVillage dataset (Kaggle: "Plant Disease" dataset by Abdallah Ali).
2. Create `ML_MODEL/dataset/raw/plant_disease/` directory with class subdirectories.
3. Write `ML_MODEL/training/train_disease_model.py` with EfficientNet transfer learning.
4. Train for 50–100 epochs on GPU (recommended: Google Colab or Kaggle Kernel).
5. Export model to TensorFlow Lite or ONNX for lightweight deployment.
6. Create `ML_MODEL/inference/disease_inference.py` for FastAPI integration.
7. Add `POST /api/disease/detect` endpoint to `BACKEND/app/routes/`.
8. Replace the static `SAMPLE_DIAGNOSES` array in `demo.tsx` with a real API call.

---

## 7. Current UI Implementation

The disease detection tab in `/demo` provides:
- Leaf image upload (any file format)
- 1.4-second simulated analysis animation
- One of three static diagnosis cards (selected by `file.size % 3`)
- Disease name, confidence score, severity, organic treatment, chemical treatment, prevention steps, and buy-medicine links

This is a **functional UI mockup** suitable for a demonstration but not backed by a real model.
