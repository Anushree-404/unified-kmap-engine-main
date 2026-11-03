import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, Loader2, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KARNATAKA_MAP } from "@/data/karnataka-map";
import { PROFILE_BY_NAME, type DistrictProfile } from "@/data/karnataka-profiles";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/field-analysis")({
  head: () => ({ meta: [{ title: "Field Analysis — AGROVA AI" }] }),
  component: FieldAnalysisPage,
});

const M = KARNATAKA_MAP as unknown as {
  width: number;
  height: number;
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
  districts: { name: string; cx: number; cy: number }[];
};

function nearestDistrict(lat: number, lon: number) {
  return M.districts.reduce<{ name: string; dist: number } | null>((best, d) => {
    const dLon = M.minLon + (d.cx / M.width) * (M.maxLon - M.minLon);
    const dLat = M.maxLat - (d.cy / M.height) * (M.maxLat - M.minLat);
    const dist = Math.hypot(dLat - lat, dLon - lon);
    return !best || dist < best.dist ? { name: d.name, dist } : best;
  }, null);
}

function FieldAnalysisPage() {
  const { lang } = useI18n();
  const kn = lang === "kn";
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [profile, setProfile] = useState<DistrictProfile | null>(null);

  function detect(next: boolean) {
    setEnabled(next);
    if (!next) {
      setStatus("idle");
      setProfile(null);
      setCoords(null);
      return;
    }
    if (!navigator.geolocation) {
      setStatus("error");
      setError(kn ? "ಈ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ." : "Location services are unavailable on this device.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const nearest = nearestDistrict(lat, lon);
        const nextProfile = nearest ? PROFILE_BY_NAME[nearest.name] : undefined;
        setCoords({ lat, lon });
        if (!nextProfile) {
          setStatus("error");
          setError(kn ? "ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಹೊಂದುವ ಪ್ರೊಫೈಲ್ ಸಿಗಲಿಲ್ಲ." : "No matching field profile was found.");
          return;
        }
        setProfile(nextProfile);
        setStatus("done");
      },
      (positionError) => {
        setStatus("error");
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? kn ? "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ." : "Location permission was denied."
            : kn ? "ಸ್ಥಳ ಪತ್ತೆ ವಿಫಲವಾಯಿತು." : "Could not determine your location.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <Badge variant="secondary"><Crosshair className="size-3" /> {kn ? "ಹೊಲ ವಿಶ್ಲೇಷಣೆ" : "Field analysis"}</Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">{kn ? "ನಿಮ್ಮ ಹೊಲದ ವರದಿ" : "Your field report"}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {kn ? "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ. ಹತ್ತಿರದ ಜಿಲ್ಲಾ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ಆಧರಿಸಿ ಮಣ್ಣು, ಹವಾಮಾನ ಮತ್ತು ಸೂಕ್ತ ಬೆಳೆಗಳ ವರದಿ ಸಿದ್ಧವಾಗುತ್ತದೆ." : "Share your location to generate a report using the nearest district agriculture profile, including soil, climate and suitable crops."}
      </p>
      <Card className="mt-8 border-border/60">
        <CardContent className="flex items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-3">
            <MapPin className="size-5 text-primary" />
            <Label htmlFor="field-location" className="font-medium">{kn ? "ನನ್ನ ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ" : "Use my current location"}</Label>
          </div>
          <Switch id="field-location" checked={enabled} onCheckedChange={detect} />
        </CardContent>
      </Card>
      {status === "loading" && <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {kn ? "ಸ್ಥಳ ಪತ್ತೆ ಮಾಡುತ್ತಿದೆ…" : "Detecting your location…"}</p>}
      {status === "error" && <p className="mt-5 text-sm text-destructive">{error}</p>}
      {status === "done" && profile && (
        <Card className="mt-6 border-border/60">
          <CardHeader>
            <CardTitle>{profile.name}</CardTitle>
            {coords && <p className="text-xs text-muted-foreground">{coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E</p>}
          </CardHeader>
          <CardContent className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                [kn ? "ಮಣ್ಣು" : "Soil", profile.soil],
                [kn ? "ಮಳೆ" : "Rainfall", `${profile.rainfall} mm`],
                [kn ? "ಗಾಳಿ" : "Wind pattern", profile.wind],
                [kn ? "ತಾಪಮಾನ" : "Temperature", profile.temperature],
                ["pH", String(profile.ph)],
                ["NPK", profile.npk],
                [kn ? "ಅಂತರ್ಜಲ" : "Groundwater", profile.groundwater],
                [kn ? "ಸಾವಯವ ಇಂಗಾಲ" : "Organic carbon", profile.organicCarbon],
              ].map(([key, value]) => <div key={key}><dt className="text-xs text-muted-foreground">{key}</dt><dd className="font-medium">{value}</dd></div>)}
            </dl>
            <div>
              <p className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-primary" /> {kn ? "ಈ ಸ್ಥಳಕ್ಕೆ ಸೂಕ್ತ ಬೆಳೆಗಳು" : "Suitable crops for this location"}</p>
              <ul className="mt-3 space-y-3">{profile.crops.slice(0, 5).map((crop, index) => <li key={crop} className="rounded-xl border border-border/60 p-3"><div className="flex justify-between text-sm"><span className="font-medium">{crop}</span><span>{Math.max(58, 96 - index * 7)}%</span></div><Progress value={Math.max(58, 96 - index * 7)} className="mt-2" /></li>)}</ul>
            </div>
            <p className="text-sm text-muted-foreground">{profile.note}</p>
          </CardContent>
        </Card>
      )}
      <Button asChild variant="outline" className="mt-8"><a href="/solutions">{kn ? "ಪರಿಹಾರಗಳಿಗೆ ಹಿಂತಿರುಗಿ" : "Back to solutions"}</a></Button>
    </div>
  );
}
