import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact AGROVA AI — Book a Demo or Talk to Sales" },
      {
        name: "description",
        content:
          "Get in touch with the AGROVA AI team for demos, enterprise deployments, research partnerships and farmer support.",
      },
      { property: "og:title", content: "Contact AGROVA AI" },
      { property: "og:description", content: "Book a demo or talk to our agronomy team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  organisation: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const data = parsed.data;
    const mailtoUrl = `mailto:agrova.ai.519@gmail.com?subject=${encodeURIComponent(`Enquiry from ${data.name}`)}&body=${encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nOrganisation: ${data.organisation || "N/A"}\n\nMessage:\n${data.message}`)}`;
    // Open mail client with pre-filled form
    location.href = mailtoUrl;
    e.currentTarget.reset();
    toast.success("Opening your mail client to send email to agrova.ai.519@gmail.com");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-4xl sm:text-5xl">Let's grow together</h1>
        <p className="mt-4 text-muted-foreground">
          Farmers, cooperatives, governments and researchers — tell us about your fields and we'll
          map the fastest path to value.
        </p>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <a href="mailto:agrova.ai.519@gmail.com" className="font-medium hover:underline text-foreground">
              agrova.ai.519@gmail.com
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="size-5 text-primary" /> +91 80 4000 2200
          </li>
          <li className="flex items-center gap-3">
            <MapPin className="size-5 text-primary" /> Bengaluru, India · Remote-first team
          </li>
        </ul>
      </div>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle>Book a demo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" maxLength={100} aria-invalid={!!errors["name"]} />
              {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" maxLength={255} aria-invalid={!!errors["email"]} />
              {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organisation">Organisation (optional)</Label>
              <Input id="organisation" name="organisation" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">How can we help?</Label>
              <Textarea id="message" name="message" rows={5} maxLength={1000} aria-invalid={!!errors["message"]} />
              {errors["message"] && <p className="text-xs text-destructive">{errors["message"]}</p>}
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full">
              Send enquiry
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}