import taluksRaw from "@/data/coastal-taluks.json";

export type TalukFeature = {
  type: "Feature";
  properties: { name: string };
  geometry: { type: "MultiPolygon"; coordinates: number[][][][] };
};

export const TALUKS = (taluksRaw as { features: TalukFeature[] }).features;

export const TALUK_NAMES = TALUKS.map((t) => t.properties.name);

/** District each taluk belongs to (all five are in Uttara Kannada). */
export const TALUK_DISTRICT: Record<string, string> = {
  Karwar: "Uttara Kannada",
  Ankola: "Uttara Kannada",
  Kumta: "Uttara Kannada",
  Honnavar: "Uttara Kannada",
  Bhatkal: "Uttara Kannada",
};

export type Bounds = { south: number; west: number; north: number; east: number };

function computeBounds(): Bounds {
  let south = 90,
    west = 180,
    north = -90,
    east = -180;
  for (const f of TALUKS) {
    for (const poly of f.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          if (lat < south) south = lat;
          if (lat > north) north = lat;
          if (lng < west) west = lng;
          if (lng > east) east = lng;
        }
      }
    }
  }
  return { south, west, north, east };
}

export const ZONE_BOUNDS = computeBounds();

export const ZONE_CENTER = {
  lat: (ZONE_BOUNDS.south + ZONE_BOUNDS.north) / 2,
  lng: (ZONE_BOUNDS.west + ZONE_BOUNDS.east) / 2,
};

function pointInRing(lng: number, lat: number, ring: number[][]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Returns the taluk name containing the point, or null when outside the zone. */
export function findTaluk(lat: number, lng: number): string | null {
  for (const f of TALUKS) {
    for (const poly of f.geometry.coordinates) {
      if (!poly.length) continue;
      if (pointInRing(lng, lat, poly[0])) {
        let inHole = false;
        for (let h = 1; h < poly.length; h++) {
          if (pointInRing(lng, lat, poly[h])) inHole = true;
        }
        if (!inHole) return f.properties.name;
      }
    }
  }
  return null;
}

export function talukCenter(name: string) {
  const f = TALUKS.find((t) => t.properties.name === name);
  if (!f) return ZONE_CENTER;
  let sx = 0,
    sy = 0,
    n = 0;
  for (const poly of f.geometry.coordinates) {
    for (const [lng, lat] of poly[0]) {
      sx += lng;
      sy += lat;
      n++;
    }
  }
  return { lat: sy / n, lng: sx / n };
}

export function formatLatLng(lat: number, lng: number) {
  return `${lat.toFixed(5)}\u00b0N, ${lng.toFixed(5)}\u00b0E`;
}
