export type DisasterZone = {
  id: string;
  region: string;
  districts: string[];
  hazard: "Drought" | "Flood" | "Cyclone & heavy rain" | "Hailstorm" | "Landslide";
  severity: "Severe" | "High" | "Moderate";
  season: string;
  affected: string;
  loss: string;
  raised: number;
  goal: number;
  story: string;
};

export const DISASTER_ZONES: DisasterZone[] = [
  {
    id: "north-drought",
    region: "North Karnataka dryland belt",
    districts: ["Kalaburagi", "Vijayapura", "Bagalkot", "Raichur", "Yadgir"],
    hazard: "Drought",
    severity: "Severe",
    season: "Kharif (Jun–Sep)",
    affected: "1.9 lakh farmers",
    loss: "Jowar, tur and cotton sowing failure on rain deficit above 40%",
    raised: 1840000,
    goal: 4000000,
    story:
      "Successive weak monsoons have pushed borewell depths past 900 ft. Relief here goes to re-sowing seed kits, fodder banks and drinking-water tankers.",
  },
  {
    id: "coastal-flood",
    region: "Coastal & Malnad flood corridor",
    districts: ["Dakshina Kannada", "Udupi", "Uttara Kannada", "Kodagu"],
    hazard: "Cyclone & heavy rain",
    severity: "High",
    season: "South-west monsoon (Jun–Aug)",
    affected: "72,000 farmers",
    loss: "Arecanut, paddy and banana submergence; plantation soil washout",
    raised: 1260000,
    goal: 3000000,
    story:
      "Extreme single-day rainfall events flood paddy fields and topple arecanut gardens. Funds support silt clearing, sapling replacement and pump repair.",
  },
  {
    id: "krishna-flood",
    region: "Krishna–Bhima river basin",
    districts: ["Belagavi", "Bagalkot", "Raichur", "Kalaburagi"],
    hazard: "Flood",
    severity: "Severe",
    season: "Aug–Oct backwater releases",
    affected: "1.1 lakh farmers",
    loss: "Sugarcane and maize inundation, standing crop rot",
    raised: 2310000,
    goal: 5000000,
    story:
      "Upstream dam releases regularly submerge riverside plots for days. Support covers ratoon replanting, seed loans and cattle shelter.",
  },
  {
    id: "hail-belt",
    region: "Southern hailstorm belt",
    districts: ["Chikkaballapur", "Kolar", "Ramanagara", "Tumakuru"],
    hazard: "Hailstorm",
    severity: "Moderate",
    season: "Pre-monsoon (Mar–May)",
    affected: "38,000 farmers",
    loss: "Grape, mango and tomato damage in a single storm hour",
    raised: 640000,
    goal: 1500000,
    story:
      "Horticulture growers lose an entire season in minutes. Contributions fund hail netting, pruning support and cold-storage access.",
  },
  {
    id: "malnad-landslide",
    region: "Western Ghats landslide zone",
    districts: ["Kodagu", "Chikkamagaluru", "Shivamogga", "Hassan"],
    hazard: "Landslide",
    severity: "High",
    season: "Jul–Aug peak rainfall",
    affected: "21,000 farmers",
    loss: "Coffee and pepper estates lost with the slope itself",
    raised: 980000,
    goal: 2500000,
    story:
      "Slope failures take away both crop and land. Relief goes to slope stabilisation, shade-tree replanting and temporary housing for estate workers.",
  },
];

export const DONATION_USE = [
  { label: "Seed & input kits for re-sowing", pct: 40 },
  { label: "Irrigation and pump restoration", pct: 22 },
  { label: "Fodder banks & livestock care", pct: 18 },
  { label: "Family relief and school support", pct: 12 },
  { label: "Field verification & logistics", pct: 8 },
];
