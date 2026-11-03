import { createFileRoute } from "@tanstack/react-router";
import { Upload, Sparkles, MapPin, Loader2, Compass, CheckCircle2, RotateCcw, ExternalLink, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLiveWeather, type LiveWeather } from "@/lib/weather";
import { CROP_RECOMMENDATION_MODEL } from "@/lib/crop-recommendation";
import { KARNATAKA_MAP } from "@/data/karnataka-map";
import { PROFILE_BY_NAME, type DistrictProfile } from "@/data/karnataka-profiles";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Interactive AI Demo — Crop & Disease Analysis | AGROVA AI" },
      {
        name: "description",
        content:
          "Try AGROVA AI: fetch your location automatically to get instant crop recommendations, or scan a leaf image for disease, severity and treatment.",
      },
      { property: "og:title", content: "AGROVA AI Interactive Demo" },
      {
        property: "og:description",
        content: "Sample crop recommendations and leaf disease analysis in your browser.",
      },
    ],
  }),
  component: DemoPage,
});

type Recommendation = {
  crop: string;
  score: number;
  yield: string;
  water: string;
  profit: string;
  risk: string;
};

type FieldParameters = {
  soil: string;
  ph: number;
  npk: string;
  organicCarbon: number;
  groundwater: string;
  annualRainfall: number;
};

type MonthRecommendation = {
  months: string;
  crop: string;
  season: string;
  note: string;
};

const MONTHLY_RECOMMENDATIONS: MonthRecommendation[] = [
  { months: "January - March", crop: "Paddy", season: "Summer / irrigated season", note: "Best where irrigation is available and the field can retain water." },
  { months: "April - August", crop: "Maize", season: "Kharif season", note: "Suits warm weather and the early-to-monsoon rainfall window." },
  { months: "September - October", crop: "Groundnut", season: "Late Kharif season", note: "Choose well-drained soil and avoid waterlogging during pod formation." },
  { months: "November - December", crop: "Ragi", season: "Rabi season", note: "A hardy option for the cooler months with lower water demand." },
];

const CROP_LIBRARY: {
  crop: string;
  soils: string[];
  rain: [number, number];
  temp: [number, number];
  ph: [number, number];
  organicCarbon: [number, number];
  nutrients: string[];
  groundwater: string[];
  yield: string;
  water: string;
  profit: string;
}[] = [
  { crop: "Rice", soils: ["clay", "loam"], rain: [900, 2200], temp: [22, 35], ph: [5.5, 7.5], organicCarbon: [0.4, 2], nutrients: ["medium", "high"], groundwater: ["shallow", "moderate"], yield: "5.4 t/ha", water: "High", profit: "₹62,000/ha" },
  { crop: "Maize", soils: ["loam", "sandy"], rain: [500, 1200], temp: [20, 33], ph: [5.5, 7.5], organicCarbon: [0.35, 1.5], nutrients: ["low", "medium", "high"], groundwater: ["moderate", "shallow"], yield: "6.1 t/ha", water: "Medium", profit: "₹54,000/ha" },
  { crop: "Groundnut", soils: ["sandy", "loam"], rain: [400, 900], temp: [24, 34], ph: [6, 7.5], organicCarbon: [0.3, 1.2], nutrients: ["low", "medium"], groundwater: ["deep", "moderate"], yield: "2.3 t/ha", water: "Low", profit: "₹48,000/ha" },
  { crop: "Cotton", soils: ["black", "loam"], rain: [500, 1100], temp: [24, 38], ph: [6, 8], organicCarbon: [0.35, 1.5], nutrients: ["low", "medium", "high"], groundwater: ["deep", "moderate"], yield: "2.1 t/ha", water: "Medium", profit: "₹71,000/ha" },
  { crop: "Sugarcane", soils: ["loam", "clay", "black"], rain: [1000, 2500], temp: [22, 36], ph: [6, 8], organicCarbon: [0.5, 2.5], nutrients: ["medium", "high"], groundwater: ["shallow", "moderate"], yield: "78 t/ha", water: "Very high", profit: "₹98,000/ha" },
  { crop: "Millets", soils: ["sandy", "red"], rain: [300, 800], temp: [22, 36], ph: [5.5, 8], organicCarbon: [0.25, 1.5], nutrients: ["low", "medium"], groundwater: ["deep", "moderate"], yield: "1.8 t/ha", water: "Very low", profit: "₹32,000/ha" },
  { crop: "Soybean", soils: ["black", "loam"], rain: [600, 1200], temp: [20, 32], ph: [6, 7.5], organicCarbon: [0.4, 1.8], nutrients: ["medium", "high"], groundwater: ["moderate", "shallow"], yield: "2.7 t/ha", water: "Medium", profit: "₹45,000/ha" },
  { crop: "Tomato", soils: ["loam", "red", "sandy"], rain: [400, 1000], temp: [18, 30], ph: [6, 7.5], organicCarbon: [0.4, 2], nutrients: ["medium", "high"], groundwater: ["moderate", "shallow"], yield: "38 t/ha", water: "Medium", profit: "₹1,10,000/ha" },
];

function inRange(v: number, [lo, hi]: [number, number]) {
  if (v >= lo && v <= hi) return 1;
  const span = hi - lo || 1;
  const dist = v < lo ? lo - v : v - hi;
  return Math.max(0, 1 - dist / span);
}

function recommend(field: FieldParameters, temperature: number, forecastRainfall = 0): Recommendation[] {
  return CROP_LIBRARY.map((c) => {
    const soilType = field.soil.toLowerCase();
    const soilFit = c.soils.some((soil) => soilType.includes(soil)) ? 1 : 0.4;
    const nutrientFit = c.nutrients.some((nutrient) => field.npk.toLowerCase().includes(nutrient)) ? 1 : 0.55;
    const groundwaterFit = c.groundwater.some((water) => field.groundwater.toLowerCase().includes(water)) ? 1 : 0.55;
    const raw =
      0.22 * soilFit +
      0.16 * inRange(field.annualRainfall, c.rain) +
      0.14 * inRange(forecastRainfall * 52, c.rain) +
      0.16 * inRange(temperature, c.temp) +
      0.12 * inRange(field.ph, c.ph) +
      0.08 * inRange(field.organicCarbon, c.organicCarbon) +
      0.07 * nutrientFit +
      0.05 * groundwaterFit;
    const score = Math.round(raw * 100);
    return {
      crop: c.crop,
      score,
      yield: c.yield,
      water: c.water,
      profit: c.profit,
      risk: score > 82 ? "Low" : score > 65 ? "Moderate" : "Elevated",
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

type Medicine = { name: string; shop: string; url: string };

const SAMPLE_DIAGNOSES = [
  {
    disease: "Early Blight (Alternaria solani)",
    confidence: 94,
    severity: "Moderate — 18% leaf area affected",
    organic: "Neem oil 3% spray every 7 days; remove and burn infected lower leaves.",
    chemical: "Mancozeb 75% WP @ 2 g/L, two sprays 10 days apart.",
    prevention: "Rotate with non-solanaceous crops; drip irrigate to keep foliage dry.",
    medicines: [
      {
        name: "Mancozeb 75% WP (contact fungicide)",
        shop: "BigHaat",
        url: "https://www.bighaat.com/search?q=mancozeb+75+wp",
      },
      {
        name: "Neem oil 3% (organic alternative)",
        shop: "Amazon India",
        url: "https://www.amazon.in/s?k=neem+oil+pest+control+agriculture",
      },
    ] satisfies Medicine[],
  },
  {
    disease: "Bacterial Leaf Blight",
    confidence: 91,
    severity: "High — 34% leaf area affected",
    organic: "Pseudomonas fluorescens foliar spray; drain field for 2 days.",
    chemical: "Copper oxychloride @ 2.5 g/L with streptocycline.",
    prevention: "Use certified resistant seed; avoid excess nitrogen.",
    medicines: [
      {
        name: "Copper oxychloride 50% WP (bactericide)",
        shop: "BigHaat",
        url: "https://www.bighaat.com/search?q=copper+oxychloride",
      },
      {
        name: "Streptocycline 90% (antibiotic for blight)",
        shop: "BigHaat",
        url: "https://www.bighaat.com/search?q=streptocycline",
      },
    ] satisfies Medicine[],
  },
  {
    disease: "Leaf Rust (Puccinia spp.)",
    confidence: 89,
    severity: "Low — 7% leaf area affected",
    organic: "Sulphur dust at first pustule appearance; widen row spacing.",
    chemical: "Propiconazole 25% EC @ 1 ml/L.",
    prevention: "Early sowing and resistant varieties reduce incidence.",
    medicines: [
      {
        name: "Propiconazole 25% EC (systemic fungicide)",
        shop: "BigHaat",
        url: "https://www.bighaat.com/search?q=propiconazole+25+ec",
      },
      {
        name: "Sulphur 80% WDG (organic-compatible)",
        shop: "Amazon India",
        url: "https://www.amazon.in/s?k=sulphur+80+wdg+fungicide",
      },
    ] satisfies Medicine[],
  },
];

type LocationInfo = {
  name: string;
  lat: number;
  lon: number;
  soil: string;
  rainfall: string;
  temperature: string;
};

const DEFAULT_FALLBACK_LOCATION: LocationInfo = {
  name: "Southern Dry Zone (Mandya/Mysuru)",
  lat: 12.5228,
  lon: 76.8976,
  soil: "loam",
  rainfall: "850",
  temperature: "28",
};

// Preset region profiles for location mapping fallback
const REGION_PRESETS: Record<string, LocationInfo> = {
  south_ka: DEFAULT_FALLBACK_LOCATION,
  north_ka: { name: "Northern Black Soil Zone (Dharwad/Belagavi)", lat: 15.4589, lon: 75.0078, soil: "black", rainfall: "720", temperature: "31" },
  coastal_ka: { name: "Coastal & Ghats Zone (Mangaluru/Udupi)", lat: 12.9141, lon: 74.8560, soil: "clay", rainfall: "3200", temperature: "29" },
  central_ka: { name: "Central Red Soil Zone (Davangere/Chitradurga)", lat: 14.4673, lon: 75.9242, soil: "red", rainfall: "650", temperature: "30" },
  sandy_belt: { name: "Kolar & Chikkaballapur Horticulture Belt", lat: 13.1364, lon: 78.1292, soil: "sandy", rainfall: "740", temperature: "27" },
};

const MAP_DATA = KARNATAKA_MAP as unknown as {
  width: number;
  height: number;
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  districts: { name: string; cx: number; cy: number }[];
};

function nearestDistrictProfile(lat: number, lon: number): DistrictProfile | undefined {
  let nearest: { name: string; distance: number } | undefined;
  for (const district of MAP_DATA.districts) {
    const districtLon = MAP_DATA.minLon + (district.cx / MAP_DATA.width) * (MAP_DATA.maxLon - MAP_DATA.minLon);
    const districtLat = MAP_DATA.maxLat - (district.cy / MAP_DATA.height) * (MAP_DATA.maxLat - MAP_DATA.minLat);
    const distance = Math.hypot(districtLat - lat, districtLon - lon);
    if (!nearest || distance < nearest.distance) nearest = { name: district.name, distance };
  }
  return nearest ? PROFILE_BY_NAME[nearest.name] : undefined;
}

function soilCategory(soil: string) {
  const lower = soil.toLowerCase();
  return lower.includes("black") ? "black" : lower.includes("clay") ? "clay" : lower.includes("sand") ? "sandy" : lower.includes("red") || lower.includes("later") ? "red" : "loam";
}

function toFieldParameters(profile: DistrictProfile): FieldParameters {
  return {
    soil: soilCategory(profile.soil),
    ph: profile.ph,
    npk: profile.npk,
    organicCarbon: Number.parseFloat(profile.organicCarbon) || 0,
    groundwater: profile.groundwater,
    annualRainfall: profile.rainfall,
  };
}

function DemoPage() {
  const [useLocationToggle, setUseLocationToggle] = useState(true);
  const [locating, setLocating] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationInfo | null>(DEFAULT_FALLBACK_LOCATION);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [fieldParameters, setFieldParameters] = useState<FieldParameters>(() =>
    toFieldParameters(PROFILE_BY_NAME["Mandya"]!),
  );

  const [soil, setSoil] = useState("loam");
  const [rainfall, setRainfall] = useState("850");
  const [temperature, setTemperature] = useState("28");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [results, setResults] = useState<Recommendation[] | null>(() =>
    recommend(fieldParameters, 28)
  );

  useEffect(() => {
    if (useLocationToggle) fetchLiveLocation();
  }, [useLocationToggle]);

  const selectedMonthNumber = new Date(`${selectedMonth} 1, 2026`).getMonth() + 1;
  const monthlyRecommendation = MONTHLY_RECOMMENDATIONS.find((recommendation) => {
    if (selectedMonthNumber <= 3) return recommendation.crop === "Paddy";
    if (selectedMonthNumber <= 8) return recommendation.crop === "Maize";
    if (selectedMonthNumber <= 10) return recommendation.crop === "Groundnut";
    return recommendation.crop === "Ragi";
  }) ?? MONTHLY_RECOMMENDATIONS[0];

  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<(typeof SAMPLE_DIAGNOSES)[number] | null>(null);

  function fetchLiveLocation() {
    setLocating(true);
    setLocationError(null);

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocating(false);
      setLocationError("Geolocation is not supported on your browser. Loaded preset data.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));

        const profile = nearestDistrictProfile(lat, lon) ?? PROFILE_BY_NAME["Mandya"]!;
        const parameters = toFieldParameters(profile);

        const info: LocationInfo = {
          name: `${profile.name} field (${lat}°N, ${lon}°E)`,
          lat,
          lon,
          soil: parameters.soil,
          rainfall: String(parameters.annualRainfall),
          temperature: profile.temperature,
        };

        setDetectedLocation(info);
        setFieldParameters(parameters);
        setSoil(parameters.soil);
        setRainfall(String(parameters.annualRainfall));
        setTemperature(profile.temperature.split("–")[0] ?? "28");
        setLocating(false);

        setWeatherLoading(true);
        void getLiveWeather({ data: { lat, lon } })
          .then((weather) => {
            setLiveWeather(weather);
            setRainfall(String(weather.rainfall));
            setTemperature(String(weather.temperature));
            setResults(recommend(parameters, weather.temperature, weather.rainfall));
          })
          .catch(() => {
            setLiveWeather(null);
            setLocationError("Live weather was unavailable. Using the regional weather preset.");
            setResults(recommend(parameters, Number(parameters.annualRainfall), Number(profile.temperature.split("–")[0]) || 28));
          })
          .finally(() => setWeatherLoading(false));
      },
      (err) => {
        setLocating(false);
        const fallback = DEFAULT_FALLBACK_LOCATION;
        setDetectedLocation(fallback);
        setSoil(fallback.soil);
        setRainfall(fallback.rainfall);
        setTemperature(fallback.temperature);
        setFieldParameters({ ...fieldParameters, soil: fallback.soil, annualRainfall: Number(fallback.rainfall) });
        setLiveWeather(null);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. Defaulted to region preset."
            : "Could not retrieve exact GPS coords. Using regional preset."
        );
        setResults(recommend({ ...fieldParameters, soil: fallback.soil, annualRainfall: Number(fallback.rainfall) }, Number(fallback.temperature)));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleLocationToggle(active: boolean) {
    setUseLocationToggle(active);
  }

  function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setDiagnosis(null);
    setScanning(true);
    const pick = SAMPLE_DIAGNOSES[file.size % SAMPLE_DIAGNOSES.length] ?? SAMPLE_DIAGNOSES[0]!;
    window.setTimeout(() => {
      setDiagnosis(pick);
      setScanning(false);
    }, 1400);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Badge variant="secondary">Interactive demo</Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">See the AI in action</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        This public demo fetches real location parameters or leaf photos to run instant crop suitability & disease analysis.
      </p>

      <Tabs defaultValue="crop" className="mt-10">
        <TabsList>
          <TabsTrigger value="crop">Crop recommendation</TabsTrigger>
          <TabsTrigger value="disease">Disease detection</TabsTrigger>
        </TabsList>

        <TabsContent value="crop" className="mt-6">
          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Compass className="size-5 text-primary" /> Location & Field Parameters
                </CardTitle>

                {/* Location Toggle Icon & Switch */}
                <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary animate-bounce" />
                    <Label htmlFor="location-toggle" className="cursor-pointer text-sm font-semibold">
                      Auto Location Toggle
                    </Label>
                  </div>
                  <Switch
                    id="location-toggle"
                    checked={useLocationToggle}
                    onCheckedChange={handleLocationToggle}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Location Status & Live Fetch Bar */}
              {useLocationToggle && (
                <div className="mb-6 rounded-2xl border border-primary/20 bg-accent/30 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-primary p-2.5 text-primary-foreground shadow-sm">
                        <MapPin className="size-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-semibold">
                            {detectedLocation?.name || "Detecting field location..."}
                          </span>
                          <Badge variant="outline" className="text-xs bg-background">
                            GPS Active
                          </Badge>
                        </div>
                        {detectedLocation && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Coords: {detectedLocation.lat}°N, {detectedLocation.lon}°E | District soil profile & live weather
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchLiveLocation}
                      disabled={locating}
                      className="gap-2"
                    >
                      {locating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Fetching GPS...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="size-4 text-primary" /> Refresh Location
                        </>
                      )}
                    </Button>
                  </div>

                  {locationError && (
                    <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ {locationError}
                    </p>
                  )}
                </div>
              )}

              {/* Input fields / Preset parameters display */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="soil">Soil type</Label>
                    {useLocationToggle && (
                      <span className="text-[10px] uppercase font-bold text-primary">Auto Fetched</span>
                    )}
                  </div>
                  <Select
                    value={soil}
                    onValueChange={(val) => {
                      setSoil(val);
                      setFieldParameters((current) => ({ ...current, soil: val }));
                      if (useLocationToggle) {
                        setResults(recommend({ ...fieldParameters, soil: val }, Number(temperature) || 0, liveWeather?.rainfall));
                      }
                    }}
                  >
                    <SelectTrigger id="soil">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["loam", "clay", "sandy", "black", "red"].map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <Label htmlFor="rain">Annual rainfall profile (mm)</Label>
                    {useLocationToggle && (
                      <span className="text-[10px] uppercase font-bold text-primary">Auto Fetched</span>
                    )}
                  </div>
                  <Input
                    id="rain"
                    type="number"
                    value={rainfall}
                    onChange={(e) => {
                      setRainfall(e.target.value);
                      setFieldParameters((current) => ({ ...current, annualRainfall: Number(e.target.value) || 0 }));
                      if (useLocationToggle) {
                        setResults(recommend({ ...fieldParameters, annualRainfall: Number(e.target.value) || 0 }, Number(temperature) || 0, liveWeather?.rainfall));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <Label htmlFor="temp">Current temperature (°C)</Label>
                    {useLocationToggle && (
                      <span className="text-[10px] uppercase font-bold text-primary">Auto Fetched</span>
                    )}
                  </div>
                  <Input
                    id="temp"
                    type="number"
                    value={temperature}
                    onChange={(e) => {
                      setTemperature(e.target.value);
                      if (useLocationToggle) {
                        setResults(recommend(fieldParameters, Number(e.target.value) || 0, liveWeather?.rainfall));
                      }
                    }}
                  />
                </div>
                {liveWeather && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Current weather: {liveWeather.description} · {liveWeather.temperature}°C · {liveWeather.rainfall} mm expected over 7 days · fetched {new Date(liveWeather.fetchedAt).toLocaleTimeString()}
                  </p>
                )}
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-primary/10 pt-4 text-sm sm:grid-cols-3">
                  {[
                    ["Soil type", fieldParameters.soil],
                    ["pH", String(fieldParameters.ph)],
                    ["NPK", fieldParameters.npk],
                    ["Organic carbon", `${fieldParameters.organicCarbon}%`],
                    ["Groundwater", fieldParameters.groundwater],
                    ["Annual rainfall", `${fieldParameters.annualRainfall} mm`],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-xs text-muted-foreground">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">Month-wise crop plan</p>
                    <h3 className="mt-1 font-display text-xl font-bold">
                      Recommended crop for {selectedMonth}
                    </h3>
                  </div>
                  <div className="w-full sm:w-48">
                    <Label htmlFor="recommendation-month">Select month</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger id="recommendation-month" className="mt-2 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December",
                        ].map((month) => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-display text-2xl font-bold text-primary">{monthlyRecommendation.crop}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {monthlyRecommendation.months} · {monthlyRecommendation.season}
                    </p>
                    <p className="mt-3 text-sm">{monthlyRecommendation.note}</p>
                  </div>
                  <Badge variant="secondary" className="w-fit">Seasonal guidance</Badge>
                </div>

                <div className="mt-6 grid gap-3 border-t border-primary/10 pt-4 sm:grid-cols-4">
                  {MONTHLY_RECOMMENDATIONS.map((recommendation) => (
                    <button
                      key={recommendation.months}
                      type="button"
                      className="rounded-xl border border-border/60 bg-background/70 p-3 text-left transition-colors hover:border-primary/50"
                      onClick={() => setSelectedMonth(recommendation.months.split(" ")[0] ?? "January")}
                    >
                      <span className="block text-xs text-muted-foreground">{recommendation.months}</span>
                      <span className="mt-1 block font-semibold">{recommendation.crop}</span>
                    </button>
                  ))}
                </div>
              </div>

              {!useLocationToggle && (
                <Button
                  variant="hero"
                  size="lg"
                  className="mt-6"
                  onClick={() =>
                    setResults(
                      recommend(fieldParameters, Number(temperature) || 0, liveWeather?.rainfall),
                    )
                  }
                >
                  <Sparkles /> Generate recommendation
                </Button>
              )}

              {results && (
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-emerald-600" />
                      Top Recommended Crops for Location
                    </h3>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Badge variant="outline" className="text-xs">{CROP_RECOMMENDATION_MODEL}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {weatherLoading ? "FETCHING LIVE WEATHER..." : `${soil.toUpperCase()} · ${rainfall}mm / 7 days · ${temperature}°C`}
                      </Badge>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {results.map((r, i) => (
                      <li
                        key={r.crop}
                        className="rounded-2xl border border-border/60 p-5 shadow-soft bg-card/60 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="font-display text-lg font-bold">
                            {i + 1}. {r.crop}
                          </p>
                          <Badge variant={i === 0 ? "default" : "secondary"}>
                            {r.score}% match
                          </Badge>
                        </div>
                        <Progress value={r.score} className="mt-3" />
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                          {[
                            ["Expected yield", r.yield],
                            ["Water need", r.water],
                            ["Profit potential", r.profit],
                            ["Risk", r.risk],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-xs text-muted-foreground">{k}</dt>
                              <dd className="font-medium">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disease" className="mt-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Leaf image analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="leaf"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-10 text-center transition-colors hover:border-primary hover:bg-accent/40"
              >
                <Upload className="size-6 text-primary" />
                <span className="mt-3 text-sm font-medium">Upload a leaf photo</span>
                <span className="mt-1 text-xs text-muted-foreground">
                  JPG or PNG, clear daylight image of the affected leaf
                </span>
                <input
                  id="leaf"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>

              {preview && (
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <img
                    src={preview}
                    alt="Uploaded leaf preview"
                    loading="lazy"
                    className="w-full rounded-2xl object-cover shadow-soft"
                  />
                  <div>
                    {scanning && (
                      <p className="text-sm text-muted-foreground">Analysing leaf tissue…</p>
                    )}
                    {diagnosis && (
                      <div className="space-y-4">
                        <div>
                          <p className="font-display text-xl font-bold">{diagnosis.disease}</p>
                          <p className="text-sm text-muted-foreground">{diagnosis.severity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <Progress value={diagnosis.confidence} className="mt-2" />
                          <p className="mt-1 text-sm font-medium">{diagnosis.confidence}%</p>
                        </div>
                         {[
                          ["Organic treatment", diagnosis.organic],
                          ["Chemical treatment", diagnosis.chemical],
                          ["Prevention", diagnosis.prevention],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {k}
                            </p>
                            <p className="text-sm">{v}</p>
                          </div>
                        ))}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Medicine to buy
                          </p>
                          <div className="mt-2 space-y-2">
                            {diagnosis.medicines.map((med) => (
                              <a
                                key={med.name}
                                href={med.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 rounded-xl border bg-secondary/40 px-3 py-2 transition-colors hover:bg-secondary/70"
                              >
                                <span className="text-sm font-medium">{med.name}</span>
                                <Button size="sm" variant="hero" tabIndex={-1} asChild>
                                  <span>
                                    <ShoppingCart /> Buy
                                    <ExternalLink />
                                  </span>
                                </Button>
                              </a>
                            ))}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Opens the product's shopping site in a new tab. Follow the dosage on
                            the label.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}