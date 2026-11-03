import { useEffect, useRef, useState } from "react";
import { TALUKS, ZONE_BOUNDS, ZONE_CENTER } from "@/lib/geo";

const KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;
const CHANNEL = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
  | string
  | undefined;

let loader: Promise<void> | null = null;
function loadMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as { google?: { maps?: unknown } } & Record<string, unknown>;
  if (w.google?.maps) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    w["__initGoogleMaps"] = () => resolve();
    const s = document.createElement("script");
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=geometry` +
      `&loading=async&callback=__initGoogleMaps` +
      (CHANNEL ? `&channel=${CHANNEL}` : "");
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return loader;
}


type Props = {
  onPick: (lat: number, lng: number) => void;
  selected: { lat: number; lng: number } | null;
  focusTaluk: string | null;
};

export function ZoneMap({ onPick, selected, focusTaluk }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!KEY) {
      setError("Map key missing");
      return;
    }
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const g = (window as any).google;
        const map = new g.maps.Map(ref.current, {
          center: ZONE_CENTER,
          zoom: 10,
          minZoom: 9,
          maxZoom: 20,
          mapTypeId: "hybrid",
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          tilt: 0,
          restriction: {
            latLngBounds: {
              north: ZONE_BOUNDS.north + 0.15,
              south: ZONE_BOUNDS.south - 0.15,
              east: ZONE_BOUNDS.east + 0.2,
              west: ZONE_BOUNDS.west - 0.2,
            },
            strictBounds: true,
          },
        });
        mapRef.current = map;

        for (const f of TALUKS) {
          const paths = f.geometry.coordinates.flatMap((poly) =>
            poly.map((ring) => ring.map(([lng, lat]) => ({ lat, lng }))),
          );
          const shape = new g.maps.Polygon({
            paths,
            strokeColor: "#facc15",
            strokeOpacity: 0.95,
            strokeWeight: 2,
            fillColor: "#22c55e",
            fillOpacity: 0.06,
            map,
            clickable: true,
          });
          shape.addListener("click", (e: { latLng: { lat(): number; lng(): number } }) => {
            pickRef.current(e.latLng.lat(), e.latLng.lng());
          });
        }

        map.addListener("click", (e: { latLng: { lat(): number; lng(): number } }) => {
          pickRef.current(e.latLng.lat(), e.latLng.lng());
        });
      })
      .catch((e: Error) => setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    const map = mapRef.current;
    if (!g || !map || !selected) return;
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new g.maps.Marker({
      position: selected,
      map,
      animation: g.maps.Animation.DROP,
    });
    map.panTo(selected);
    if (map.getZoom() < 14) map.setZoom(15);
  }, [selected]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    const map = mapRef.current;
    if (!g || !map || !focusTaluk) return;
    const f = TALUKS.find((t) => t.properties.name === focusTaluk);
    if (!f) return;
    const b = new g.maps.LatLngBounds();
    for (const poly of f.geometry.coordinates)
      for (const [lng, lat] of poly[0]) b.extend({ lat, lng });
    map.fitBounds(b);
  }, [focusTaluk]);

  return (
    <div className="relative h-full w-full">
      <div ref={ref} className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted p-6 text-center text-sm text-muted-foreground">
          The map could not load ({error}).
        </div>
      )}
    </div>
  );
}
