import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About AGROVA AI — Mission, Research & Roadmap" },
      {
        name: "description",
        content:
          "AGROVA AI builds trusted, explainable AI for precision agriculture with agronomists, researchers and farming communities.",
      },
      { property: "og:title", content: "About AGROVA AI" },
      {
        property: "og:description",
        content: "Our mission, research approach and product roadmap.",
      },
    ],
  }),
  component: AboutPage,
});

const roadmap = [
  {
    phase: "Phase 1",
    window: "Weeks 1–8",
    items: ["Authentication & roles", "Farmer dashboard", "Crop recommendation", "Disease detection", "Basic reports"],
  },
  {
    phase: "Phase 2",
    window: "Weeks 9–16",
    items: ["AI advisory chatbot", "Weather intelligence", "Yield prediction", "Satellite monitoring", "PWA & offline"],
  },
  {
    phase: "Phase 3",
    window: "Weeks 17–24",
    items: ["Marketplace", "Equipment & drone APIs", "Satellite data", "Enterprise portal", "White label"],
  },
];

function AboutPage() {
  return (
    <>
      <section className="surface-hero">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h1 className="max-w-3xl text-4xl sm:text-5xl">AI for every farmer</h1>
          <p className="mt-5 max-w-2xl text-primary-foreground/90">
            We build agricultural intelligence that a smallholder can act on today and a ministry
            can audit tomorrow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["20M+", "acres monitored"],
            ["95%", "disease detection accuracy"],
            ["8", "farmer languages planned"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <p className="font-display text-3xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Empower farmers with artificial intelligence through crop recommendations, early disease
            detection, precision insights and sustainable advisory — in language they already speak.
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Vision</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            To become the world's most trusted AI precision agriculture platform: more productivity,
            less crop loss, less water, lower environmental impact.
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-border/60 bg-accent/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl">How we build trust</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              ["Grounded advice", "Recommendations combine district agronomy profiles, weather signals and field evidence."],
              ["Explainable outputs", "Every report shows the soil, climate and risk factors behind a recommendation."],
              ["Farmer-first access", "Location analysis, AI chat and learning resources are designed for a phone and a local language."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-border/60 bg-background p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl">Roadmap</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {roadmap.map((r) => (
              <div key={r.phase} className="rounded-2xl border border-border/60 p-6 shadow-soft">
                <p className="font-display text-lg font-bold text-primary">{r.phase}</p>
                <p className="text-xs text-muted-foreground">{r.window}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {r.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl">Trust &amp; compliance</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            "GDPR",
            "India DPDP Act",
            "SOC 2 ready",
            "ISO 27001 aligned",
            "Consent management",
            "Encrypted storage",
            "Audit logs",
            "Model explainability",
          ].map((c) => (
            <span
              key={c}
              className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}