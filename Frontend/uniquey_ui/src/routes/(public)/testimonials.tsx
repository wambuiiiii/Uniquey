import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { CTABanner } from "@/components/cta-banner";
import { testimonials } from "@/lib/testimonials";

export const Route = createFileRoute("/(public)/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials · UNIQUEY Kenya Concierge" },
      {
        name: "description",
        content:
          "Real reviews from UNIQUEY guests — diaspora families, solo women travelers, medical visitors and business executives.",
      },
      { property: "og:title", content: "UNIQUEY Guest Testimonials" },
      { property: "og:description", content: "Guests, in their own words." },
    ],
  }),
  component: Testimonials,
});

function Testimonials() {
  return (
      <>
          <section className="container-wide pt-24 pb-10 text-center">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">Testimonials</p>
              <h1 className="mx-auto max-w-3xl text-balance text-4xl md:text-6xl">
                  Guests, in their own words.
              </h1>
          </section>
          <section className="container-wide grid gap-6 pb-24 md:grid-cols-2">
              {testimonials.map((t) => (
                  <figure
                      key={t.name}
                      className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
                  >
                      <div className="mb-3 flex gap-1 text-primary">
                          {Array.from({length: t.stars}).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current"/>
                          ))}
                      </div>
                      <blockquote className="text-lg leading-relaxed">"{t.quote}"</blockquote>
                      <figcaption className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                              {t.name} <span className="ml-1">{t.flag}</span> · {t.country}
                          </span>
                          <span>{t.package}</span>
                      </figcaption>
                  </figure>
              ))}
          </section>
          <CTABanner/></>
  );
}
