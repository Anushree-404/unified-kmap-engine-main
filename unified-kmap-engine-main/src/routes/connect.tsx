import { createFileRoute } from "@tanstack/react-router";
import {
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Stay Connected — Visit AGROVA AI at AIET Moodbidri" },
      {
        name: "description",
        content:
          "Reach the AGROVA AI team at Alva's Institute of Engineering and Technology, Mijar, Moodbidri — phone, email, office hours and a live location map.",
      },
      { property: "og:title", content: "Stay Connected with AGROVA AI" },
      {
        property: "og:description",
        content:
          "Contact details, support hours and directions to our base at Alva's Institute of Engineering and Technology, Moodbidri, Karnataka.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConnectPage,
});

const LAT = 13.0662;
const LON = 74.9931;
const BBOX = `${LON - 0.012}%2C${LAT - 0.008}%2C${LON + 0.012}%2C${LAT + 0.008}`;

const CONTACTS = [
  {
    icon: MapPin,
    label: "Campus address",
    lines: [
      "AGROVA AI, Innovation Lab",
      "Alva's Institute of Engineering and Technology",
      "Shobhavana Campus, Mijar, Moodbidri",
      "Dakshina Kannada, Karnataka 574225",
    ],
  },
  {
    icon: Phone,
    label: "Farmer helpline",
    lines: ["+91 80 4718 2200", "Kannada · English · Hindi support"],
  },
  {
    icon: Mail,
    label: "Email",
    lines: ["hello@agrova.ai", "support@agrova.ai"],
  },
  {
    icon: Clock,
    label: "Office hours",
    lines: ["Mon – Sat · 9:00 AM to 6:30 PM IST", "Helpline open on harvest Sundays"],
  },
];

function ConnectPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Badge variant="secondary">Stay connected</Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">Come find us on campus</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        AGROVA AI is built at Alva's Institute of Engineering and Technology in Mijar, Moodbidri.
        Walk in with your soil card, call the helpline, or write to us — a farmer never waits more
        than one working day.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {CONTACTS.map((c) => {
            const I = c.icon;
            return (
              <Card key={c.label} className="border-border/60">
                <CardContent className="flex gap-4 py-6">
                  <span className="h-fit rounded-xl bg-accent p-3 text-accent-foreground">
                    <I className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {c.label}
                    </p>
                    {c.lines.map((l) => (
                      <p key={l} className="text-sm">
                        {l}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${LAT},${LON}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Navigation /> Get directions
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="tel:+918047182200">
                <Phone /> Call helpline
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="mailto:agrova.ai.519@gmail.com">
                <MessageSquare /> Email us
              </a>
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-border/60 shadow-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="size-5 text-primary" /> Alva's Institute of Engineering and
              Technology
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Shobhavana Campus, Mijar, Moodbidri — {LAT}° N, {LON}° E
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border">
              <iframe
                title="Map showing Alva's Institute of Engineering and Technology, Moodbidri"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${LAT}%2C${LON}`}
                className="h-[420px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Nearest landmark: Mijar cross, 8 km from Moodbidri town on the Mangaluru–Karkala
                road.
              </p>
              <Button asChild size="sm" variant="ghost">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${LAT}&mlon=${LON}#map=16/${LAT}/${LON}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open larger map <ExternalLink />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
