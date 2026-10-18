import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, MapPin, HeartHandshake, Clock, Users, BadgeCheck } from "lucide-react";
import { CTABanner } from "@/components/cta-banner";

export const Route = createFileRoute("/(public)/why-uniquey")({
  head: () => ({
    meta: [
      { title: "Why UNIQUEY · Kenya's Personal Travel Concierge" },
      {
        name: "description",
        content:
          "Why visitors trust UNIQUEY over booking sites: verified partners, local concierge team, personal support, and no decision fatigue.",
      },
      { property: "og:title", content: "Why Visitors Trust UNIQUEY" },
      {
        property: "og:description",
        content: "A concierge team, not a booking website. Every trip is personal.",
      },
    ],
  }),
  component: WhyUniquey,
});

const reasons = [
  { icon: ShieldCheck, t: "Verified partners only", b: "Every apartment, driver and vendor is personally visited and vetted." },
  { icon: MapPin, t: "Genuinely local", b: "Kenyan-owned, Kenyan-run — we know the neighborhoods, not just the addresses." },
  { icon: HeartHandshake, t: "One dedicated concierge", b: "You get a real person, not a support ticket." },
  { icon: Clock, t: "24/7 availability", b: "WhatsApp, phone, email — whichever way you need us." },
  { icon: Users, t: "Trusted by diaspora", b: "Families coming home rely on us to prepare everything." },
  { icon: BadgeCheck, t: "Transparent pricing", b: "Clear quotations. No hidden markups. Deposit protects your booking." },
];

function WhyUniquey() {
  return (
      <>
          <section className="container-wide pt-24 pb-16 text-center">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">Why UNIQUEY</p>
              <h1 className="mx-auto max-w-3xl text-balance text-4xl md:text-6xl">
                  A concierge team. Not a booking website.
              </h1>
          </section>
          <section className="container-wide grid gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
              {reasons.map(({icon: Icon, t, b}) => (
                  <div
                      key={t}
                      className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
                  >
                      <div
                          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-forest">
                          <Icon className="h-5 w-5"/>
                      </div>
                      <h3 className="mb-2 text-xl">{t}</h3>
                      <p className="text-muted-foreground">{b}</p>
                  </div>
              ))}
          </section>
          <CTABanner/></>
  );
}
