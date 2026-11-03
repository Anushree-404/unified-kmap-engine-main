import { CROP_MODEL } from "@/data/crop-model";

export const CROP_RECOMMENDATION_MODEL = `${CROP_MODEL.model} (${Math.round(CROP_MODEL.validationAccuracy * 100)}% validation accuracy)`;

export type CropModelInput = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

function forestProbabilities(input: CropModelInput) {
  const values = [input.nitrogen, input.phosphorus, input.potassium, input.temperature, input.humidity, input.ph, input.rainfall];
  const votes = Array.from({ length: CROP_MODEL.classes.length }, () => 0);

  for (const tree of CROP_MODEL.trees) {
    let node = 0;
    while (tree.childrenLeft[node] !== -1) {
      const feature = tree.features[node] ?? 0;
      node = values[feature]! <= tree.thresholds[node]! ? tree.childrenLeft[node]! : tree.childrenRight[node]!;
    }
    const leaf = (tree.values[node] ?? []) as unknown as number[];
    const total = leaf.reduce((sum, value) => sum + value, 0) || 1;
    leaf.forEach((value, index) => { votes[index] += value / total; });
  }

  return CROP_MODEL.classes
    .map((crop, index) => ({ crop, score: Math.round(((votes[index] ?? 0) / CROP_MODEL.trees.length) * 100) }))
    .sort((a, b) => b.score - a.score);
}

export function predictCropModel(input: CropModelInput) {
  return forestProbabilities(input);
}

export function recommendWeatherCrops(
  _crops: string[],
  rainfall: number,
  temperature: number,
  _baselineRainfall: number,
  soilNutrients = { nitrogen: 70, phosphorus: 45, potassium: 45 },
  humidity = 65,
  ph = 6.8,
) {
  return predictCropModel({
    ...soilNutrients,
    temperature,
    humidity,
    ph,
    rainfall,
  }).slice(0, 5);
}

export function seasonalPlan(crops: string[], annualRainfall: number) {
  const preferred = annualRainfall > 1800
    ? [crops.find((crop) => /paddy|rice/i.test(crop)), crops.find((crop) => /banana|sugarcane/i.test(crop))]
    : annualRainfall > 900
      ? [crops.find((crop) => /maize|soybean/i.test(crop)), crops.find((crop) => /groundnut|cotton/i.test(crop))]
      : [crops.find((crop) => /ragi|millet/i.test(crop)), crops.find((crop) => /sunflower|groundnut/i.test(crop))];
  const fallback = crops[0] ?? "A locally suitable crop";
  const pick = (index: number) => preferred[index] ?? crops[index] ?? fallback;
  return [
    { season: "January - March", crop: pick(1), guidance: "Cooler, drier window; use irrigation where required." },
    { season: "April - June", crop: pick(0), guidance: "Prepare land and sow with dependable pre-monsoon moisture." },
    { season: "July - September", crop: pick(0), guidance: "Main monsoon window; monitor drainage and fungal pressure." },
    { season: "October - December", crop: pick(1), guidance: "Post-monsoon crop; protect the harvest as rainfall tapers." },
  ];
}
