import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { CTABanner } from "@/components/cta-banner";

export const Route = createFileRoute("/(public)/contact")({
  head: () => ({
    meta: [
      { title: "Contact UNIQUEY · Kenya Travel Concierge" },
      {
        name: "description",
        content:
          "Reach the UNIQUEY concierge team by WhatsApp, phone or email. We respond within 24 hours — often much sooner.",
      },
      { property: "og:title", content: "Contact UNIQUEY" },
      { property: "og:description", content: "WhatsApp, phone or email — we're one message away." },
    ],
  }),
  component: Contact,
});

const items = [
  { icon: MessageCircle, t: "WhatsApp", d: "+254 700 000 000", href: "https://wa.me/254700000000" },
  { icon: Phone, t: "Call", d: "+254 700 000 000", href: "tel:+254700000000" },
  { icon: Mail, t: "Email", d: "concierge@uniquey.co.ke", href: "mailto:concierge@uniquey.co.ke" },
  { icon: MapPin, t: "Based in", d: "Nairobi, Kenya" },
];

function Contact() {
  return (

      <>
          <section className="container-wide pt-24 pb-16">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">Contact</p>
              <h1 className="max-w-2xl text-balance text-4xl md:text-6xl">
                  One message. One local team. Any time.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                  For fastest replies, WhatsApp works best. For detailed trips, use the Plan My Stay form.
              </p>
          </section>
          <section className="container-wide grid gap-6 pb-24 md:grid-cols-2">
              {items.map(({icon: Icon, t, d, href}) => {
                  const inner = (
                      <div
                          className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)]">
                          <div
                              className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-forest">
                              <Icon className="h-5 w-5"/>
                          </div>
                          <div>
                              <p className="text-xs uppercase tracking-widest text-forest">{t}</p>
                              <p className="mt-1 text-lg">{d}</p>
                          </div>
                      </div>
                  );
                  return href ? (
                      <a key={t} href={href} className="block">
                          {inner}
                      </a>
                  ) : (
                      <div key={t}>{inner}</div>
                  );
              })}
          </section>
          <CTABanner/></>

  );
}
