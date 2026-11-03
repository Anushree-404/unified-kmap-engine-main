import { Link, createFileRoute } from "@tanstack/react-router";
import { Bug, CloudSun, FlaskConical, LineChart, Satellite, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — Crop, Soil, Disease & Yield AI | AGROVA AI" },
      {
        name: "description",
        content:
          "Explore AGROVA AI modules: crop intelligence, soil analytics, disease detection, yield prediction, weather intelligence and satellite monitoring.",
      },
      { property: "og:title", content: "AGROVA AI Solutions for Precision Agriculture" },
      {
        property: "og:description",
        content: "Six connected AI modules covering the full crop season.",
      },
    ],
  }),
  component: SolutionsPage,
});

const solutions = [
  {
    icon: Sprout,
    title: "Crop Intelligence",
    body: "Ensemble models (Random Forest, XGBoost, CatBoost) rank the top five crops for a field using soil type, texture, rainfall, temperature, humidity, groundwater and season.",
    outputs: ["Top 5 crops", "Expected yield", "Profitability", "Water requirement", "Risk score"],
  },
  {
    icon: FlaskConical,
    title: "Soil Analytics",
    body: "Lab results and sensor readings become a living soil profile with NPK balance, pH trend and organic-matter guidance tied to the next sowing window.",
    outputs: ["NPK balance", "pH trend", "Amendment plan"],
  },
  {
    icon: Bug,
    title: "Disease Detection",
    body: "CNN vision models trained on PlantVillage-scale data identify disease from a leaf photo and return severity plus treatment paths.",
    outputs: ["Disease + confidence", "Severity", "Organic & chemical treatment", "Prevention"],
  },
  {
    icon: LineChart,
    title: "Yield Prediction",
    body: "Gradient-boosted regression forecasts production, revenue and profit so buyers, credit and storage can be planned before harvest.",
    outputs: ["Production forecast", "Revenue", "Profit"],
  },
  {
    icon: CloudSun,
    title: "Weather Intelligence",
    body: "Multi-source forecasts drive rain, heat, frost and storm alerts pushed to the farmer in their language.",
    outputs: ["Rain outlook", "Heat & frost alerts", "Storm warnings"],
  },
  {
    icon: Satellite,
    title: "Satellite Monitoring",
    body: "Field-boundary vegetation indices track canopy health between visits and flag zones that need scouting.",
    outputs: ["Vegetation index", "Stress zones", "Season timeline"],
  },
];

function SolutionsPage() {
  return (
    <>
      <section className="surface-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h1 className="max-w-3xl text-4xl sm:text-5xl">
            Solutions for every acre, every stakeholder
          </h1>
          <p className="mt-5 max-w-2xl text-primary-foreground/90">
            Modules work standalone or together. Smallholders start with a phone; enterprises
            connect sensors, satellites and APIs.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {solutions.map((s) => (
            <Card key={s.title} className="card-hover border-border/60">
              <CardHeader>
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="size-5" />
                </span>
                <CardTitle className="mt-3 text-xl">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.body}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.outputs.map((o) => (
                    <li
                      key={o}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-3">
          <Button asChild variant="hero" size="xl">
            <Link to="/field-analysis">Try it on your field</Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/agronomist">Talk to an agronomist</Link>
          </Button>
        </div>
      </section>
    </>
  );
}