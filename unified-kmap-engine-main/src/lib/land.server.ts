/** Server-only data fetchers for a clicked map point. */

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

/** Every outbound call gets a hard ceiling so one slow source cannot stall the request. */
function timeoutSignal(ms: number) {
  return AbortSignal.timeout(ms);
}


function gatewayHeaders() {
  const lovable = process.env["LOVABLE_API_KEY"];
  const conn = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovable || !conn) return null;
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": conn,
  } as Record<string, string>;
}

async function gatewayGet(path: string, extraHeaders: Record<string, string> = {}) {
  const headers = gatewayHeaders();
  if (!headers) throw new Error("Google Maps connection is not configured");
  const res = await fetch(`${GATEWAY}${path}`, {
    headers: { ...headers, ...extraHeaders },
    signal: timeoutSignal(8000),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Google Maps gateway failed [${res.status}]: ${body}`);
    throw new Error(`Google Maps request failed [${res.status}]`);
  }
  return res.json();
}

async function gatewayPost(path: string, body: unknown, extraHeaders: Record<string, string> = {}) {
  const headers = gatewayHeaders();
  if (!headers) throw new Error("Google Maps connection is not configured");
  const res = await fetch(`${GATEWAY}${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
    signal: timeoutSignal(8000),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Google Maps gateway failed [${res.status}]: ${text}`);
    throw new Error(`Google Maps request failed [${res.status}]`);
  }
  return res.json();
}

/* ---------------------------------- place ---------------------------------- */

export type PlaceInfo = {
  address: string | null;
  village: string | null;
  elevation: number | null;
  nearby: Array<{
    name: string;
    types: string[];
    distanceM: number;
    photoName: string | null;
    address: string | null;
  }>;
};

function haversine(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}

export async function fetchPlace(lat: number, lng: number): Promise<PlaceInfo> {
  const [geo, elev, places] = await Promise.allSettled([
    gatewayGet(`/maps/api/geocode/json?latlng=${lat},${lng}&result_type=street_address|locality|sublocality|administrative_area_level_3|route|premise`),
    gatewayGet(`/maps/api/elevation/json?locations=${lat},${lng}`),
    gatewayPost(
      "/places/v1/places:searchNearby",
      {
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 250 } },
        maxResultCount: 8,
        rankPreference: "DISTANCE",
      },
      {
        "X-Goog-FieldMask":
          "places.displayName,places.types,places.location,places.formattedAddress,places.photos",
      },
    ),
  ]);

  let address: string | null = null;
  let village: string | null = null;
  if (geo.status === "fulfilled") {
    const results = (geo.value?.results ?? []) as Array<{
      formatted_address: string;
      address_components: Array<{ long_name: string; types: string[] }>;
    }>;
    address = results[0]?.formatted_address ?? null;
    for (const r of results) {
      for (const c of r.address_components ?? []) {
        if (
          !village &&
          (c.types.includes("locality") ||
            c.types.includes("sublocality") ||
            c.types.includes("administrative_area_level_3"))
        ) {
          village = c.long_name;
        }
      }
    }
  }

  const elevation =
    elev.status === "fulfilled" && typeof elev.value?.results?.[0]?.elevation === "number"
      ? Math.round(elev.value.results[0].elevation * 10) / 10
      : null;

  const nearby: PlaceInfo["nearby"] = [];
  if (places.status === "fulfilled") {
    for (const p of (places.value?.places ?? []) as Array<{
      displayName?: { text?: string };
      types?: string[];
      location?: { latitude: number; longitude: number };
      formattedAddress?: string;
      photos?: Array<{ name?: string }>;
    }>) {
      if (!p.displayName?.text || !p.location) continue;
      nearby.push({
        name: p.displayName.text,
        types: p.types ?? [],
        distanceM: haversine(lat, lng, p.location.latitude, p.location.longitude),
        photoName: p.photos?.[0]?.name ?? null,
        address: p.formattedAddress ?? null,
      });
    }
    nearby.sort((a, b) => a.distanceM - b.distanceM);
  }

  return { address, village, elevation, nearby };
}

/* ----------------------------------- soil ---------------------------------- */

export type SoilLayer = {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  group: "physical" | "chemical";
  ideal: string;
};

export type SoilProfile = {
  ph: number | null;
  soc: number | null;
  nitrogen: number | null;
  cec: number | null;
  clay: number | null;
  sand: number | null;
  silt: number | null;
  bulkDensity: number | null;
  cfvo: number | null;
  wv0033: number | null;
  texture: "sandy" | "loamy" | "clayey" | null;
  drainage: "well drained" | "moderate" | "poorly drained" | null;
  layers: SoilLayer[];
  source: string;
};

const SOIL_PROPS = [
  "phh2o",
  "soc",
  "nitrogen",
  "cec",
  "clay",
  "sand",
  "silt",
  "bdod",
  "cfvo",
  "wv0033",
];

function textureClass(sand: number | null, clay: number | null) {
  if (sand == null || clay == null) return null;
  if (clay >= 35) return "clayey" as const;
  if (sand >= 70 && clay < 20) return "sandy" as const;
  return "loamy" as const;
}

/** Typical coastal-Karnataka lateritic profile, used when SoilGrids is unreachable. */
function regionalSoilEstimate(): Record<string, number | null> {
  return {
    phh2o: 5.7,
    soc: 15.5,
    nitrogen: 1.35,
    cec: 10.5,
    clay: 28,
    sand: 55,
    silt: 17,
    bdod: 1.34,
    cfvo: 12,
    wv0033: 26,
  };
}

type SoilGridsResponse = {
  properties?: {
    layers?: Array<{
      name: string;
      unit_measure?: { d_factor?: number; target_units?: string };
      depths?: Array<{ label: string; values?: { mean?: number | null } }>;
    }>;
  };
};

async function querySoilGrids(lat: number, lng: number): Promise<SoilGridsResponse | null> {
  const params = new URLSearchParams();
  params.set("lon", String(lng));
  params.set("lat", String(lat));
  for (const p of SOIL_PROPS) params.append("property", p);
  params.append("depth", "0-5cm");
  params.append("depth", "5-15cm");
  params.append("depth", "15-30cm");
  params.append("value", "mean");
  const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?${params}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "coastal-crop-advisor/1.0" },
        signal: timeoutSignal(8000),
      });
      if (res.ok) return (await res.json()) as SoilGridsResponse;
      console.error(`SoilGrids attempt ${attempt + 1} failed [${res.status}]`);
    } catch (err) {
      console.error(`SoilGrids attempt ${attempt + 1} errored`, err);
    }
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  return null;
}

export async function fetchSoil(lat: number, lng: number): Promise<SoilProfile> {
  const json = await querySoilGrids(lat, lng);
  const estimated = json == null;

  const val: Record<string, number | null> = estimated ? regionalSoilEstimate() : {};
  for (const layer of json?.properties?.layers ?? []) {
    const d = layer.unit_measure?.d_factor ?? 1;
    const means = (layer.depths ?? [])
      .map((dep) => dep.values?.mean)
      .filter((v): v is number => typeof v === "number");
    val[layer.name] = means.length ? means.reduce((s, v) => s + v, 0) / means.length / d : null;
  }
  if (!estimated && Object.values(val).every((v) => v == null)) {
    Object.assign(val, regionalSoilEstimate());
  }


  const r = (v: number | null, dp = 1) => (v == null ? null : Math.round(v * 10 ** dp) / 10 ** dp);
  const ph = r(val["phh2o"]);
  const clay = r(val["clay"]);
  const sand = r(val["sand"]);
  const silt = r(val["silt"]);
  const texture = textureClass(sand, clay);
  const bulkDensity = r(val["bdod"], 2);

  const drainage: SoilProfile["drainage"] =
    clay == null
      ? null
      : clay >= 45
        ? "poorly drained"
        : clay >= 30
          ? "moderate"
          : "well drained";

  const layers: SoilLayer[] = [
    { key: "ph", label: "pH (water)", value: ph, unit: "", group: "chemical", ideal: "5.5 \u2013 7.0" },
    { key: "soc", label: "Organic carbon", value: r(val["soc"]), unit: "g/kg", group: "chemical", ideal: "> 10 g/kg" },
    { key: "nitrogen", label: "Total nitrogen", value: r(val["nitrogen"], 2), unit: "g/kg", group: "chemical", ideal: "> 1.0 g/kg" },
    { key: "cec", label: "Cation exchange capacity", value: r(val["cec"]), unit: "cmol(c)/kg", group: "chemical", ideal: "> 10" },
    { key: "clay", label: "Clay", value: clay, unit: "%", group: "physical", ideal: "15 \u2013 35 %" },
    { key: "sand", label: "Sand", value: sand, unit: "%", group: "physical", ideal: "30 \u2013 70 %" },
    { key: "silt", label: "Silt", value: silt, unit: "%", group: "physical", ideal: "10 \u2013 40 %" },
    { key: "bdod", label: "Bulk density", value: bulkDensity, unit: "kg/dm\u00b3", group: "physical", ideal: "1.1 \u2013 1.4" },
    { key: "cfvo", label: "Coarse fragments", value: r(val["cfvo"]), unit: "%", group: "physical", ideal: "< 15 %" },
    { key: "wv0033", label: "Water holding (field capacity)", value: r(val["wv0033"]), unit: "vol %", group: "physical", ideal: "20 \u2013 35 %" },
  ];

  return {
    ph,
    soc: r(val["soc"]),
    nitrogen: r(val["nitrogen"], 2),
    cec: r(val["cec"]),
    clay,
    sand,
    silt,
    bulkDensity,
    cfvo: r(val["cfvo"]),
    wv0033: r(val["wv0033"]),
    texture,
    drainage,
    layers,
    source: estimated
      ? "Regional lateritic-soil averages for the coastal zone (global soil service unavailable)"
      : "ISRIC SoilGrids v2.0, 0\u201330 cm mean",

  };
}

/* --------------------------------- weather --------------------------------- */

export type WeatherBundle = {
  current: {
    temperature: number | null;
    humidity: number | null;
    precipitation: number | null;
    windSpeed: number | null;
    weatherCode: number | null;
    soilMoisture: number | null;
    soilTemperature: number | null;
    time: string | null;
  };
  past: Array<{ date: string; tMax: number; tMin: number; rain: number; humidity: number; et0: number | null }>;
  history30: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    relative_humidity_2m_mean: number[];
  };
  today: string;
  /** true when the live "current conditions" feed was unavailable and only archive data was used */
  partial?: boolean;
};

async function fetchJson(url: URL, attempts = 2, ms = 9000): Promise<Record<string, unknown> | null> {
  let last = 0;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const r = await fetch(url, { signal: timeoutSignal(ms) });
      if (r.ok) return (await r.json()) as Record<string, unknown>;
      last = r.status;
      console.error(`Weather attempt ${attempt + 1} failed [${r.status}] ${url.host}`);
    } catch (err) {
      console.error(`Weather attempt ${attempt + 1} errored ${url.host}`, err);
    }
    if (attempt < attempts - 1) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  console.error(`Weather source gave up ${url.host} (last status ${last || "network"})`);
  return null;
}


export async function fetchWeather(lat: number, lng: number): Promise<WeatherBundle> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,soil_moisture_3_to_9cm,soil_temperature_6cm",
  );
  url.searchParams.set(
    "daily",
    "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,et0_fao_evapotranspiration",
  );
  url.searchParams.set("past_days", "35");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("timezone", "Asia/Kolkata");

  // The live feed occasionally rate-limits or times out; retry, then fall back
  // to the historical archive so the analysis can still run.
  type Payload = {
    current?: Record<string, number | string>;
    daily?: Record<string, Array<number | string | null>>;
  };

  let j = (await fetchJson(url)) as Payload | null;
  let partial = false;

  if (!j) {
    const end = new Date(Date.now() + 5.5 * 3600 * 1000);
    const startD = new Date(end.getTime() - 40 * 86400000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const arch = new URL("https://archive-api.open-meteo.com/v1/archive");
    arch.searchParams.set("latitude", String(lat));
    arch.searchParams.set("longitude", String(lng));
    arch.searchParams.set("start_date", iso(startD));
    arch.searchParams.set("end_date", iso(end));
    arch.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,et0_fao_evapotranspiration",
    );
    arch.searchParams.set("timezone", "Asia/Kolkata");
    j = (await fetchJson(arch)) as Payload | null;
    partial = true;
  }

  if (!j || !j.daily) throw new Error("WEATHER_UNAVAILABLE");



  const daily = j.daily ?? {};
  const time = (daily["time"] ?? []) as string[];
  const num = (k: string) => (daily[k] ?? []).map((v) => (typeof v === "number" ? v : 0));
  const tMax = num("temperature_2m_max");
  const tMin = num("temperature_2m_min");
  const rain = num("precipitation_sum");
  const rh = num("relative_humidity_2m_mean");
  const et0 = num("et0_fao_evapotranspiration");

  const todayISO = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
  const todayIdx = Math.max(0, time.indexOf(todayISO) === -1 ? time.length - 1 : time.indexOf(todayISO));

  // last 30 completed days up to today, used as model input
  const start = Math.max(0, todayIdx - 34);
  const history30 = {
    time: time.slice(start, todayIdx + 1),
    temperature_2m_max: tMax.slice(start, todayIdx + 1),
    temperature_2m_min: tMin.slice(start, todayIdx + 1),
    precipitation_sum: rain.slice(start, todayIdx + 1),
    relative_humidity_2m_mean: rh.slice(start, todayIdx + 1),
  };

  const past = [];
  for (let i = Math.max(0, todayIdx - 6); i <= todayIdx; i++) {
    past.push({
      date: time[i],
      tMax: Math.round(tMax[i] * 10) / 10,
      tMin: Math.round(tMin[i] * 10) / 10,
      rain: Math.round(rain[i] * 10) / 10,
      humidity: Math.round(rh[i]),
      et0: et0[i] ?? null,
    });
  }

  const c = j.current ?? {};
  const cn = (k: string) => (typeof c[k] === "number" ? (c[k] as number) : null);
  const lastDay = past[past.length - 1];

  return {
    current: {
      temperature: cn("temperature_2m") ?? (lastDay ? Math.round(((lastDay.tMax + lastDay.tMin) / 2) * 10) / 10 : null),
      humidity: cn("relative_humidity_2m") ?? (lastDay ? lastDay.humidity : null),
      precipitation: cn("precipitation") ?? (lastDay ? lastDay.rain : null),
      windSpeed: cn("wind_speed_10m"),
      weatherCode: cn("weather_code"),
      soilMoisture: cn("soil_moisture_3_to_9cm"),
      soilTemperature: cn("soil_temperature_6cm"),
      time: typeof c["time"] === "string" ? (c["time"] as string) : null,
    },
    past,
    history30,
    today: time[todayIdx] ?? todayISO,
    partial,
  };

}

/* -------------------------------- land cover -------------------------------- */

export type LandCover = {
  category:
    | "Agricultural land"
    | "Plantation / orchard"
    | "Built-up"
    | "Road / paved surface"
    | "Forest / scrub"
    | "Water body"
    | "Open / barren land";
  confidence: "high" | "medium" | "low";
  detail: string;
  tags: string[];
  agricultural: boolean;
};

const OVERPASS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function overpassQuery(q: string) {
  for (const url of OVERPASS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "CoastalAgriMap/1.0",
        },
        body: new URLSearchParams({ data: q }),
        signal: timeoutSignal(8000),
      });
      if (!res.ok) continue;
      const j = (await res.json()) as { elements?: Array<{ tags?: Record<string, string> }> };
      return (j.elements ?? []).map((e) => e.tags ?? {});
    } catch (err) {
      console.error("Overpass request failed", err);
    }
  }
  return [] as Array<Record<string, string>>;
}

type Tagged = Record<string, string>;

export type LandTags = {
  /** Roads/paths whose centreline is right under the tap. */
  road: Tagged[];
  /** Buildings, water and vegetation essentially under the tap. */
  near: Tagged[];
  /** Wider land-use context; used for wording only, never to decide the category. */
  area: Tagged[];
  /** Areas that actually contain the tapped point (ponds, tanks, lakes, forest blocks). */
  enclosing?: Tagged[];
};


/** Roads only, very tight radius so a nearby lane never hijacks a field. */
async function overpassRoads(lat: number, lng: number) {
  return overpassQuery(`[out:json][timeout:8];
(
  way(around:14,${lat},${lng})["highway"];
);
out tags 20;`);
}

/** Features almost exactly under the tapped pixel: buildings, water, trees. */
async function overpassNear(lat: number, lng: number) {
  return overpassQuery(`[out:json][timeout:8];
(
  way(around:20,${lat},${lng})["building"];
  node(around:20,${lat},${lng})["building"];
  way(around:20,${lat},${lng})["waterway"];
  way(around:120,${lat},${lng})["waterway"="river"];
  way(around:120,${lat},${lng})["waterway"="riverbank"];
  way(around:20,${lat},${lng})["natural"];
  node(around:20,${lat},${lng})["natural"];
  way(around:20,${lat},${lng})["water"];
  relation(around:20,${lat},${lng})["natural"="water"];
  way(around:25,${lat},${lng})["landuse"];
);
out tags 40;`);
}

/** Areas that actually contain the point — catches ponds and tanks mapped as polygons. */
async function overpassEnclosing(lat: number, lng: number) {
  return overpassQuery(`[out:json][timeout:8];
is_in(${lat},${lng})->.a;
way(pivot.a);
out tags 20;
relation(pivot.a);
out tags 20;`);
}

/** Wider surrounding land-use context (never enough on its own to call water). */
async function overpassArea(lat: number, lng: number) {
  return overpassQuery(`[out:json][timeout:8];
(
  way(around:150,${lat},${lng})["landuse"];
  way(around:150,${lat},${lng})["natural"];
  relation(around:150,${lat},${lng})["landuse"];
  relation(around:150,${lat},${lng})["natural"];
);
out tags 40;`);
}

export async function fetchLandTags(lat: number, lng: number): Promise<LandTags> {
  const [road, near, area, enclosing] = await Promise.all([
    overpassRoads(lat, lng).catch(() => [] as Tagged[]),
    overpassNear(lat, lng).catch(() => [] as Tagged[]),
    overpassArea(lat, lng).catch(() => [] as Tagged[]),
    overpassEnclosing(lat, lng).catch(() => [] as Tagged[]),
  ]);
  return { road, near, area, enclosing };
}


const WATER_NATURAL = ["water", "wetland", "bay", "strait", "spring"];
const ROAD_LABEL: Record<string, string> = {
  motorway: "highway",
  trunk: "highway",
  primary: "main road",
  secondary: "main road",
  tertiary: "road",
  residential: "street",
  unclassified: "village road",
  service: "service road",
  track: "farm track",
  path: "footpath",
  footway: "footpath",
};

function collectTags(list: Tagged[]) {
  const out: string[] = [];
  for (const t of list) {
    for (const [k, v] of Object.entries(t)) {
      if (["landuse", "natural", "building", "waterway", "water", "highway", "leisure", "crop"].includes(k)) {
        out.push(`${k}=${v}`);
      }
    }
  }
  return out;
}

export function classifyLand(
  osmTags: LandTags | Tagged[],
  place: PlaceInfo,
  soil: SoilProfile,
): LandCover {
  const t: LandTags = Array.isArray(osmTags)
    ? { road: [], near: osmTags, area: [] }
    : osmTags;

  const tags = [...new Set([...collectTags(t.road), ...collectTags(t.near)])];

  let built = false;
  let water = false;
  let waterKind = "water";
  let forest = false;
  let plantation = false;
  let trees = false;
  let farm = false;
  let beach = false;

  for (const tag of t.near) {
    const natural = tag["natural"] ?? "";
    const landuse = tag["landuse"] ?? "";
    if (tag["building"]) built = true;
    if (["residential", "industrial", "commercial", "retail", "construction"].includes(landuse))
      built = true;
    if (WATER_NATURAL.includes(natural) || tag["water"]) {
      water = true;
      waterKind = natural === "wetland" ? "wetland" : "water body";
    }
    // Only real flowing/standing water counts — a coastline or beach is land you can stand on.
    if (["river", "stream", "canal", "drain", "ditch", "riverbank"].includes(tag["waterway"] ?? "")) {
      water = true;
      waterKind = "stream or canal";
    }
    if (["reservoir", "basin", "salt_pond", "aquaculture"].includes(landuse)) {
      water = true;
      waterKind = "pond or tank";
    }
    if (["beach", "sand", "shoal", "coastline"].includes(natural)) beach = true;
    if (["wood", "scrub", "heath"].includes(natural) || landuse === "forest") forest = true;
    if (["tree", "tree_row"].includes(natural)) trees = true;
    if (["orchard", "plantation", "vineyard"].includes(landuse)) plantation = true;
    if (
      [
        "farmland",
        "farmyard",
        "paddy",
        "agriculture",
        "greenhouse_horticulture",
        "allotments",
        "meadow",
      ].includes(landuse)
    )
      farm = true;
  }

  // Areas that enclose the point: only trusted for water, so a big residential
  // or forest boundary can never override what is mapped at the exact spot.
  for (const tag of t.enclosing ?? []) {
    const natural = tag["natural"] ?? "";
    const landuse = tag["landuse"] ?? "";
    if (WATER_NATURAL.includes(natural) || tag["water"]) {
      water = true;
      const kind = tag["water"] ?? "";
      waterKind =
        natural === "wetland"
          ? "wetland"
          : ["pond", "reservoir", "basin", "lake"].includes(kind)
            ? kind === "lake"
              ? "lake"
              : "pond or tank"
            : "water body";
    }
    if (["reservoir", "basin", "salt_pond", "aquaculture"].includes(landuse)) {
      water = true;
      waterKind = "pond or tank";
    }
  }


  const roadTag = t.road.find((r) => r["highway"] && r["highway"] !== "proposed");
  const roadName = roadTag?.["name"] ?? null;
  const roadType = roadTag?.["highway"] ?? "";
  const roadLabel = ROAD_LABEL[roadType] ?? "road";

  const closeBuiltPlace = place.nearby.find(
    (p) =>
      p.distanceM < 60 &&
      p.types.some((ty) =>
        [
          "lodging", "restaurant", "store", "school", "hospital", "bank", "place_of_worship",
          "government_office", "shopping_mall", "gas_station", "premise", "hotel", "cafe",
        ].some((k) => ty.includes(k)),
      ),
  );

  const done = (c: Omit<LandCover, "tags">): LandCover => ({ ...c, tags });

  if (built) {
    return done({
      category: "Built-up",
      confidence: "high",
      detail: "A building footprint is mapped right here, so this is not open land.",
      agricultural: false,
    });
  }
  if (roadTag) {
    return done({
      category: "Road / paved surface",
      confidence: "high",
      detail: roadName
        ? `This point sits on ${roadName} (${roadLabel}) — pick a spot beside it to check the land.`
        : `This point sits on a mapped ${roadLabel} — pick a spot beside it to check the land.`,
      agricultural: false,
    });
  }
  if (water) {
    return done({
      category: "Water body",
      confidence: "high",
      detail: `Mapped ${waterKind} at this point — not cultivable land.`,
      agricultural: false,
    });
  }
  if (plantation || trees) {
    return done({
      category: "Plantation / orchard",
      confidence: plantation ? "high" : "medium",
      detail: plantation
        ? "Mapped as orchard/plantation — typically coconut, arecanut or cashew here."
        : "Trees are mapped at this spot — it reads as a garden or plantation plot.",
      agricultural: true,
    });
  }
  if (farm) {
    return done({
      category: "Agricultural land",
      confidence: "high",
      detail: "Mapped as farmland/paddy land.",
      agricultural: true,
    });
  }
  if (forest) {
    return done({
      category: "Forest / scrub",
      confidence: "medium",
      detail: "Wooded or scrub cover; cultivation would need clearing and is often restricted.",
      agricultural: false,
    });
  }
  if (beach) {
    return done({
      category: "Open / barren land",
      confidence: "medium",
      detail: "Sandy shore or beach — salty and loose, so normal field crops will not do well.",
      agricultural: false,
    });
  }
  if (closeBuiltPlace) {
    return done({
      category: "Built-up",
      confidence: "medium",
      detail: `Structure detected nearby: ${closeBuiltPlace.name} (${closeBuiltPlace.distanceM} m).`,
      agricultural: false,
    });
  }

  const barren = (soil.cfvo ?? 0) > 40 || (soil.soc ?? 99) < 3;
  return done({
    category: barren ? "Open / barren land" : "Agricultural land",
    confidence: "low",
    detail: barren
      ? "Nothing built or mapped here; stony, low-carbon soil suggests open or waste land."
      : "Nothing built, paved or watery is mapped here and the soil is cultivable, so this reads as open agricultural land.",
    agricultural: !barren,
  });
}
