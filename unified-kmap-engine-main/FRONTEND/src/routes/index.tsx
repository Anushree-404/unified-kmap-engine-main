import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bug,
  CloudSun,
  LineChart,
  MessageSquareText,
  Satellite,
  Sprout,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import heroImage from "@/assets/hero-farm.jpg";
import leafScan from "@/assets/leaf-scan.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AGROVA AI — Data-Driven Farming & Crop Disease Detection" },
      {
        name: "description",
        content:
          "AGROVA AI unites crop recommendation, disease detection, yield forecasting, weather intelligence and satellite monitoring in one precision agriculture platform.",
      },
      { property: "og:title", content: "AGROVA AI — Precision Agriculture Intelligence" },
      {
        property: "og:description",
        content: "Growing Intelligence. Harvesting Tomorrow. AI for every farmer.",
      },
    ],
  }),
  component: Index,
});

const metrics = [
  { value: 20, suffix: "M+", label: "Acres monitored" },
  { value: 95, suffix: "%", label: "Disease detection accuracy" },
  { value: 30, suffix: "%", label: "Water savings" },
  { value: 18, suffix: "%", label: "Yield improvement" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);
  return value;
}

function Metric({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry?.isIntersecting && setActive(true), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const shown = useCountUp(value, active);
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-soft"
    >
      <div className="font-display text-4xl font-bold text-gradient-leaf">
        {shown}
        {suffix}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

const features = [
  {
    icon: Sprout,
    title: "AI Crop Recommendation",
    body: "Top crops ranked by yield, profitability, water need and risk from soil and climate signals.",
  },
  {
    icon: Bug,
    title: "Disease Detection",
    body: "Leaf image diagnosis with severity, confidence and organic or chemical treatment plans.",
  },
  {
    icon: LineChart,
    title: "Yield Forecasting",
    body: "Season-ahead production, revenue and profit estimates with confidence bands.",
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    body: "Rain, heat, frost and storm alerts fused from multiple meteorological sources.",
  },
  {
    icon: MessageSquareText,
    title: "AI Advisory Chatbot",
    body: "Plain-language answers on practices, schemes and inputs, in the farmer's language.",
  },
  {
    icon: Satellite,
    title: "Satellite Monitoring",
    body: "Field-level vegetation and stress maps refreshed through the growing season.",
  },
];

const trusted = [
  "Agricultural Universities",
  "State Departments",
  "Cooperatives",
  "Agritech Partners",
  "Research Labs",
];

function Index() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Aerial view of terraced farmland with AI field analytics overlay"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-hero)] opacity-85" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-32">
          <div className="max-w-2xl text-primary-foreground">
            <Badge className="border-white/30 bg-white/15 text-primary-foreground hover:bg-white/20">
              Growing Intelligence. Harvesting Tomorrow.
            </Badge>
            <h1 className="mt-6 text-4xl leading-tight sm:text-5xl md:text-6xl">
              Agrova AI: Data-Driven Farming Recommendation and Smart Crop Disease Detection System
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/90">
              AGROVA AI recommends the right crop, spots disease from a single leaf photo, and
              forecasts yield, water and revenue — in eight languages, on any device.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/demo">Try the AI demo</Link>
              </Button>
              <Button asChild variant="onHero" size="xl">
                <Link to="/contact">Book a demo</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-primary-foreground/85">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4" /> GDPR &amp; DPDP aligned
              </span>
              <span className="inline-flex items-center gap-2">
                <Languages className="size-4" /> 8 languages
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-label="Impact metrics">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Metric key={m.label} {...m} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl sm:text-4xl">One platform for the whole season</h2>
          <p className="mt-4 text-muted-foreground">
            From sowing decision to harvest report, every module shares the same field profile — so
            advice stays consistent and explainable.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="card-hover border-border/60">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <f.icon className="size-5" />
                </span>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <Badge variant="secondary">Disease detection</Badge>
            <h2 className="mt-4 text-3xl sm:text-4xl">A photo is enough</h2>
            <p className="mt-4 text-muted-foreground">
              Farmers photograph an affected leaf. The vision model returns the disease, a
              confidence score, severity, and treatment options — organic first, chemical when
              needed — with prevention steps for the next cycle.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Works on low-end phones and weak connectivity",
                "Explainable heatmap of the affected region",
                "Agronomist escalation for low-confidence cases",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8" variant="hero" size="lg">
              <Link to="/demo">Scan a sample leaf</Link>
            </Button>
          </div>
          <img
            src={leafScan}
            alt="Leaf with disease lesions highlighted by AI detection overlay"
            width={1024}
            height={1024}
            loading="lazy"
            className="w-full rounded-3xl shadow-lift"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted by
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {trusted.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="surface-hero rounded-3xl px-8 py-14 text-center shadow-lift">
          <h2 className="text-3xl sm:text-4xl">Start with a free field report</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
            Share one field's details and get a crop plan, water estimate and risk score — no card
            required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="onHero" size="xl">
              <Link to="/pricing">See pricing</Link>
            </Button>
            <Button asChild variant="hero" size="xl">
              <Link to="/demo">Get my free report</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
