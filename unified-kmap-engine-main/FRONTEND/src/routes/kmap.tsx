import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Sprout } from "lucide-react";

import { ZoneMap } from "@/components/kmap/ZoneMap";
import { DetailPanel } from "@/components/kmap/DetailPanel";
import { analyzePoint, type PointAnalysis } from "@/lib/analysis.functions";
import { TALUK_NAMES } from "@/lib/geo";
import { checkSurface, type Surface } from "@/lib/surface-check";

const TITLE = "KMap — Coastal Karnataka Crop Advisor | AGROVA AI";
const DESC =
  "Tap any spot in Karwar, Ankola, Kumta, Honnavar or Bhatkal to see land type, soil chemistry, live weather, a 15-day machine-learnt forecast and the five best crops to plant now.";

export const Route = createFileRoute("/kmap")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KMapPage,
});

function KMapPage() {
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(null);
  const [focusTaluk, setFocusTaluk] = useState<string | null>(null);
  const [data, setData] = useState<PointAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [surface, setSurface] = useState<{ key: string; kind: Surface } | null>(null);
  const run = useServerFn(analyzePoint);

  const mutation = useMutation({
    mutationFn: (p: { lat: number; lng: number }) => run({ data: p }),
    onSuccess: (res) => {
      if (res.ok) {
        setData(res.data);
        setError(null);
        return;
      }
      setData(null);
      setError(
        res.reason === "OUTSIDE_ZONE"
          ? "That point is outside the five coastal taluks covered by this map."
          : res.reason === "WEATHER_UNAVAILABLE"
            ? "The live weather service didn't respond just now. Please try again in a moment."
            : "Could not read the land data for this point. Please try another spot.",
      );
    },
    onError: () => {
      setData(null);
      setError("Could not reach the server. Please check your connection and try again.");
    },
  });

  const pick = (lat: number, lng: number) => {
    setSelected({ lat, lng });
    setData(null);
    setError(null);
    setSurface(null);
    const key = `${lat},${lng}`;
    void checkSurface(lat, lng).then((s) => {
      if (s) setSurface({ key, kind: s });
    });
    mutation.mutate({ lat, lng });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background lg:h-[calc(100vh-4rem)]">
      <header className="z-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-primary" />
          <h1 className="font-display text-sm font-semibold tracking-tight text-foreground">
            KMap — Coastal Karnataka Crop Advisor
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TALUK_NAMES.map((t) => (
            <button
              key={t}
              onClick={() => setFocusTaluk(t)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                focusTaluk === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="h-[45vh] min-h-64 w-full lg:h-auto lg:flex-1">
          <ZoneMap onPick={pick} selected={selected} focusTaluk={focusTaluk} />
        </div>
        <aside className="min-h-0 flex-1 border-t border-border lg:w-[420px] lg:flex-none lg:border-l lg:border-t-0">
          <DetailPanel
            data={data}
            surface={
              surface && data && surface.key === `${data.point.lat},${data.point.lng}`
                ? surface.kind
                : null
            }
            loading={mutation.isPending}
            error={error}
            onClose={() => {
              setData(null);
              setError(null);
              setSelected(null);
            }}
          />
        </aside>
      </main>
    </div>
  );
}
