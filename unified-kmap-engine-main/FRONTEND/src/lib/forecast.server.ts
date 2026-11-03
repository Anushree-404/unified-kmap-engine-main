import model from "@/data/weather-model.json";

/**
 * Inference for the ridge-regression weather model trained offline on ~22 years
 * of daily ERA5 reanalysis for the five coastal taluks (39k samples, 29
 * features, direct multi-horizon regression for days +1 to +15).
 *
 * Hold-out mean absolute error (last 15% of the record):
 *   max temp 0.7-1.1 C, min temp 0.6-0.8 C, humidity 3.1-5.1 %, rain 5.4-7.7 mm
 */

type ModelShape = {
  mu: number[];
  sd: number[];
  vars: string[];
  horizons: number[];
  coef: Record<string, Record<string, number[]>>;
  mae: Record<string, Record<string, number>>;
};

const M = model as unknown as ModelShape;

const VARS = ["temperature_2m_max", "temperature_2m_min", "precipitation_sum", "relative_humidity_2m_mean"] as const;

export type DailyHistory = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  relative_humidity_2m_mean: number[];
};

export type ForecastDay = {
  date: string;
  tMax: number;
  tMin: number;
  rain: number;
  humidity: number;
};

function mean(a: number[]) {
  return a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
}

function dayOfYear(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000);
}

function buildFeatures(hist: DailyHistory, lat: number, lng: number, baseDate: Date) {
  const doy = dayOfYear(baseDate);
  const raw: number[] = [1];
  for (const k of [1, 2, 3]) {
    raw.push(Math.sin((2 * Math.PI * k * doy) / 365.25));
    raw.push(Math.cos((2 * Math.PI * k * doy) / 365.25));
  }
  raw.push(lat, lng);
  for (const v of VARS) {
    let s = (hist[v] ?? []).map((x) => (typeof x === "number" ? x : 0));
    if (v === "precipitation_sum") s = s.map((x) => Math.log1p(Math.max(0, x)));
    const n = s.length;
    const last = (k: number) => s.slice(Math.max(0, n - k));
    raw.push(s[n - 1] ?? 0, mean(last(3)), mean(last(7)), mean(last(14)), mean(last(30)));
  }
  const out = [raw[0]];
  for (let i = 1; i < raw.length; i++) out.push((raw[i] - M.mu[i - 1]) / M.sd[i - 1]);
  return out;
}

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** Predict the next 15 days from the last 30+ days of observed daily weather. */
export function predictNext15(
  hist: DailyHistory,
  lat: number,
  lng: number,
  baseDateISO: string,
): { days: ForecastDay[]; accuracy: { variable: string; mae: number; unit: string }[] } {
  const base = new Date(`${baseDateISO}T00:00:00Z`);
  const x = buildFeatures(hist, lat, lng, base);

  const days: ForecastDay[] = M.horizons.map((h) => {
    const d = new Date(base.getTime() + h * 86400000);
    const rainLog = dot(x, M.coef["precipitation_sum"][String(h)]);
    return {
      date: d.toISOString().slice(0, 10),
      tMax: Math.round(dot(x, M.coef["temperature_2m_max"][String(h)]) * 10) / 10,
      tMin: Math.round(dot(x, M.coef["temperature_2m_min"][String(h)]) * 10) / 10,
      rain: Math.max(0, Math.round((Math.expm1(rainLog) || 0) * 10) / 10),
      humidity: Math.min(100, Math.max(0, Math.round(dot(x, M.coef["relative_humidity_2m_mean"][String(h)]))))
    };
  });

  const accuracy = [
    { variable: "Max temperature", mae: M.mae["temperature_2m_max"]["7"], unit: "\u00b0C" },
    { variable: "Min temperature", mae: M.mae["temperature_2m_min"]["7"], unit: "\u00b0C" },
    { variable: "Daily rainfall", mae: M.mae["precipitation_sum"]["7"], unit: "mm" },
    { variable: "Humidity", mae: M.mae["relative_humidity_2m_mean"]["7"], unit: "%" },
  ].map((a) => ({ ...a, mae: Math.round(a.mae * 100) / 100 }));

  return { days, accuracy };
}
