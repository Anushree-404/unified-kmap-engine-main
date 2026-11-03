import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { findTaluk, talukCenter, TALUK_DISTRICT } from "@/lib/geo";
import { scoreCrops, type CropScore } from "@/lib/crops";
import normalsRaw from "@/data/climate-normals.json";

const normals = normalsRaw as Record<string, { rain: number[]; tmean: number[]; annualRain: number }>;

function climateFallback(taluk: string) {
  const norm = normals[taluk] ?? normals["Kumta"];
  const today = new Date(Date.now() + 5.5 * 3600 * 1000);
  const days = Array.from({ length: 35 }, (_, index) => {
    const date = new Date(today.getTime() - (34 - index) * 86400000);
    const month = date.getUTCMonth();
    const mean = norm.tmean[month] ?? 27;
    const rain = (norm.rain[month] ?? 0) / new Date(date.getUTCFullYear(), month + 1, 0).getDate();
    return {
      date: date.toISOString().slice(0, 10),
      tMax: Math.round((mean + 3) * 10) / 10,
      tMin: Math.round((mean - 3) * 10) / 10,
      rain: Math.round(rain * 10) / 10,
      humidity: 80,
      et0: null,
    };
  });
  const recent = days.slice(-7);
  return {
    current: {
      temperature: norm.tmean[today.getUTCMonth()] ?? 27,
      humidity: 80,
      precipitation: null,
      windSpeed: null,
      weatherCode: null,
      soilMoisture: null,
      soilTemperature: null,
      time: null,
    },
    past: recent,
    history30: {
      time: days.map((day) => day.date),
      temperature_2m_max: days.map((day) => day.tMax),
      temperature_2m_min: days.map((day) => day.tMin),
      precipitation_sum: days.map((day) => day.rain),
      relative_humidity_2m_mean: days.map((day) => day.humidity),
    },
    today: today.toISOString().slice(0, 10),
    partial: true,
  };
}

export type PointAnalysis = NonNullable<Awaited<ReturnType<typeof analyzePointImpl>>["data"]>;
export type AnalysisResult =
  | { ok: true; data: PointAnalysis }
  | { ok: false; reason: "OUTSIDE_ZONE" | "WEATHER_UNAVAILABLE" | "UNKNOWN" };

async function analyzePointImpl(lat: number, lng: number) {
  const taluk = findTaluk(lat, lng);
  if (!taluk) return { reason: "OUTSIDE_ZONE" as const, data: null };

  const [{ fetchPlace, fetchSoil, fetchWeather, fetchLandTags, classifyLand }, { predictNext15 }] =
    await Promise.all([import("@/lib/land.server"), import("@/lib/forecast.server")]);

  const [place, soil, weatherResult, osmTags] = await Promise.all([
    fetchPlace(lat, lng).catch(() => ({ address: null, village: null, elevation: null, nearby: [] })),
    fetchSoil(lat, lng),
    fetchWeather(lat, lng).then(
      (w) => ({ ok: true as const, w }),
      (err) => {
        console.error("Weather lookup failed", err);
        return { ok: false as const, w: null };
      },
    ),
    fetchLandTags(lat, lng).catch(() => []),
  ]);

  // Weather should enrich the result, not prevent soil and crop analysis.
  // If both Open-Meteo feeds are temporarily unavailable, use the bundled
  // taluk climate normals and clearly mark the values as estimates.
  const weather = weatherResult.ok && weatherResult.w ? weatherResult.w : climateFallback(taluk);

  const land = classifyLand(osmTags, place, soil);
  const forecast = predictNext15(weather.history30, lat, lng, weather.today);

  const month = Number(weather.today.slice(5, 7));
  const norm = normals[taluk] ?? normals["Kumta"];


  // Expected water over roughly the next four months: climate normals for the
  // coming months plus the model's 15-day rainfall, which overrides month one.
  const forecastRain = forecast.days.reduce((s, d) => s + d.rain, 0);
  let seasonWater = forecastRain;
  for (let i = 0; i < 4; i++) {
    const m = ((month - 1 + i) % 12 + 12) % 12;
    seasonWater += i === 0 ? norm.rain[m] * 0.5 : norm.rain[m];
  }

  const recent = weather.past;
  const climate = {
    month,
    meanTemp:
      recent.length
        ? recent.reduce((s, d) => s + (d.tMax + d.tMin) / 2, 0) / recent.length
        : norm.tmean[month - 1],
    rainNext15: Math.round(forecastRain),
    rainPast30: Math.round(weather.history30.precipitation_sum.reduce((s, v) => s + v, 0)),
    seasonWater: Math.round(seasonWater),
    humidity: weather.current.humidity ?? 80,
    soilMoisture: weather.current.soilMoisture ?? null,
  };

  const allCrops: CropScore[] = land.agricultural
    ? scoreCrops(
        {
          ph: soil.ph,
          soc: soil.soc,
          clay: soil.clay,
          sand: soil.sand,
          silt: soil.silt,
          nitrogen: soil.nitrogen,
          cec: soil.cec,
          texture: soil.texture,
          drainage: soil.drainage,
        },
        climate,
      )
    : [];

  return {
    reason: null,
    data: {
      point: { lat, lng },
      taluk,
      district: TALUK_DISTRICT[taluk] ?? "Uttara Kannada",
      talukCenter: talukCenter(taluk),
      place,
      soil,
      land,
      weather,
      forecast,
      climate,
      normals: { rain: norm.rain, tmean: norm.tmean, annualRain: norm.annualRain },
      crops: allCrops.slice(0, 5),
    },
  };
}

export const analyzePoint = createServerFn({ method: "POST" })
  .validator((d) => z.object({ lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    try {
      const res = await analyzePointImpl(data.lat, data.lng);
      if (!res.data) return { ok: false, reason: res.reason ?? "UNKNOWN" };
      return { ok: true, data: res.data as PointAnalysis };
    } catch (err) {
      console.error("analyzePoint failed", err);
      return { ok: false, reason: "UNKNOWN" };
    }
  });

