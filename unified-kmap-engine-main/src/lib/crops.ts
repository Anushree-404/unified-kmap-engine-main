/**
 * Crop suitability engine for the coastal (Zone 10) agro-climatic zone of
 * Karnataka. Requirement ranges follow UAS Dharwad / ICAR package-of-practices
 * guidance for the west-coast laterite belt.
 */

export type CropRequirement = {
  id: string;
  name: string;
  kannada: string;
  category: "Cereal" | "Plantation" | "Horticulture" | "Pulse" | "Oilseed" | "Spice" | "Vegetable";
  ph: [number, number, number, number]; // absolute min, optimum min, optimum max, absolute max
  temp: [number, number, number, number]; // same shape, mean daily temp (C)
  /** Water requirement over the crop cycle, mm */
  waterNeed: [number, number];
  /** Months (1-12) in which sowing / planting is recommended */
  sowingMonths: number[];
  /** Perennial crops can be established in a wide window */
  perennial?: boolean;
  durationDays: number;
  /** Preferred texture classes */
  textures: Array<"sandy" | "loamy" | "clayey">;
  /** Tolerates waterlogging / poor drainage */
  waterlogTolerant: boolean;
  /** Minimum soil organic carbon (g/kg) for good yields */
  socMin: number;
  notes: string;
};

export const CROPS: CropRequirement[] = [
  {
    id: "paddy-kharif",
    name: "Paddy (Kharif rice)",
    kannada: "\u0cad\u0ca4\u0ccd\u0ca4",
    category: "Cereal",
    ph: [4.5, 5.5, 6.8, 7.8],
    temp: [20, 24, 32, 37],
    waterNeed: [900, 1800],
    sowingMonths: [5, 6, 7],
    durationDays: 125,
    textures: ["clayey", "loamy"],
    waterlogTolerant: true,
    socMin: 6,
    notes: "Main monsoon crop of the coast; puddled clay soils that hold water suit it best.",
  },
  {
    id: "coconut",
    name: "Coconut",
    kannada: "\u0ca4\u0cc6\u0c82\u0c97\u0cc1",
    category: "Plantation",
    ph: [5.0, 5.5, 7.5, 8.5],
    temp: [21, 25, 33, 37],
    waterNeed: [1200, 2500],
    sowingMonths: [5, 6, 7, 8, 9],
    perennial: true,
    durationDays: 2555,
    textures: ["sandy", "loamy"],
    waterlogTolerant: false,
    socMin: 4,
    notes: "Backbone plantation crop of coastal Karnataka; needs deep, well-drained soil.",
  },
  {
    id: "arecanut",
    name: "Arecanut",
    kannada: "\u0c85\u0ca1\u0cbf\u0c95\u0cc6",
    category: "Plantation",
    ph: [5.0, 5.5, 7.0, 8.0],
    temp: [18, 22, 32, 35],
    waterNeed: [1500, 3000],
    sowingMonths: [5, 6, 7, 8],
    perennial: true,
    durationDays: 2190,
    textures: ["loamy", "clayey"],
    waterlogTolerant: false,
    socMin: 8,
    notes: "High-value garden crop; wants humid air, gravelly laterite loam and good drainage.",
  },
  {
    id: "banana",
    name: "Banana",
    kannada: "\u0cac\u0cbe\u0cb3\u0cc6",
    category: "Horticulture",
    ph: [5.0, 6.0, 7.5, 8.2],
    temp: [20, 24, 33, 38],
    waterNeed: [1200, 2200],
    sowingMonths: [5, 6, 7, 8, 9, 10],
    durationDays: 330,
    textures: ["loamy", "clayey"],
    waterlogTolerant: false,
    socMin: 8,
    notes: "Responds strongly to organic matter; avoid pockets that stay flooded.",
  },
  {
    id: "cashew",
    name: "Cashew",
    kannada: "ಗೋಡಂಬಿ",
    category: "Plantation",
    ph: [4.5, 5.0, 7.0, 8.0],
    temp: [20, 24, 35, 40],
    waterNeed: [600, 1500],
    sowingMonths: [6, 7, 8],
    perennial: true,
    durationDays: 1825,
    textures: ["sandy", "loamy"],
    waterlogTolerant: false,
    socMin: 3,
    notes: "Thrives on poor lateritic and sandy coastal soil where other crops struggle.",
  },
  {
    id: "black-pepper",
    name: "Black pepper",
    kannada: "ಕಾಳುಮೆಣಸು",
    category: "Spice",
    ph: [4.5, 5.5, 6.5, 7.5],
    temp: [18, 22, 32, 35],
    waterNeed: [1500, 3000],
    sowingMonths: [5, 6, 7],
    perennial: true,
    durationDays: 1095,
    textures: ["loamy"],
    waterlogTolerant: false,
    socMin: 10,
    notes: "Grown as a vine on arecanut or shade trees; needs high humidity and rich topsoil.",
  },
  {
    id: "ginger",
    name: "Ginger",
    kannada: "\u0cb6\u0cc1\u0c82\u0ca0\u0cbf",
    category: "Spice",
    ph: [5.0, 5.8, 6.8, 7.5],
    temp: [19, 22, 31, 35],
    waterNeed: [1200, 2200],
    sowingMonths: [4, 5, 6],
    durationDays: 240,
    textures: ["loamy", "sandy"],
    waterlogTolerant: false,
    socMin: 10,
    notes: "Needs friable, humus-rich, very well drained beds; rot risk in heavy wet clay.",
  },
  {
    id: "turmeric",
    name: "Turmeric",
    kannada: "\u0c85\u0cb0\u0cb6\u0cbf\u0ca8",
    category: "Spice",
    ph: [5.0, 5.8, 7.2, 8.0],
    temp: [20, 23, 32, 35],
    waterNeed: [1000, 2000],
    sowingMonths: [4, 5, 6],
    durationDays: 245,
    textures: ["loamy", "clayey"],
    waterlogTolerant: false,
    socMin: 8,
    notes: "Fits well as an intercrop in young coconut and arecanut gardens.",
  },
  {
    id: "cowpea",
    name: "Cowpea",
    kannada: "\u0c85\u0cb2\u0cb8\u0c82\u0ca6\u0cc6",
    category: "Pulse",
    ph: [5.0, 5.8, 7.5, 8.5],
    temp: [20, 24, 34, 38],
    waterNeed: [300, 600],
    sowingMonths: [1, 2, 9, 10, 11, 12],
    durationDays: 80,
    textures: ["sandy", "loamy"],
    waterlogTolerant: false,
    socMin: 3,
    notes: "Short duration legume for rice fallows; fixes nitrogen for the next crop.",
  },
  {
    id: "groundnut",
    name: "Groundnut",
    kannada: "\u0cb6\u0cc7\u0c82\u0c97\u0cbe",
    category: "Oilseed",
    ph: [5.5, 6.0, 7.5, 8.2],
    temp: [21, 25, 34, 38],
    waterNeed: [400, 700],
    sowingMonths: [1, 11, 12],
    durationDays: 110,
    textures: ["sandy", "loamy"],
    waterlogTolerant: false,
    socMin: 3,
    notes: "Classic coastal rabi/summer crop on sandy soils with light irrigation.",
  },
  {
    id: "sesame",
    name: "Sesame",
    kannada: "\u0c8e\u0cb2\u0cc1\u0cb2\u0cc1",
    category: "Oilseed",
    ph: [5.5, 6.0, 7.8, 8.5],
    temp: [22, 26, 35, 40],
    waterNeed: [300, 600],
    sowingMonths: [1, 2, 12],
    durationDays: 90,
    textures: ["sandy", "loamy"],
    waterlogTolerant: false,
    socMin: 2,
    notes: "Very drought hardy; sown in rice fallows on residual moisture.",
  },
  {
    id: "brinjal",
    name: "Brinjal",
    kannada: "\u0c96\u0cbe\u0cb0\u0cbf\u0c95\u0cbe\u0caf\u0cbf",
    category: "Vegetable",
    ph: [5.5, 6.0, 7.2, 8.0],
    temp: [20, 24, 33, 38],
    waterNeed: [500, 900],
    sowingMonths: [1, 6, 7, 9, 10, 11, 12],
    durationDays: 150,
    textures: ["loamy", "sandy"],
    waterlogTolerant: false,
    socMin: 6,
    notes: "Reliable market vegetable; needs raised beds during heavy monsoon rain.",
  },
  {
    id: "okra",
    name: "Okra (Bhendi)",
    kannada: "\u0cac\u0cc6\u0c82\u0ca1\u0cc6",
    category: "Vegetable",
    ph: [5.5, 6.0, 7.5, 8.2],
    temp: [22, 25, 35, 40],
    waterNeed: [400, 800],
    sowingMonths: [1, 2, 6, 7, 11, 12],
    durationDays: 100,
    textures: ["loamy", "sandy"],
    waterlogTolerant: false,
    socMin: 5,
    notes: "Fast returns; sensitive to standing water in the root zone.",
  },
  {
    id: "chilli",
    name: "Chilli",
    kannada: "ಮೆಣಸಿನಕಾಯಿ",
    category: "Vegetable",
    ph: [5.5, 6.0, 7.2, 8.0],
    temp: [20, 24, 33, 38],
    waterNeed: [500, 900],
    sowingMonths: [1, 9, 10, 11, 12],
    durationDays: 165,
    textures: ["loamy", "sandy"],
    waterlogTolerant: false,
    socMin: 6,
    notes: "Best transplanted after the monsoon peak to avoid die-back and fruit rot.",
  },
  {
    id: "colocasia",
    name: "Colocasia (Taro)",
    kannada: "\u0cb8\u0cc1\u0cb5\u0cb0\u0ccd\u0ca3\u0c97\u0cc6\u0ca1\u0ccd\u0ca1\u0cc6",
    category: "Horticulture",
    ph: [4.8, 5.5, 7.0, 7.8],
    temp: [20, 23, 32, 36],
    waterNeed: [1000, 2000],
    sowingMonths: [4, 5, 6, 7],
    durationDays: 200,
    textures: ["clayey", "loamy"],
    waterlogTolerant: true,
    socMin: 8,
    notes: "One of the few crops that yields well in low-lying, wet coastal patches.",
  },
  {
    id: "sugarcane",
    name: "Sugarcane",
    kannada: "\u0c95\u0cac\u0ccd\u0cac\u0cc1",
    category: "Cereal",
    ph: [5.5, 6.0, 7.5, 8.5],
    temp: [20, 25, 34, 38],
    waterNeed: [1500, 2500],
    sowingMonths: [1, 2, 11, 12],
    durationDays: 330,
    textures: ["clayey", "loamy"],
    waterlogTolerant: true,
    socMin: 8,
    notes: "Only worth it where assured irrigation and deep heavy soil are available.",
  },
  {
    id: "sweet-potato",
    name: "Sweet potato",
    kannada: "\u0c97\u0cc6\u0ca3\u0cb8\u0cc1",
    category: "Horticulture",
    ph: [5.0, 5.6, 6.8, 7.5],
    temp: [20, 24, 33, 38],
    waterNeed: [400, 800],
    sowingMonths: [1, 9, 10, 11, 12],
    durationDays: 120,
    textures: ["sandy", "loamy"],
    waterlogTolerant: false,
    socMin: 3,
    notes: "Good on light sandy coastal soil with modest inputs.",
  },
];

export type SoilInput = {
  ph: number | null;
  soc: number | null;
  clay: number | null;
  sand: number | null;
  silt: number | null;
  nitrogen: number | null;
  cec: number | null;
  texture: "sandy" | "loamy" | "clayey" | null;
  drainage: "well drained" | "moderate" | "poorly drained" | null;
};

export type ClimateInput = {
  month: number;
  meanTemp: number;
  rainNext15: number;
  rainPast30: number;
  /** Expected water supply over the crop cycle, mm (rain climatology + forecast) */
  seasonWater: number;
  humidity: number;
  soilMoisture: number | null;
};

export type CropScore = {
  crop: CropRequirement;
  score: number;
  rating: "Excellent" | "Very good" | "Good" | "Moderate" | "Poor";
  factors: { label: string; score: number; detail: string }[];
  advice: string;
};

function band(v: number, r: [number, number, number, number]) {
  const [absMin, optMin, optMax, absMax] = r;
  if (v >= optMin && v <= optMax) return 1;
  if (v < optMin) return v <= absMin ? 0 : (v - absMin) / (optMin - absMin);
  return v >= absMax ? 0 : (absMax - v) / (absMax - optMax);
}

export function scoreCrops(soil: SoilInput, climate: ClimateInput): CropScore[] {
  const scored = CROPS.map((crop) => {
    const factors: { label: string; score: number; detail: string }[] = [];

    const phS = soil.ph == null ? 0.7 : band(soil.ph, crop.ph);
    factors.push({
      label: "Soil pH",
      score: phS,
      detail:
        soil.ph == null
          ? "No pH reading available for this point"
          : `pH ${soil.ph.toFixed(1)} vs preferred ${crop.ph[1]}\u2013${crop.ph[2]}`,
    });

    const tempS = band(climate.meanTemp, crop.temp);
    factors.push({
      label: "Temperature",
      score: tempS,
      detail: `${climate.meanTemp.toFixed(1)}\u00b0C now vs preferred ${crop.temp[1]}\u2013${crop.temp[2]}\u00b0C`,
    });

    const [wMin, wMax] = crop.waterNeed;
    const water = climate.seasonWater;
    let waterS: number;
    if (water < wMin) waterS = Math.max(0, water / wMin);
    else if (water > wMax) waterS = Math.max(0.25, 1 - (water - wMax) / (wMax * 1.5));
    else waterS = 1;
    if (crop.waterlogTolerant && water > wMax) waterS = Math.max(waterS, 0.85);
    factors.push({
      label: "Water balance",
      score: waterS,
      detail: `~${Math.round(water)} mm expected over the cycle vs need ${wMin}\u2013${wMax} mm`,
    });

    const textureS = soil.texture == null ? 0.7 : crop.textures.includes(soil.texture) ? 1 : 0.45;
    factors.push({
      label: "Soil texture",
      score: textureS,
      detail: soil.texture
        ? `${soil.texture} soil; crop prefers ${crop.textures.join(" / ")}`
        : "Texture unknown",
    });

    let drainS = 0.75;
    if (soil.drainage === "well drained") drainS = crop.waterlogTolerant ? 0.8 : 1;
    else if (soil.drainage === "moderate") drainS = 0.85;
    else if (soil.drainage === "poorly drained") drainS = crop.waterlogTolerant ? 1 : 0.35;
    factors.push({
      label: "Drainage",
      score: drainS,
      detail: `${soil.drainage ?? "unknown"} land; crop is ${crop.waterlogTolerant ? "waterlogging tolerant" : "sensitive to waterlogging"}`,
    });

    const socS =
      soil.soc == null ? 0.7 : Math.max(0.3, Math.min(1, soil.soc / Math.max(1, crop.socMin)));
    factors.push({
      label: "Organic carbon",
      score: socS,
      detail:
        soil.soc == null
          ? "No organic carbon reading"
          : `${soil.soc.toFixed(1)} g/kg vs ${crop.socMin} g/kg wanted`,
    });

    const inWindow = crop.perennial
      ? crop.sowingMonths.includes(climate.month)
      : crop.sowingMonths.includes(climate.month);
    const nearWindow = crop.sowingMonths.some(
      (m) => Math.abs(((m - climate.month + 12) % 12 <= 6 ? m - climate.month : climate.month - m)) <= 1,
    );
    const seasonS = inWindow ? 1 : nearWindow ? 0.6 : 0.15;
    factors.push({
      label: "Sowing window",
      score: seasonS,
      detail: inWindow
        ? "This month is inside the recommended planting window"
        : nearWindow
          ? "Planting window opens or closes within a month"
          : "Outside the recommended planting window",
    });

    const weights = [0.18, 0.15, 0.18, 0.11, 0.12, 0.08, 0.18];
    const score = factors.reduce((s, f, i) => s + f.score * weights[i], 0);

    const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
    const advice =
      score > 0.8
        ? `Strong fit right now. ${crop.notes}`
        : score > 0.6
          ? `Workable with attention to ${weakest.label.toLowerCase()}. ${crop.notes}`
          : `Limited by ${weakest.label.toLowerCase()} \u2014 ${weakest.detail}.`;

    const rating: CropScore["rating"] =
      score >= 0.85
        ? "Excellent"
        : score >= 0.72
          ? "Very good"
          : score >= 0.6
            ? "Good"
            : score >= 0.45
              ? "Moderate"
              : "Poor";

    return { crop, score, rating, factors, advice };
  });

  return scored.sort((a, b) => b.score - a.score);
}
