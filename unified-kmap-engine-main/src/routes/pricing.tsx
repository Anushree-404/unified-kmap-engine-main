import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Plans for Farmers, Farms & Enterprises | AGROVA AI" },
      {
        name: "description",
        content:
          "Simple AGROVA AI pricing: Starter for smallholders, Professional for commercial farms with IoT, and Enterprise with API access and white label.",
      },
      { property: "og:title", content: "AGROVA AI Pricing" },
      {
        property: "og:description",
        content: "Starter, Professional and Enterprise plans for precision agriculture AI.",
      },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Starter",
    audience: "Smallholder farmers",
    price: "Free",
    note: "1 field included",
    features: [
      "Crop recommendation",
      "20 disease scans / month",
      "Weather alerts",
      "Monthly PDF report",
      "8 languages",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Professional",
    audience: "Commercial farms & cooperatives",
    price: "₹1,499",
    note: "per farm / month",
    features: [
      "Unlimited predictions & scans",
      "Yield and revenue forecasting",
      "IoT sensor integration",
      "Satellite field monitoring",
      "Priority agronomist support",
    ],
    cta: "Start 14-day trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    audience: "Government, agritech & research",
    price: "Custom",
    note: "annual agreement",
    features: [
      "Full API & data export",
      "White-label portal",
      "Role-based access control",
      "Audit logs & compliance pack",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-16 text-center sm:px-6">
        <h1 className="text-4xl sm:text-5xl">Pricing that scales from one acre to a state</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          No hidden per-prediction fees. Every plan includes explainable AI, encrypted storage and
          multilingual support.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={
                p.highlighted
                  ? "relative border-primary/60 shadow-lift"
                  : "border-border/60 card-hover"
              }
            >
              {p.highlighted && (
                <Badge className="absolute -top-3 left-6 bg-[image:var(--gradient-leaf)] text-primary-foreground">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{p.audience}</p>
                <p className="mt-4 font-display text-4xl font-bold">{p.price}</p>
                <p className="text-xs text-muted-foreground">{p.note}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="mt-8 w-full"
                  size="lg"
                  variant={p.highlighted ? "hero" : "outline"}
                >
                  <Link to="/contact">{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}