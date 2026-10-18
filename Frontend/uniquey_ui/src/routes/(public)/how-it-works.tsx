import { createFileRoute } from "@tanstack/react-router";
import { CTABanner } from "@/components/cta-banner";

export const Route = createFileRoute("/(public)/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works · UNIQUEY Kenya Concierge" },
      {
        name: "description",
        content:
          "How UNIQUEY works — from your first inquiry to airport pickup and beyond. Seven simple steps, one trusted concierge team.",
      },
      { property: "og:title", content: "How UNIQUEY Works" },
      { property: "og:description", content: "Seven quiet steps to a great trip in Kenya." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { t: "Tell us about your trip", b: "Share dates, purpose, and preferences via the Plan My Stay form." },
  { t: "Your concierge contacts you", b: "Within 24 hours, one dedicated specialist reaches out." },
  { t: "We recommend accommodation", b: "Two or three vetted options matched to your needs." },
  { t: "Approve your itinerary", b: "Airport pickup, apartment, add-ons — all laid out clearly." },
  { t: "Receive your invoice", b: "Transparent pricing, no hidden fees." },
  { t: "Pay your deposit", b: "Secure the booking. A guest dashboard is created for you." },
  { t: "Travel with confidence", b: "Your concierge is on WhatsApp from arrival to departure." },
];

function HowItWorks() {
  return (

      <>
          <section className="container-wide pt-24 pb-8 text-center">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">How It Works</p>
              <h1 className="mx-auto max-w-3xl text-balance text-4xl md:text-6xl">
                  Seven quiet steps to a great trip in Kenya.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
                  No overwhelm, no hundreds of listings — just a clear path from your first message to your
                  first coffee in Nairobi.
              </p>
          </section>
          <section className="container-wide max-w-3xl py-16">
              <ol className="relative space-y-6 border-l-2 border-dashed border-primary/40 pl-8">
                  {steps.map((s, i) => (
                      <li key={s.t} className="relative">
                          <span
                              className="absolute -left-[42px] flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] font-serif text-lg text-gold-foreground shadow-[var(--shadow-gold)]">
                              {i + 1}
                          </span>
                          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                              <h3 className="mb-2 text-xl">{s.t}</h3>
                              <p className="text-muted-foreground">{s.b}</p>
                          </div>
                      </li>
                  ))}
              </ol>
          </section>
          <CTABanner/></>

  );
}
