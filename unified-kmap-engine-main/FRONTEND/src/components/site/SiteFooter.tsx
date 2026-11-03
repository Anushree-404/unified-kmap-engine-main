import { Link } from "@tanstack/react-router";

import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

const groups: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Solutions", to: "/solutions" },
      { label: "KMap", to: "/kmap" },
      { label: "AI Demo", to: "/demo" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Farmer support",
    links: [
      { label: "Donation", to: "/donation" },
      { label: "Outreach", to: "/outreach" },
      { label: "Education", to: "/education" },
      { label: "Stay Connected", to: "/connect" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function SiteFooter() {
  const { lang, t } = useI18n();
  const kn = lang === "kn";
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            {kn ? "ಬೆಳೆಯುವ ಬುದ್ಧಿಮತ್ತೆ. ನಾಳೆಯ ಸುಗ್ಗಿ. ಪ್ರತಿಯೊಬ್ಬ ರೈತನಿಗೆ ಎಐ ಬೆಳೆ ಶಿಫಾರಸು, ರೋಗ ಪತ್ತೆ ಮತ್ತು ನಿಖರ ಕೃಷಿ ಸಲಹೆ." : "Growing Intelligence. Harvesting Tomorrow. AI-powered crop recommendation, disease detection and precision farming advisory for every farmer."}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {kn ? "ಜಿಡಿಪಿಆರ್ ಮತ್ತು ಭಾರತದ ಡಿಪಿಡಿಪಿ ಕಾಯ್ದೆಗೆ ಹೊಂದಿಕೆ · ಎನ್ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಸಂಗ್ರಹ · ಪಾರದರ್ಶಕ ಮಾದರಿಗಳು" : "GDPR & India DPDP aligned · Encrypted storage · Transparent models"}
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-sm font-semibold">{t(g.title)}</h3>
            <ul className="mt-4 space-y-2">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        {kn ? `© ${new Date().getFullYear()} AGROVA AI. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.` : `© ${new Date().getFullYear()} AGROVA AI. All rights reserved.`}
      </div>
    </footer>
  );
}