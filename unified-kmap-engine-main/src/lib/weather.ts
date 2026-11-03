import { createServerFn } from "@tanstack/react-start";

export type LiveWeather = {
  temperature: number;
  rainfall: number;
  recentRainfall: number | null;
  forecastRainfall: number;
  recentTemperature: number | null;
  forecastTemperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  description: string;
  fetchedAt: string;
};

type WeatherInput = { lat: number; lon: number };

type WeatherExRow = {
  timestamp_key?: string;
  temperature?: number | null;
  humidity?: number | null;
  precipitation?: number | null;
  wind_speed_10m?: number | null;
};

type WeatherExResponse = {
  success?: boolean;
  models?: Array<{
    success?: boolean;
    rows?: WeatherExRow[];
    meta?: { generatedAt?: string };
  }>;
};

export const getLiveWeather = createServerFn({ method: "GET" })
  .validator((input: WeatherInput) => {
    if (
      !Number.isFinite(input.lat) ||
      !Number.isFinite(input.lon) ||
      input.lat < -90 ||
      input.lat > 90 ||
      input.lon < -180 ||
      input.lon > 180
    ) {
      throw new Error("Invalid coordinates");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const params = new URLSearchParams({
      latitude: String(data.lat),
      longitude: String(data.lon),
      models: "gfs",
      resolution: "1h",
      forecast_days: "7",
      variables: "temperature,humidity,precipitation,wind_speed_10m",
    });
    const response = await fetch(`https://meteo.weatherex.ai/api/forecast?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Weather service returned ${response.status}`);
    }

    const payload = (await response.json()) as WeatherExResponse;
    const model = payload.models?.find((item) => item.success !== false);
    const rows = model?.rows ?? [];
    const usableRows = rows.filter(
      (row) =>
        Number.isFinite(row.temperature) ||
        Number.isFinite(row.humidity) ||
        Number.isFinite(row.precipitation) ||
        Number.isFinite(row.wind_speed_10m),
    );
    const temperatureRow = usableRows.find((row) => Number.isFinite(row.temperature));
    const temperature = temperatureRow?.temperature;
    if (!Number.isFinite(temperature) || usableRows.length === 0) {
      throw new Error("Weather response did not include usable data");
    }

    const rainfall = usableRows.reduce(
      (total, row) => total + (Number.isFinite(row.precipitation) ? Number(row.precipitation) : 0),
      0,
    );
    const temperatures = usableRows.flatMap((row) => (Number.isFinite(row.temperature) ? [Number(row.temperature)] : []));
    const mean = (values: number[]) => {
      return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)) : null;
    };
    const humidity = temperatureRow?.humidity ?? usableRows.find((row) => Number.isFinite(row.humidity))?.humidity;
    const windSpeed = temperatureRow?.wind_speed_10m ?? usableRows.find((row) => Number.isFinite(row.wind_speed_10m))?.wind_speed_10m;
    return {
      temperature: Number(Number(temperature).toFixed(1)),
      rainfall: Number(rainfall.toFixed(1)),
      recentRainfall: null,
      forecastRainfall: Number(rainfall.toFixed(1)),
      recentTemperature: null,
      forecastTemperature: mean(temperatures),
      humidity: Number.isFinite(humidity) ? Number(Number(humidity).toFixed(1)) : null,
      windSpeed: Number.isFinite(windSpeed) ? Number((Number(windSpeed) * 3.6).toFixed(1)) : null,
      description: describeWeather(rainfall, humidity),
      fetchedAt: model?.meta?.generatedAt ?? new Date().toISOString(),
    } satisfies LiveWeather;
  });

function describeWeather(rainfall: number, humidity: number | null | undefined) {
  if (rainfall >= 10) return "Rain likely";
  if (rainfall > 0) return "Rain possible";
  if (Number.isFinite(humidity) && Number(humidity) >= 85) return "Humid and cloudy";
  return "Clear or partly cloudy";
}