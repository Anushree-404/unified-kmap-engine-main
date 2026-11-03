/**
 * Browser-only check of what Google Maps draws exactly at a point.
 * Requests a tiny colour-coded static map (water = blue, roads = red,
 * buildings = green, everything else white) and reads the centre pixels.
 * This is far more reliable than open map records, which often fail or miss wide rivers.
 */
export type Surface = "water" | "road" | "built";

const KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;

const STYLES = [
  "feature:all|element:labels|visibility:off",
  "feature:all|element:geometry|color:0xffffff",
  "feature:water|element:geometry|color:0x0000ff",
  "feature:road|element:geometry|color:0xff0000",
  "feature:landscape.man_made|element:geometry|color:0x00ff00",
];

function classifyPixel(r: number, g: number, b: number): Surface | null {
  if (b > r + 90 && b > g + 90) return "water";
  if (r > g + 90 && r > b + 90) return "road";
  if (g > r + 90 && g > b + 90) return "built";
  return null;
}

export function checkSurface(lat: number, lng: number): Promise<Surface | null> {
  if (!KEY || typeof window === "undefined") return Promise.resolve(null);
  const size = 9;
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: "19",
    size: `${size}x${size}`,
    format: "png",
    key: KEY,
  });
  const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}&${STYLES.map(
    (s) => `style=${encodeURIComponent(s)}`,
  ).join("&")}`;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = window.setTimeout(() => resolve(null), 6000);
    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const cx = Math.floor(canvas.width / 2);
        const cy = Math.floor(canvas.height / 2);
        const px = ctx.getImageData(cx - 1, cy - 1, 3, 3).data;
        const counts: Record<Surface, number> = { water: 0, road: 0, built: 0 };
        for (let i = 0; i < px.length; i += 4) {
          const s = classifyPixel(px[i]!, px[i + 1]!, px[i + 2]!);
          if (s) counts[s] += 1;
        }
        // Centre pixel wins; otherwise a clear majority of the 3x3 block.
        const centre = classifyPixel(px[16]!, px[17]!, px[18]!);
        if (centre) return resolve(centre);
        const best = (Object.entries(counts) as Array<[Surface, number]>).sort((a, b) => b[1] - a[1])[0];
        resolve(best && best[1] >= 5 ? best[0] : null);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}
