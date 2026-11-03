import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, UserRound } from "lucide-react";

import { AgronomistChat } from "@/components/advisory/AgronomistChat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/agronomist")({
  head: () => ({ meta: [{ title: "Connect with an Agronomist — AGROVA AI" }] }),
  component: AgronomistPage,
});

function AgronomistPage() {
  const { lang } = useI18n();
  const kn = lang === "kn";
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <Badge variant="secondary"><UserRound className="size-3" /> {kn ? "ಕೃಷಿ ತಜ್ಞರ ಸಂಪರ್ಕ" : "Agronomist connection"}</Badge>
      <h1 className="mt-4 text-4xl sm:text-5xl">{kn ? "ನಿಜವಾದ ಕೃಷಿ ತಜ್ಞರೊಂದಿಗೆ ಮಾತನಾಡಿ" : "Connect with a real agronomist"}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">{kn ? "ನಿಮ್ಮ ಬೆಳೆ, ಮಣ್ಣು ಅಥವಾ ರೋಗದ ಸಮಸ್ಯೆಯನ್ನು ಮಾನವ ಕೃಷಿ ತಜ್ಞರಿಗೆ ಕಳುಹಿಸಿ. ತುರ್ತು ಪ್ರಶ್ನೆಗಳಿಗೆ ಕೆಳಗಿನ ನೇರ ಸಂಪರ್ಕ ಆಯ್ಕೆಗಳನ್ನು ಬಳಸಿ." : "Send your crop, soil or disease question to a human agronomist. Use the direct contact options below for a real person."}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card className="border-border/60"><CardHeader><CardTitle className="text-base"><Phone className="mb-2 size-5 text-primary" /> {kn ? "ದೂರವಾಣಿ" : "Phone"}</CardTitle></CardHeader><CardContent><Button asChild variant="outline" className="w-full"><a href="tel:+918040002200">+91 80 4000 2200</a></Button></CardContent></Card>
        <Card className="border-border/60"><CardHeader><CardTitle className="text-base"><MessageCircle className="mb-2 size-5 text-primary" /> WhatsApp</CardTitle></CardHeader><CardContent><Button asChild variant="outline" className="w-full"><a href="https://wa.me/918040002200" target="_blank" rel="noreferrer noopener">{kn ? "WhatsApp ತೆರೆಯಿರಿ" : "Open WhatsApp"}</a></Button></CardContent></Card>
        <Card className="border-border/60"><CardHeader><CardTitle className="text-base"><Mail className="mb-2 size-5 text-primary" /> {kn ? "ಇಮೇಲ್" : "Email"}</CardTitle></CardHeader><CardContent><Button asChild variant="outline" className="w-full"><a href="mailto:agrova.ai.519@gmail.com">agrova.ai.519@gmail.com</a></Button></CardContent></Card>
      </div>
      <Card className="mt-8 border-primary/20 bg-primary/5"><CardHeader><CardTitle>{kn ? "ಪ್ರಶ್ನೆ ಕಳುಹಿಸಿ" : "Send a consultation request"}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{kn ? "ನಿಮ್ಮ ಜಿಲ್ಲೆ, ಬೆಳೆ, ಮಣ್ಣು ಮತ್ತು ಸಮಸ್ಯೆಯನ್ನು ಇಮೇಲ್ ಅಥವಾ WhatsApp ಸಂದೇಶದಲ್ಲಿ ಸೇರಿಸಿ." : "Include your district, crop, soil type and the problem you are seeing in your email or WhatsApp message."}</p><Button asChild variant="hero" className="mt-4"><a href="mailto:agrova.ai.519@gmail.com?subject=Farm%20consultation">{kn ? "ಇಮೇಲ್ ಬರೆಯಿರಿ" : "Write an email"}</a></Button></CardContent></Card>
      <div className="mt-10 border-t border-border/60 pt-8"><h2 className="text-2xl">{kn ? "ಎಐ ಚಾಟ್‌ಬಾಟ್" : "AI chatbot"}</h2><p className="mt-2 text-sm text-muted-foreground">{kn ? "ಮಾನವ ತಜ್ಞರ ಬದಲು ತಕ್ಷಣದ ಸಾಮಾನ್ಯ ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಪ್ರತ್ಯೇಕ ಎಐ ಆಯ್ಕೆಯನ್ನು ಬಳಸಿ." : "Use the separate AI option for instant general guidance before contacting a human expert."}</p><div className="mt-4"><AgronomistChat trigger={<Button variant="outline"><MessageCircle /> {kn ? "ಎಐ ಕೃಷಿ ಚಾಟ್‌ಬಾಟ್ ತೆರೆಯಿರಿ" : "Open AI agronomy chatbot"}</Button>} /></div></div>
    </div>
  );
}
