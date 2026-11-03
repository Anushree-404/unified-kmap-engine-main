import { Crosshair, Loader2, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { KARNATAKA_MAP } from "@/data/karnataka-map";
import { PROFILE_BY_NAME, type DistrictProfile } from "@/data/karnataka-profiles";
import { useI18n } from "@/lib/i18n";
import type { ReactNode } from "react";

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
  let best: { name: string; dist: number } | null = null;
  for (const d of M.districts) {
    const dLon = M.minLon + (d.cx / M.width) * (M.maxLon - M.minLon);
    const dLat = M.maxLat - (d.cy / M.height) * (M.maxLat - M.minLat);
    const dist = Math.hypot(dLat - lat, dLon - lon);
    if (!best || dist < best.dist) best = { name: d.name, dist };
  }
  return best;
}

type CropRow = { crop: string; score: number; window: string; water: string };

function analyse(p: DistrictProfile): CropRow[] {
  const rain = p.rainfall;
  return p.crops.slice(0, 5).map((crop, i) => ({
    crop,
    score: Math.max(58, 96 - i * 7 - (p.ph > 8 || p.ph < 5.5 ? 4 : 0)),
    window: p.monsoon,
    water: rain > 1400 ? "Rain-fed viable" : rain > 800 ? "1–2 protective irrigations" : "Irrigation essential",
  }));
}

export function FieldLocationAnalysis({ trigger }: { trigger: ReactNode }) {
  const { lang, t } = useI18n();
  const kn = lang === "kn";
  const [open, setOpen] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [status, setStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [district, setDistrict] = useState<DistrictProfile | null>(null);

  function detect(next: boolean) {
    setUseLocation(next);
    if (!next) {
      setStatus("idle");
      setDistrict(null);
      setCoords(null);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError(kn ? "ಈ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ." : "Location services are not available on this device.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        const near = nearestDistrict(lat, lon);
        const profile = near ? PROFILE_BY_NAME[near.name] : undefined;
        if (!profile) {
          setStatus("error");
          setError(
            kn
              ? "ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಹೊಂದುವ ಜಿಲ್ಲಾ ಪ್ರೊಫೈಲ್ ಸಿಗಲಿಲ್ಲ."
              : "We could not match your location to a Karnataka district profile.",
          );
          return;
        }
        setDistrict(profile);
        setStatus("done");
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? kn
              ? "ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ."
              : "Location permission was denied. Allow it in your browser settings and try again."
            : kn
              ? "ಸ್ಥಳ ಪತ್ತೆ ವಿಫಲವಾಯಿತು."
              : "Could not determine your location.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  const rows = district ? analyse(district) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crosshair className="size-5 text-primary" /> {t("Try it on your field")}
          </DialogTitle>
          <DialogDescription>
            {kn
              ? "ಸ್ಥಳ ಸೇವೆ ಆನ್ ಮಾಡಿದರೆ ನಿಮ್ಮ ಹೊಲದ ಸ್ಥಳ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆಯಾಗಿ ವಿಶ್ಲೇಷಣಾ ವರದಿ ಸಿದ್ಧವಾಗುತ್ತದೆ."
              : "Turn on location and we detect your field automatically, then generate the analysis report for that land."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
          <div className="flex items-center gap-3">
            <MapPin className="size-4 text-primary" />
            <Label htmlFor="use-location" className="cursor-pointer text-sm font-medium">
              {kn ? "ನನ್ನ ಸ್ಥಳ ಬಳಸಿ" : "Use my current location"}
            </Label>
          </div>
          <Switch id="use-location" checked={useLocation} onCheckedChange={detect} />
        </div>

        {status === "locating" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {kn ? "ಸ್ಥಳ ಪತ್ತೆ ಮಾಡುತ್ತಿದೆ…" : "Detecting your location…"}
          </p>
        )}
        {status === "error" && <p className="text-sm text-destructive">{error}</p>}

        {status === "done" && district && (
          <div className="space-y-4">
            <Card className="border-border/60">
              <CardContent className="space-y-2 py-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{district.name}</Badge>
                  {coords && (
                    <span className="text-xs text-muted-foreground">
                      {coords.lat.toFixed(4)}°N, {coords.lon.toFixed(4)}°E
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    [kn ? "ಮಣ್ಣು" : "Soil", district.soil],
                    [kn ? "ಮಳೆ" : "Rainfall", `${district.rainfall} mm`],
                    ["pH", String(district.ph)],
                    ["NPK", district.npk],
                    [kn ? "ಅಂತರ್ಜಲ" : "Groundwater", district.groundwater],
                    [kn ? "ತಾಪಮಾನ" : "Temperature", district.temperature],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4 text-primary" />
                {kn ? "ಶಿಫಾರಸು ಮಾಡಿದ ಬೆಳೆಗಳು" : "Recommended crops for this land"}
              </p>
              <ul className="mt-3 space-y-3">
                {rows.map((r) => (
                  <li key={r.crop} className="rounded-xl border border-border/60 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{r.crop}</span>
                      <span className="text-muted-foreground">{r.score}%</span>
                    </div>
                    <Progress value={r.score} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {r.window} · {r.water}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">{district.note}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
