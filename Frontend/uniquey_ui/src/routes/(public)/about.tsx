import { createFileRoute } from "@tanstack/react-router";
import { CTABanner } from "@/components/cta-banner";
import apartmentImg from "@/assets/experience-apartment.jpg";

export const Route = createFileRoute("/(public)/about")({
  head: () => ({
    meta: [
      { title: "About UNIQUEY · Kenya's Trusted Travel Concierge" },
      {
        name: "description",
        content:
          "UNIQUEY is a Kenyan-owned travel concierge helping visitors arrive, settle and thrive — with local expertise, verified partners and a real team behind every trip.",
      },
      { property: "og:title", content: "About UNIQUEY" },
      { property: "og:description", content: "We're the trusted local friend you have in Kenya." },
    ],
  }),
  component: About,
});

function About() {
  return (

      <>
          <section className="container-wide grid gap-12 pt-24 pb-20 md:grid-cols-2 md:items-center">
              <div>
                  <p className="mb-3 text-sm uppercase tracking-widest text-forest">About UNIQUEY</p>
                  <h1 className="text-balance text-4xl md:text-6xl">
                      We're the trusted local friend you have in Kenya.
                  </h1>
                  <p className="mt-6 text-lg text-muted-foreground">
                      UNIQUEY was built for the traveler who wants confidence over choice. Instead of endless
                      listings, we do the work behind the scenes — vetting apartments, coordinating drivers,
                      and staying reachable when the small things come up.
                  </p>
                  <p className="mt-4 text-lg text-muted-foreground">
                      Every partner is personally verified. Every trip is coordinated by a real person. And
                      someone from our concierge team stays with you — on WhatsApp, on call — for the entire
                      time you're in Kenya.
                  </p>
              </div>
              <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-elegant)]">
                  <img
                      src={apartmentImg}
                      alt="An elegant Nairobi apartment interior"
                      className="h-full w-full object-cover"
                      loading="lazy"/>
              </div>
          </section>
          <section className="bg-[color:var(--sand)]/40 py-20">
              <div className="container-wide grid gap-10 md:grid-cols-3">
                  {[
                      {n: "01", t: "Local", b: "Founded and run by Kenyans who know the city block by block."},
                      {n: "02", t: "Personal", b: "Every guest works with a dedicated concierge — not a call center."},
                      {n: "03", t: "Trusted", b: "Every apartment, driver and vendor is personally vetted."},
                  ].map((v) => (
                      <div key={v.n}>
                          <p className="mb-3 font-serif text-4xl text-primary">{v.n}</p>
                          <h3 className="mb-2 text-2xl">{v.t}</h3>
                          <p className="text-muted-foreground">{v.b}</p>
                      </div>
                  ))}
              </div>
          </section>
          <CTABanner/></>

  );
}
