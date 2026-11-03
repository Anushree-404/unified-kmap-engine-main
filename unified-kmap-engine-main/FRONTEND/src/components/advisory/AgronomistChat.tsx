import { Bot, MapPin, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

type Msg = { role: "bot" | "user"; text: string };

type Rule = { keys: string[]; en: string; kn: string };

const RULES: Rule[] = [
  {
    keys: ["hello", "hi", "hey", "namaskara", "namaste", "greetings", "ನಮಸ್ಕಾರ", "ಹಲೋ"],
    en: "Namaskara! How can I assist with your farm today? You can ask me about suitable crops for your soil, disease control, fertilizer dosage, irrigation, current APMC market rates, or government loan schemes.",
    kn: "ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ? ಸೂಕ್ತ ಬೆಳೆಗಳು, ರೋಗ ನಿಯಂತ್ರಣ, ಗೊಬ್ಬರದ ಪ್ರಮಾಣ, ನೀರಾವರಿ, ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಸಾಲ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಬಹುದು.",
  },
  {
    keys: ["latitude", "longitude", "my location", "location is", "ಅಕ್ಷಾಂಶ", "ರೇಖಾಂಶ", "ಸ್ಥಳ"],
    en: "📍 Location received! For your region's agro-climatic zone: We recommend high-value crops like Ragi, Maize, and Pulses during Kharif. Ensure split application of NPK fertilizers (50:25:25 kg/ha) and set up drip irrigation with organic mulching to conserve topsoil moisture.",
    kn: "📍 ನಿಮ್ಮ ಸ್ಥಳ ಸ್ವೀಕರಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನ ವಲಯಕ್ಕೆ: ಮುಂಗಾರಿನಲ್ಲಿ ರಾಗಿ, ಮೆಕ್ಕೆಜೋಳ ಮತ್ತು ತೊಗರಿ ಬೆಳೆಗಳು ಅತ್ಯಂತ ಸೂಕ್ತ. NPK ಗೊಬ್ಬರವನ್ನು 3 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ ಮತ್ತು ತೇವಾಂಶ ಉಳಿಸಲು ಹನಿ ನೀರಾವರಿ ಹಾಗೂ ಮಲ್ಚಿಂಗ್ ಬಳಸಿ.",
  },
  {
    keys: ["tomato", "tomatoes", "ಟೊಮೆಟೊ", "ತೊಮೆಟೊ"],
    en: "For Tomato cultivation: Ensure soil pH is between 6.0–7.0. Staking is essential to prevent fruit rot. Watch for Early Blight (dark concentric spots) and treat with Mancozeb @ 2g/L. Recommended spacing is 60cm x 45cm with drip irrigation.",
    kn: "ಟೊಮೆಟೊ ಬೆಳೆಗೆ: ಮಣ್ಣಿನ pH 6.0–7.0 ನಡುವೆ ಇರಬೇಕು. ಕಾಯಿ ಕೊಳೆಯುವುದನ್ನು ತಡೆಯಲು ಗೂಟ ಕಟ್ಟುವುದು ಕಡ್ಡಾಯ. ಎಲೆ ಚುಕ್ಕೆ ರೋಗಕ್ಕೆ ಮ್ಯಾಂಕೋಜೆಬ್ 2 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ 60 ಸೆಂ.ಮೀ ಅಂತರವಿರಲಿ.",
  },
  {
    keys: ["rice", "paddy", "ಭತ್ತ", "ಅಕ್ಕಿ"],
    en: "For Rice/Paddy: Keep 2-3 cm standing water during tillering stage. Apply Zinc Sulphate @ 10 kg/acre if leaves show yellowing (Zinc deficiency). For Stem Borer control, release Trichogramma egg parasitoids @ 2 cards/acre.",
    kn: "ಭತ್ತದ ಬೆಳೆಗೆ: ಪೈರು ಒಡೆಯುವ ಹಂತದಲ್ಲಿ 2-3 ಸೆಂ.ಮೀ ನೀರು ನಿಲ್ಲಿಸಿ. ಹಳದಿ ರೋಗ ಕಂಡರೆ ಎಕರೆಗೆ 10 ಕೆಜಿ ಝಿಂಕ್ ಸಲ್ಫೇಟ್ ಹಾಕಿ. ಕಾಂಡ ಕೊರಕ ಹುಳು ನಿಯಂತ್ರಣಕ್ಕೆ ಎಕರೆಗೆ 2 ಟ್ರೈಕೋ ಗ್ರಾಮಾ ಕಾರ್ಡ್ ಬಳಸಿ.",
  },
  {
    keys: ["ragi", "millet", "millets", "ರಾಗಿ", "ಕಿರುಧಾನ್ಯ"],
    en: "For Ragi & Millets: Excellent climate-resilient crops for Karnataka drylands! Varieties GPU-28 or Indaf-7 give high yield. Sow with 30cm row spacing; apply 2 t/acre FYM plus 40:20:20 NPK kg/ha.",
    kn: "ರಾಗಿ ಮತ್ತು ಕಿರುಧಾನ್ಯಗಳಿಗೆ: ಒಣಭೂಮಿಗೆ ಸೂಕ್ತ ಬೆಳೆ! GPU-28 ಅಥವಾ ಇಂದಾಫ್-7 ತಳಿಗಳು ಉತ್ತಮ ಇಳುವರಿ ನೀಡುತ್ತವೆ. 30 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಬಿತ್ತನೆ ಮಾಡಿ; ಎಕರೆಗೆ 2 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಹಾಕಿ.",
  },
  {
    keys: ["blight", "fungus", "fungal", "rot", " spot", " spots", "ಅಂಗಮಾರಿ", "ಶಿಲೀಂಧ್ರ", "ಚುಕ್ಕೆ"],
    en: "For fungal leaf blight & spots: Remove and burn lower affected leaves. Avoid overhead sprinkling in the evening. Spray Mancozeb 75% WP @ 2 g/L twice (10 days apart) or use Neem oil 3% (30ml/L) as an organic alternative.",
    kn: "ಶಿಲೀಂಧ್ರ ಅಂಗಮಾರಿ ಮತ್ತು ಎಲೆ ಚುಕ್ಕೆ ರೋಗಕ್ಕೆ: ಬಾಧಿತ ಕೆಳಗಿನ ಎಲೆಗಳನ್ನು ಸುಡಿ. ಸಂಜೆ ಮೇಲಿನಿಂದ ನೀರು ಹಾಕಬೇಡಿ. ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP @ 2 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಿ (10 ದಿನಗಳ ಅಂತರ). ಸಾವಯವಕ್ಕೆ: 3% ಬೇವಿನ ಎಣ್ಣೆ ಬಳಸಿ.",
  },
  {
    keys: ["pest", "insect", "worm", "caterpillar", "borer", "ಕೀಟ", "ಹುಳು", "ಕೊರಕ"],
    en: "For pest control: Install yellow sticky traps (10/acre) for sucking pests like whiteflies and thrips. For caterpillar & borer attack, install 8 pheromone traps per acre and spray Bacillus thuringiensis (Bt) @ 2g/L in the evening.",
    kn: "ಕೀಟ ನಿಯಂತ್ರಣಕ್ಕೆ: ರಸ ಹೀರುವ ಕೀಟಗಳಿಗೆ ಎಕರೆಗೆ 10 ಹಳದಿ ಅಂಟುವ ಟ್ರ್ಯಾಪ್ ಹಾಕಿ. ಕೊರಕ ಹುಳುಗಳಿಗೆ ಎಕರೆಗೆ 8 ಫೆರೋಮೋನ್ ಟ್ರ್ಯಾಪ್ ಮತ್ತು ಸಂಜೆ ಬಿ.ಟಿ. 2 ಗ್ರಾಂ/ಲೀ ಸಿಂಪಡಿಸಿ.",
  },
  {
    keys: ["soil", "npk", "fertiliser", "fertilizer", "ph", "nitrogen", "urea", "compost", "ಮಣ್ಣು", "ಗೊಬ್ಬರ", "ಯೂರಿಯಾ"],
    en: "Soil fertility tip: Test soil before sowing. For low organic carbon, apply 5 tonnes/acre farmyard manure. Split Urea into 3 equal doses (sowing, 30 days, 60 days). If soil pH > 8.0, apply Gypsum; if pH < 5.5, apply agricultural Lime.",
    kn: "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ: ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಮಣ್ಣು ಪರೀಕ್ಷಿಸಿ. ಎಕರೆಗೆ 5 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಹಾಕಿ. ಯೂರಿಯಾವನ್ನು 3 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ (ಬಿತ್ತನೆ, 30 ದಿನ, 60 ದಿನ). pH 8ಕ್ಕಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಜಿಪ್ಸಂ, 5.5ಕ್ಕಿಂತ ಕಡಿಮೆ ಇದ್ದರೆ ಸುಣ್ಣ ಹಾಕಿ.",
  },
  {
    keys: ["water", "irrigation", "drip", "drought", "ನೀರು", "ಹನಿ", "ಬರ"],
    en: "Water management: Drip irrigation combined with organic mulching saves up to 40% water. Prioritize irrigation at critical stages: flowering, pod formation, and grain filling.",
    kn: "ನೀರಾವರಿ ನಿರ್ವಹಣೆ: ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಮಲ್ಚಿಂಗ್‌ನಿಂದ 40% ವರೆಗೆ ನೀರು ಉಳಿಯುತ್ತದೆ. ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಳು ತುಂಬುವ ಹಂತಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡಿ.",
  },
  {
    keys: ["crop", "sow", "variety", "which", "ಬೆಳೆ", "ಬಿತ್ತನೆ"],
    en: "Crop selection guide: Red loam with 700–900 mm rain suits Ragi, Maize, Groundnut; Black cotton soil suits Cotton, Soybean, Bengal Gram; Coastal laterite suits Paddy, Banana, Arecanut.",
    kn: "ಬೆಳೆ ಆಯ್ಕೆ ಮಾರ್ಗದರ್ಶಿ: ಕೆಂಪು ಮಣ್ಣಿಗೆ ರಾಗಿ, ಮೆಕ್ಕೆಜೋಳ, ಕಡಲೆಕಾಯಿ; ಕಪ್ಪು ಮಣ್ಣಿಗೆ ಹತ್ತಿ, ಸೋಯಾಬೀನ್, ಕಡಲೆ; ಕರಾವಳಿ ಮಣ್ಣಿಗೆ ಭತ್ತ, ಬಾಳೆ, ಅಡಿಕೆ ಸೂಕ್ತ.",
  },
  {
    keys: ["price", "market", "msp", "sell", "apmc", "ಬೆಲೆ", "ಮಾರುಕಟ್ಟೆ", "ಎಪಿಎಂಸಿ"],
    en: "Market pricing tip: Check daily APMC prices on Karnataka Krishi Marata Vahini and e-NAM portal before transporting produce. Cleaning, grading, and moisture reduction typically fetch 8-12% higher prices.",
    kn: "ಮಾರುಕಟ್ಟೆ ಸುಳಿವು: ಕೃಷಿ ಮಾರಾಟ ವಾಹಿನಿ ಮತ್ತು e-NAM ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ದಿನದ ಎಪಿಎಂಸಿ ದರ ನೋಡಿ. ಗ್ರೇಡಿಂಗ್ ಮತ್ತು ಒಣಗಿಸುವಿಕೆಯಿಂದ 8–12% ಹೆಚ್ಚು ಬೆಲೆ ಪಡೆಯಬಹುದು.",
  },
  {
    keys: ["loan", "subsidy", "scheme", "kisan", "pm-kisan", "ಸಾಲ", "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ"],
    en: "Schemes & Loans: Kisan Credit Card (KCC) offers crop loans up to ₹3 Lakhs at an effective 4% interest rate with prompt repayment. PACS in Karnataka provides interest-free short term loans. Bring RTC, Aadhaar, and Bank passbook to your local cooperative bank.",
    kn: "ಸಾಲ ಸೌಲಭ್ಯ: ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್ (KCC) ಮೂಲಕ 4% ಬಡ್ಡಿದರದಲ್ಲಿ ₹3 ಲಕ್ಷದವರೆಗೆ ಸಾಲ ಲಭ್ಯ. PACS ಮೂಲಕ ಶೂನ್ಯ ಬಡ್ಡಿ ಸಾಲವೂ ಸಿಗುತ್ತದೆ. ಆರ್‌ಟಿಸಿ, ಆಧಾರ್, ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್ ಕೊಂಡೊಯ್ಯಿರಿ.",
  },
  {
    keys: ["weather", "rain", "monsoon", "forecast", "ಹವಾಮಾನ", "ಮಳೆ"],
    en: "Weather advisory: If heavy rain is forecasted within 48 hours, postpone fertilizer application and clear field drainage furrows to avoid root rot. During extended dry spells, apply straw mulch immediately.",
    kn: "ಹವಾಮಾನ ಸಲಹೆ: 48 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆ ಮುನ್ಸೂಚನೆ ಇದ್ದರೆ ಗೊಬ್ಬರ ಹಾಕಬೇಡಿ ಮತ್ತು ನೀರು ಹರಿದುಹೋಗಲು ಕಾಲುವೆ ಮಾಡಿ. ಒಣ ಹವೆಯಲ್ಲಿ ತಕ್ಷಣ ಮಲ್ಚಿಂಗ್ ಮಾಡಿ.",
  },
];

const DYNAMIC_FALLBACKS = {
  en: [
    "I can provide personalized agronomy guidance for your farm! Tell me your crop (e.g. Tomato, Rice, Ragi), soil type, or any symptoms/pests you noticed.",
    "Great question! For precise advice, let me know your district, crop variety, and whether your field is rainfed or irrigated.",
    "Our AI agronomy model covers pest management, fertilizer calculation, water conservation, APMC market rates, and Kisan loans. What specific detail do you need?",
  ],
  kn: [
    "ನಿಮ್ಮ ಹೊಲಕ್ಕೆ ಸಂಬಂಧಿಸಿದಂತೆ ಸಂಪೂರ್ಣ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ! ನಿಮ್ಮ ಬೆಳೆ (ಉದಾ: ಟೊಮೆಟೊ, ಭತ್ತ, ರಾಗಿ), ಮಣ್ಣಿನ ಮಾದರಿ ಅಥವಾ ರೋಗದ ಲಕ್ಷಣ ತಿಳಿಸಿ.",
    "ಉತ್ತಮ ಪ್ರಶ್ನೆ! ನಿಖರ ಸಲಹೆಗೆ ನಿಮ್ಮ ಜಿಲ್ಲೆ, ಬೆಳೆ ತಳಿ ಮತ್ತು ನೀರಾವರಿ ಸೌಲಭ್ಯದ ವಿವರ ತಿಳಿಸಿ.",
    "ನಮ್ಮ ಎಐ ಸಿಸ್ಟಮ್ ಕೀಟ ನಿಯಂತ್ರಣ, ಗೊಬ್ಬರದ ಲೆಕ್ಕಾಚಾರ, ಮಾರುಕಟ್ಟೆ ದರ ಮತ್ತು ಕಿಸಾನ್ ಸಾಲಗಳ ಮಾಹಿತಿಯನ್ನು ಹೊಂದಿದೆ. ನಿಮಗೆ ಯಾವ ಮಾಹಿತಿ ಬೇಕು?",
  ],
};

function reply(q: string, kn: boolean, historyCount: number) {
  const lower = q.toLowerCase();
  const hit = RULES.find((r) => r.keys.some((k) => lower.includes(k.toLowerCase())));
  if (hit) {
    return kn ? hit.kn : hit.en;
  }
  const fallbackList = kn ? DYNAMIC_FALLBACKS.kn : DYNAMIC_FALLBACKS.en;
  return fallbackList[historyCount % fallbackList.length]!;
}

export function AgronomistChat({ trigger }: { trigger: ReactNode }) {
  const { lang, t } = useI18n();
  const kn = lang === "kn";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          role: "bot",
          text: kn
            ? "ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರೋವಾ ಎಐ ಕೃಷಿ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಹೊಲದ ಬಗ್ಗೆ ಕೇಳಿ."
            : "Namaskara! I'm the AGROVA AI agronomist. Ask me about your field — crop choice, soil, pests, water, prices or loans.",
        },
      ]);
    }
  }, [open, msgs.length, kn]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    window.setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", text: reply(q, kn, m.length) }]);
    }, 450);
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      send(kn ? "ನನ್ನ ಸಾಧನದಲ್ಲಿ ಸ್ಥಳ ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ." : "Location services are unavailable on my device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        send(
          kn
            ? `ನನ್ನ ಸ್ಥಳ: ಅಕ್ಷಾಂಶ ${position.coords.latitude.toFixed(4)}, ರೇಖಾಂಶ ${position.coords.longitude.toFixed(4)}. ಈ ಸ್ಥಳಕ್ಕೆ ಸೂಕ್ತ ಕೃಷಿ ಸಲಹೆ ನೀಡಿ.`
            : `My location is latitude ${position.coords.latitude.toFixed(4)}, longitude ${position.coords.longitude.toFixed(4)}. Give advice suitable for this location.`,
        );
      },
      () => send(kn ? "ನಾನು ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ." : "I could not share my location."),
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  const chips = kn
    ? ["ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?", "ಎಲೆಯಲ್ಲಿ ಚುಕ್ಕೆ ರೋಗ", "ಸಾಲ ಸೌಲಭ್ಯ", "ನೀರು ಉಳಿತಾಯ"]
    : ["Which crop suits my field?", "Leaf spot disease", "Loan options", "Save irrigation water"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="size-5 text-primary" /> {t("Talk to an agronomist")}
          </DialogTitle>
          <DialogDescription>
            {kn ? "ಎಐ ಕೃಷಿ ಚಾಟ್‌ಬಾಟ್" : "AI agronomy chatbot"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && (
                <span className="mt-1 rounded-full bg-accent p-1.5 text-accent-foreground">
                  <Bot className="size-3.5" />
                </span>
              )}
              <p
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {m.text}
              </p>
              {m.role === "user" && (
                <span className="mt-1 rounded-full bg-secondary p-1.5">
                  <User className="size-3.5" />
                </span>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={shareLocation}>
            <MapPin /> {kn ? "ನನ್ನ ಸ್ಥಳ ಹಂಚಿಕೊಳ್ಳಿ" : "Share my location"}
          </Button>
          {chips.map((c) => (
            <Button key={c} size="sm" variant="outline" onClick={() => send(c)}>
              <Sparkles /> {c}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={kn ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಬರೆಯಿರಿ…" : "Type your question…"}
            aria-label={t("Talk to an agronomist")}
          />
          <Button variant="hero" onClick={() => send(input)} disabled={!input.trim()}>
            <Send />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
