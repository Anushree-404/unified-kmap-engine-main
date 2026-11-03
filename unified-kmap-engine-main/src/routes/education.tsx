import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ExternalLink, GraduationCap, Languages, ShoppingCart } from "lucide-react";
import { useState } from "react";

import coverDairy from "@/assets/book-dairy.jpg";
import coverHorticulture from "@/assets/book-horticulture.jpg";
import coverNatural from "@/assets/book-natural-farming.jpg";
import coverOrganic from "@/assets/book-organic.jpg";
import coverSeeds from "@/assets/book-seeds.jpg";
import coverSoil from "@/assets/book-soil-water.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: "Education — Kannada Agriculture Books for Farmers | AGROVA AI" },
      {
        name: "description",
        content:
          "A curated shelf of Kannada agriculture books — natural farming, organic practice, soil and water, horticulture, dairy and seed conservation — with links to read or buy.",
      },
      { property: "og:title", content: "Kannada Agriculture Library — AGROVA AI Education" },
      {
        property: "og:description",
        content:
          "Standard Kannada titles on ಸಾವಯವ ಕೃಷಿ, ನೈಸರ್ಗಿಕ ಕೃಷಿ, ಜಲ ಸಂರಕ್ಷಣೆ, ತೋಟಗಾರಿಕೆ and ಹೈನುಗಾರಿಕೆ with cover art and reading links.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EducationPage,
});

type Book = {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  publisher: string;
  topic: "Natural farming" | "Organic" | "Soil & water" | "Horticulture" | "Livestock" | "Seeds";
  blurb: string;
  cover: string;
  read: string;
  shop: string;
};

const BOOKS: Book[] = [
  {
    id: "hullina-kranti",
    title: "ಒಂದು ಹುಲ್ಲಿನ ಕ್ರಾಂತಿ",
    titleEn: "Ondu Hullina Kranti (The One-Straw Revolution)",
    author: "ಮಸನೊಬು ಫುಕುವೊಕಾ · Masanobu Fukuoka",
    publisher: "Kannada translation · Navakarnataka",
    topic: "Natural farming",
    blurb:
      "The classic that started do-nothing farming: no tilling, no chemical fertiliser, no weeding — a philosophy that reads as beautifully in Kannada as it farms in the field.",
    cover: coverNatural,
    read: "https://www.google.com/search?q=%E0%B2%92%E0%B2%82%E0%B2%A6%E0%B3%81+%E0%B2%B9%E0%B3%81%E0%B2%B2%E0%B3%8D%E0%B2%B2%E0%B2%BF%E0%B2%A8+%E0%B2%95%E0%B3%8D%E0%B2%B0%E0%B2%BE%E0%B2%82%E0%B2%A4%E0%B2%BF+book&tbm=bks",
    shop: "https://www.amazon.in/s?k=Ondu+Hullina+Kranti+Kannada",
  },
  {
    id: "shunya-bandavala",
    title: "ಶೂನ್ಯ ಬಂಡವಾಳ ನೈಸರ್ಗಿಕ ಕೃಷಿ",
    titleEn: "Shoonya Bandavala Naisargika Krishi (Zero Budget Natural Farming)",
    author: "ಸುಭಾಷ್ ಪಾಳೇಕರ್ · Subhash Palekar",
    publisher: "Kannada edition",
    topic: "Natural farming",
    blurb:
      "Jeevamrutha, beejamrutha, mulching and waaphasa explained step by step for farmers who want to cut input cost to almost nothing.",
    cover: coverSeeds,
    read: "https://www.google.com/search?q=Subhash+Palekar+Zero+Budget+Natural+Farming+Kannada&tbm=bks",
    shop: "https://www.amazon.in/s?k=Subhash+Palekar+Kannada+Naisargika+Krishi",
  },
  {
    id: "savayava-krishi",
    title: "ಸಾವಯವ ಕೃಷಿ ಕೈಪಿಡಿ",
    titleEn: "Savayava Krishi Kaipidi (Organic Farming Handbook)",
    author: "ಡಾ. ಎಲ್. ನಾರಾಯಣ ರೆಡ್ಡಿ · Dr. L. Narayana Reddy",
    publisher: "Organic farming movement, Karnataka",
    topic: "Organic",
    blurb:
      "A working handbook from one of Karnataka's best known organic farmers — compost, green manure, botanical pest control and crop rotation for small holdings.",
    cover: coverOrganic,
    read: "https://www.google.com/search?q=%E0%B2%B8%E0%B2%BE%E0%B2%B5%E0%B2%AF%E0%B2%B5+%E0%B2%95%E0%B3%83%E0%B2%B7%E0%B2%BF+L+Narayana+Reddy+book&tbm=bks",
    shop: "https://www.sapnaonline.com/search?q=savayava%20krishi",
  },
  {
    id: "jala-samrakshane",
    title: "ಕೃಷಿ ಹೊಂಡ ಮತ್ತು ಜಲ ಸಂರಕ್ಷಣೆ",
    titleEn: "Krishi Honda mattu Jala Samrakshane (Farm Ponds & Water Conservation)",
    author: "ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಧಾರವಾಡ · UAS Dharwad",
    publisher: "University of Agricultural Sciences, Dharwad",
    topic: "Soil & water",
    blurb:
      "Rain-water harvesting, farm pond design, bunding and drip layout written for dryland taluks of north Karnataka, with subsidy pathways included.",
    cover: coverSoil,
    read: "https://www.uasd.edu/",
    shop: "https://www.google.com/search?q=UAS+Dharwad+Kannada+publications+jala+samrakshane",
  },
  {
    id: "totagarike",
    title: "ತೋಟಗಾರಿಕೆ ಬೆಳೆಗಳ ಬೇಸಾಯ",
    titleEn: "Totagarike Belegala Besaya (Cultivation of Horticultural Crops)",
    author: "ತೋಟಗಾರಿಕೆ ವಿಜ್ಞಾನಗಳ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಬಾಗಲಕೋಟೆ · UHS Bagalkot",
    publisher: "University of Horticultural Sciences, Bagalkot",
    topic: "Horticulture",
    blurb:
      "Arecanut, coconut, mango, banana and vegetable agronomy — spacing, nutrition schedules and pest calendars adapted to Karnataka's agro-climatic zones.",
    cover: coverHorticulture,
    read: "https://uhsbagalkot.edu.in/",
    shop: "https://www.google.com/search?q=UHS+Bagalkot+Kannada+horticulture+book",
  },
  {
    id: "hainugarike",
    title: "ಹೈನುಗಾರಿಕೆ ಮತ್ತು ಪಶು ಸಂಗೋಪನೆ",
    titleEn: "Hainugarike mattu Pashu Sangopane (Dairy & Animal Husbandry)",
    author: "ಪಶು ವೈದ್ಯಕೀಯ ವಿಶ್ವವಿದ್ಯಾಲಯ, ಬೀದರ್ · KVAFSU Bidar",
    publisher: "Karnataka Veterinary, Animal & Fisheries Sciences University",
    topic: "Livestock",
    blurb:
      "Breed selection, green fodder planning, shed hygiene, vaccination schedule and milk economics for the two-to-five cow family dairy.",
    cover: coverDairy,
    read: "https://kvafsu.edu.in/",
    shop: "https://www.google.com/search?q=KVAFSU+Kannada+hainugarike+book",
  },
];

const TOPICS = ["All", "Natural farming", "Organic", "Soil & water", "Horticulture", "Livestock"] as const;

function EducationPage() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("All");
  const books = topic === "All" ? BOOKS : BOOKS.filter((b) => b.topic === topic);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <Badge variant="secondary">
        <GraduationCap className="size-3" /> Education
      </Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">ಕನ್ನಡದಲ್ಲಿ ಕೃಷಿ ಗ್ರಂಥಾಲಯ</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Standard Kannada agriculture titles from respected authors and universities — read them
        online or order a copy. Knowledge in the mother tongue travels farthest in the village.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <Button
            key={t}
            size="sm"
            variant={topic === t ? "default" : "outline"}
            onClick={() => setTopic(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <Card key={b.id} className="card-hover flex flex-col overflow-hidden border-border/60 pt-0">
            <div className="relative">
              <img
                src={b.cover}
                alt={`Cover of ${b.titleEn}`}
                loading="lazy"
                width={512}
                height={768}
                className="h-64 w-full object-cover"
              />
              <span className="absolute left-3 top-3">
                <Badge variant="secondary">{b.topic}</Badge>
              </span>
            </div>
            <CardHeader className="gap-1">
              <CardTitle className="text-xl leading-snug">{b.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{b.titleEn}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div>
                <p className="text-sm font-medium">{b.author}</p>
                <p className="text-xs text-muted-foreground">{b.publisher}</p>
              </div>
              <p className="text-sm text-muted-foreground">{b.blurb}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Languages className="size-3.5" /> Kannada
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button asChild size="sm" variant="hero">
                  <a href={b.read} target="_blank" rel="noreferrer noopener">
                    <BookOpen /> Read
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={b.shop} target="_blank" rel="noreferrer noopener">
                    <ShoppingCart /> Buy
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 border-dashed">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-sm text-muted-foreground">
            Know a Kannada agriculture title that belongs on this shelf? Send it to us and we will
            add it with the author's credit.
          </p>
          <Button asChild variant="outline" size="sm">
            <a href="mailto:agrova.ai.519@gmail.com?subject=Kannada%20agriculture%20book%20suggestion">
              Suggest a book <ExternalLink />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
