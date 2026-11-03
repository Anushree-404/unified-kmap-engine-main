export const CROP_MODEL = {
  model: "Random Forest Crop Classifier v1",

  features: [
    "N",
    "P",
    "K",
    "temperature",
    "humidity",
    "ph",
    "rainfall"
  ],

  classes: [
    "apple",
    "banana",
    "blackgram",
    "chickpea",
    "coconut",
    "coffee",
    "cotton",
    "grapes",
    "jute",
    "kidneybeans",
    "lentil",
    "maize",
    "mango",
    "mothbeans",
    "mungbean",
    "muskmelon",
    "orange",
    "papaya",
    "pigeonpeas",
    "pomegranate",
    "rice",
    "watermelon"
  ],

  trees: [
    {
      childrenLeft: [
        // Generated decision-tree data
      ],

      childrenRight: [
        // Generated decision-tree data
      ],

      features: [
        // Feature indexes
      ],

      thresholds: [
        // Decision thresholds
      ],

      values: [
        // Class counts at each tree node
      ]
    }

    // Remaining generated trees
  ]
};
