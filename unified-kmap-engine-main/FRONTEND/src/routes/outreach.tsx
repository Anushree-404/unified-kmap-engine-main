import { createFileRoute } from "@tanstack/react-router";
import { Banknote, ExternalLink, Landmark, Megaphone, Newspaper, Users } from "lucide-react";
import { useState } from "react";

import { SocialFeed } from "@/components/outreach/SocialFeed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BANKS, NEWS } from "@/data/outreach";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach — Farmer News, Bank Loans & Community | AGROVA AI" },
      {
        name: "description",
        content:
          "Central and Karnataka government schemes, agricultural loan options from Karnataka banks, and a farmer social network to post, comment and follow.",
      },
      { property: "og:title", content: "Outreach — News, Bank and Social for Karnataka farmers" },
      {
        property: "og:description",
        content:
          "Scheme announcements, KCC and agri loan comparison across Karnataka banks, and a community feed with government and institutional accounts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OutreachPage,
});

type Tab = "news" | "bank" | "social";

const TABS: { id: Tab; label: string; icon: typeof Newspaper; blurb: string }[] = [
  { id: "news", label: "News", icon: Newspaper, blurb: "Central & state schemes" },
  { id: "bank", label: "Bank", icon: Landmark, blurb: "Loans for farm activities" },
  { id: "social", label: "Social Media", icon: Users, blurb: "Post, comment, follow" },
];

function OutreachPage() {
  const [tab, setTab] = useState<Tab>("news");
  const [level, setLevel] = useState<"All" | "Central" | "Karnataka">("All");

  const news = level === "All" ? NEWS : NEWS.filter((n) => n.level === level);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Badge variant="secondary">
        <Megaphone className="size-3" /> Outreach
      </Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">Everything beyond the field</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Schemes worth applying for, credit worth comparing, and a community worth talking to — all
        in one place for Karnataka farmers.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {TABS.map((t) => {
          const I = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`card-hover rounded-2xl border p-5 text-left transition-colors ${
                active ? "border-primary bg-accent" : "border-border/60 bg-card"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold">
                <I className="size-5 text-primary" /> {t.label}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{t.blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        {tab === "news" && (
          <div>
            <div className="flex flex-wrap gap-2">
              {(["All", "Central", "Karnataka"] as const).map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant={level === l ? "default" : "outline"}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </Button>
              ))}
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {news.map((n) => (
                <Card key={n.id} className="card-hover flex flex-col border-border/60">
                  <CardHeader className="gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={n.level === "Central" ? "default" : "secondary"}>
                        {n.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{n.scheme}</span>
                    </div>
                    <CardTitle className="text-lg leading-snug">{n.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="text-sm text-muted-foreground">{n.summary}</p>
                    <p className="rounded-xl bg-accent/60 p-3 text-sm font-medium text-accent-foreground">
                      {n.benefit}
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                      <a href={n.link} target="_blank" rel="noreferrer noopener">
                        Official portal <ExternalLink />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "bank" && (
          <div className="space-y-6">
            <p className="max-w-3xl text-sm text-muted-foreground">
              Indicative loan products for farmers in Karnataka. Rates move with RBI and each bank's
              MCLR — confirm at the branch with your RTC, FRUITS ID and Aadhaar.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              {BANKS.map((b) => (
                <Card key={b.id} className="border-border/60">
                  <CardHeader className="gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Banknote className="size-5 text-primary" /> {b.bank}
                      </CardTitle>
                      <Badge variant="secondary">{b.kind}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{b.headline}</p>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {b.products.map((p) => (
                        <AccordionItem key={p.name} value={p.name}>
                          <AccordionTrigger className="text-left text-sm">{p.name}</AccordionTrigger>
                          <AccordionContent className="space-y-2 text-sm">
                            <p>
                              <span className="text-muted-foreground">Activity: </span>
                              {p.activity}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Loan amount: </span>
                              {p.amount}
                            </p>
                            <p>
                              <span className="text-muted-foreground">Interest: </span>
                              {p.rate}
                            </p>
                            <p className="text-muted-foreground">{p.note}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <a href={b.link} target="_blank" rel="noreferrer noopener">
                        Visit bank <ExternalLink />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "social" && <SocialFeed />}
      </div>
    </div>
  );
}
