import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Ban,
  Building2,
  CloudRain,
  Droplets,
  Leaf,
  MapPin,
  Navigation,
  Route,
  Sprout,
  Sun,
  Thermometer,
  TreePalm,
  Waves,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

import type { PointAnalysis } from "@/lib/analysis.functions";
import { formatLatLng } from "@/lib/geo";
import type { Surface } from "@/lib/surface-check";

const KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;

/** What the user can correct a low-confidence reading to. */
const OVERRIDES: Array<{ label: string; detail: string; agricultural: boolean }> = [
  {
    label: "Water body",
    detail:
      "You marked this spot as a pond, tank or stream. Small farm ponds are often missing from the map records, so no crop plan is shown.",
    agricultural: false,
  },
  {
    label: "Built-up",
    detail: "You marked this spot as built-up, so no crop plan is shown.",
    agricultural: false,
  },
  {
    label: "Forest / scrub",
    detail: "You marked this spot as wooded or scrub land, so no crop plan is shown.",
    agricultural: false,
  },
  {
    label: "Agricultural land",
    detail: "You marked this spot as cultivable farmland, so crops are scored for it.",
    agricultural: true,
  },
];


const CATEGORY_ICON: Record<string, typeof Leaf> = {
  "Agricultural land": Sprout,
  "Plantation / orchard": TreePalm,
  "Built-up": Building2,
  "Road / paved surface": Route,
  "Forest / scrub": Leaf,
  "Water body": Waves,
  "Open / barren land": Sun,
};

type DayPoint = { day: string; max: number; min: number; rain: number };

function ChartKey() {
  const items = [
    { color: "var(--chart-1)", label: "Day heat" },
    { color: "var(--chart-2)", label: "Night cool" },
    { color: "var(--chart-3)", label: "Rain" },
  ];
  return (
    <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: i.color }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function DayTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DayPoint;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-semibold text-foreground">{label}</div>
      <div className="text-muted-foreground">
        Daytime <span className="font-semibold text-foreground">{Math.round(d.max)}°C</span>
      </div>
      <div className="text-muted-foreground">
        Night <span className="font-semibold text-foreground">{Math.round(d.min)}°C</span>
      </div>
      <div className="text-muted-foreground">
        Rain{" "}
        <span className="font-semibold text-foreground">
          {d.rain > 0 ? `${d.rain} mm` : "none"}
        </span>
      </div>
    </div>
  );
}

/** One simple picture: bars are rain, lines are day and night temperature. */
function WeatherChart({ data, everyOther }: { data: DayPoint[]; everyOther?: boolean }) {
  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={everyOther ? 2 : 0}
          />
          <YAxis
            yAxisId="temp"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={34}
            unit="°"
          />
          <YAxis yAxisId="rain" orientation="right" hide />
          <Tooltip content={<DayTooltip />} cursor={{ fill: "var(--secondary)" }} />
          <Bar
            yAxisId="rain"
            dataKey="rain"
            fill="var(--chart-3)"
            opacity={0.45}
            radius={3}
            barSize={12}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="max"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="min"
            stroke="var(--chart-2)"
            strokeWidth={2.5}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border px-5 py-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary px-3 py-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

const SURFACE_LAND: Record<Surface, { category: PointAnalysis["land"]["category"]; detail: string }> = {
  water: { category: "Water body", detail: "Google Maps shows water at this exact spot." },
  road: { category: "Road / paved surface", detail: "Google Maps shows a road at this exact spot." },
  built: { category: "Built-up", detail: "Google Maps shows a building at this exact spot." },
};

const UNUSABLE: string[] = ["Water body", "Road / paved surface", "Built-up"];

const UNUSABLE_MESSAGE: Record<string, string> = {
  "Water body": "This spot is a river, lake, pond or other water body. Crops cannot be grown here.",
  "Road / paved surface": "This spot is a road or paved surface. Crops cannot be grown here.",
  "Built-up": "There is already a building or structure here. Crops cannot be grown here.",
};

export function DetailPanel({
  data,
  surface = null,
  loading,
  error,
  onClose,
}: {
  data: PointAnalysis | null;
  surface?: Surface | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const [override, setOverride] = useState<string | null>(null);
  const pointKey = data ? `${data.point.lat},${data.point.lng}` : "";
  useEffect(() => {
    setOverride(null);
  }, [pointKey]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Reading soil, weather and land records for this spot…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-foreground">{error}</p>
        <button
          onClick={onClose}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          Close
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <MapPin className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium text-foreground">Tap anywhere inside the shaded taluks</p>
        <p className="text-xs text-muted-foreground">
          You'll get the land type, full soil profile, live weather, a 7-day history, a 15-day
          forecast from our trained model, and the five best crops to plant right now.
        </p>
      </div>
    );
  }

  const { place, soil, land: serverLand, weather, forecast, crops: rawCrops, climate } = data;
  const seen = surface ? SURFACE_LAND[surface] : null;
  // What Google Maps draws at the exact spot beats a low/medium-confidence guess.
  const rawLand =
    seen && !(serverLand.confidence === "high" && !serverLand.agricultural)
      ? { ...serverLand, ...seen, confidence: "high" as const, agricultural: false }
      : serverLand;
  const chosen = OVERRIDES.find((o) => o.label === override);
  const land = chosen
    ? { ...rawLand, category: chosen.label as typeof rawLand.category, detail: chosen.detail, confidence: "high" as const, agricultural: chosen.agricultural }
    : rawLand;
  const crops = land.agricultural ? rawCrops : [];
  const Icon = CATEGORY_ICON[land.category] ?? MapPin;
  const blocked = UNUSABLE.includes(land.category);
  const streetView = KEY
    ? `https://maps.googleapis.com/maps/api/streetview?size=640x300&location=${data.point.lat},${data.point.lng}&fov=90&radius=400&return_error_code=true&key=${KEY}`
    : null;

  if (blocked) {
    return (
      <div className="flex h-full flex-col overflow-y-auto px-5 py-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-destructive" />
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                {land.category}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {place.village ? `${place.village}, ` : ""}
              {data.taluk} taluk · {data.district}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatLatLng(data.point.lat, data.point.lng)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
            <Ban className="h-4 w-4" /> This land can't be used for farming
          </div>
          <p className="mt-2 text-sm text-foreground">{UNUSABLE_MESSAGE[land.category]}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Tap a field or open plot nearby to see soil, weather and crop advice.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Not right? It is actually:</span>
          {OVERRIDES.filter((o) => o.label !== land.category).map((o) => (
            <button
              key={o.label}
              onClick={() => setOverride(o.label)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const pastChart = weather.past.map((d) => ({
    day: shortDate(d.date),
    max: d.tMax,
    min: d.tMin,
    rain: d.rain,
  }));
  const fcChart = forecast.days.map((d) => ({
    day: shortDate(d.date),
    max: d.tMax,
    min: d.tMin,
    rain: d.rain,
  }));

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {streetView && (
        <img
          src={streetView}
          alt={`View near ${place.village ?? data.taluk}`}
          className="h-40 w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}

      <div className="px-5 pb-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                {land.category}
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {place.village ? `${place.village}, ` : ""}
              {data.taluk} taluk · {data.district}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatLatLng(data.point.lat, data.point.lng)}
              {place.elevation != null ? ` · ${place.elevation} m elevation` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-foreground">{land.detail}</p>
        {!chosen && rawLand.confidence === "low" && (
          <p className="mt-1 text-xs text-muted-foreground">
            This is a best guess from public map records, which often miss small ponds, sheds and
            new plots. If the satellite picture shows something else, correct it below.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">What is actually here?</span>
          {OVERRIDES.map((o) => (
            <button
              key={o.label}
              onClick={() => setOverride(override === o.label ? null : o.label)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                override === o.label
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {place.address && <p className="mt-1 text-xs text-muted-foreground">{place.address}</p>}

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${data.point.lat},${data.point.lng}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <Navigation className="h-3.5 w-3.5" /> Directions
        </a>
      </div>

      <Section title={weather.partial ? "Weather estimate" : "Live weather"}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat
            label="Temperature"
            value={weather.current.temperature != null ? `${weather.current.temperature} °C` : "—"}
          />
          <Stat
            label="Humidity"
            value={weather.current.humidity != null ? `${weather.current.humidity} %` : "—"}
          />
          <Stat
            label="Rain now"
            value={weather.current.precipitation != null && weather.current.precipitation > 0 ? "Yes" : "No"}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Rain in the last 30 days: {climate.rainPast30} mm · expected over the coming crop cycle:{" "}
          {climate.seasonWater} mm
        </p>
        {weather.partial && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            The live feed is temporarily unavailable, so these values use recent records or local
            seasonal averages. Soil and crop results are still available.
          </p>
        )}
      </Section>

      <Section title="How the weather has been (last 7 days)">
        <p className="mb-2 text-sm text-foreground">
          Hottest afternoon {Math.round(Math.max(...pastChart.map((d) => d.max)))}°C, coolest night{" "}
          {Math.round(Math.min(...pastChart.map((d) => d.min)))}°C, and{" "}
          {Math.round(pastChart.reduce((s, d) => s + d.rain, 0))} mm of rain in the week
          {pastChart.filter((d) => d.rain >= 1).length > 0
            ? ` (rain on ${pastChart.filter((d) => d.rain >= 1).length} of 7 days).`
            : " (no real rain)."}
        </p>
        <ChartKey />
        <WeatherChart data={pastChart} />
        <p className="mt-2 text-[11px] text-muted-foreground">
          Tap or hover a day to see its exact numbers.
        </p>
      </Section>

      <Section title="What to expect (next 15 days)">
        <div className="mb-3 grid grid-cols-3 gap-2">
          <Stat
            label="Usual daytime"
            value={`${Math.round(fcChart.reduce((s, d) => s + d.max, 0) / fcChart.length)} °C`}
          />
          <Stat
            label="Usual night"
            value={`${Math.round(fcChart.reduce((s, d) => s + d.min, 0) / fcChart.length)} °C`}
          />
          <Stat label="Total rain" value={`${Math.round(climate.rainNext15)} mm`} />
        </div>
        <p className="mb-2 flex items-start gap-1.5 text-sm text-foreground">
          <CloudRain className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            {fcChart.filter((d) => d.rain >= 1).length === 0
              ? "Almost no rain expected — plan for watering."
              : `Rain is likely on ${fcChart.filter((d) => d.rain >= 1).length} of the next 15 days, heaviest around ${
                  [...fcChart].sort((a, b) => b.rain - a.rain)[0].day
                }.`}
          </span>
        </p>
        <ChartKey />
        <WeatherChart data={fcChart} everyOther />
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          This is a computer prediction from 22 years of local weather records, so treat it as a
          guide. A week ahead it is usually off by about{" "}
          {forecast.accuracy.map((a) => `${a.mae}${a.unit} on ${a.variable}`).join(" and ")}.
        </p>
      </Section>


      <Section title="Soil profile (0–30 cm)">
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          {soil.texture && (
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium capitalize">
              {soil.texture} soil
            </span>
          )}
          {soil.drainage && (
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium capitalize">
              {soil.drainage}
            </span>
          )}
        </div>
        <div className="space-y-4">
          {(["chemical", "physical"] as const).map((group) => (
            <div key={group}>
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold capitalize text-foreground">
                {group === "chemical" ? (
                  <Droplets className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Thermometer className="h-3.5 w-3.5 text-primary" />
                )}
                {group} properties
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {soil.layers
                    .filter((l) => l.group === group)
                    .map((l) => (
                      <tr key={l.key} className="border-b border-border/60 last:border-0">
                        <td className="py-1.5 pr-2 text-muted-foreground">{l.label}</td>
                        <td className="py-1.5 text-right font-semibold text-foreground">
                          {l.value == null ? "—" : `${l.value}${l.unit ? ` ${l.unit}` : ""}`}
                        </td>
                        <td className="w-24 py-1.5 pl-2 text-right text-[11px] text-muted-foreground">
                          {l.ideal}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Source: {soil.source}</p>
      </Section>

      <Section title="Best crops to plant now">
        {crops.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This point is not cultivable land, so no crop plan is shown. Pick a field or plantation
            nearby to see recommendations.
          </p>
        ) : (
          <ol className="space-y-3">
            {crops.map((c, i) => (
              <li key={c.crop.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{c.crop.name}</span>
                      <span className="text-xs text-muted-foreground">{c.crop.kannada}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {c.crop.category} · {c.crop.durationDays} day cycle
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-foreground">
                      {Math.round(c.score * 100)}%
                    </div>
                    <div className="text-[11px] text-muted-foreground">{c.rating}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-foreground">{c.advice}</p>
                <div className="mt-2 grid gap-1">
                  {c.factors.map((f) => (
                    <div key={f.label} className="flex items-center gap-2">
                      <span className="w-28 shrink-0 text-[11px] text-muted-foreground">
                        {f.label}
                      </span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${Math.round(f.score * 100)}%` }}
                        />
                      </span>
                      <span className="w-8 text-right text-[11px] text-muted-foreground">
                        {Math.round(f.score * 100)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {c.factors.map((f) => f.detail).join(" · ")}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {place.nearby.length > 0 && (
        <Section title="Nearby places">
          <ul className="space-y-1.5 text-xs">
            {place.nearby.slice(0, 5).map((p) => (
              <li key={`${p.name}-${p.distanceM}`} className="flex justify-between gap-2">
                <span className="text-foreground">{p.name}</span>
                <span className="shrink-0 text-muted-foreground">{p.distanceM} m</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
