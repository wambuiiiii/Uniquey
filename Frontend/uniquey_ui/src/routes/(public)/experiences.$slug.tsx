import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { CTABanner } from "@/components/cta-banner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axiosInstance from "@/api/axios";

// 1. Define the type based on your Django DB model
type FAQ = { q: string; a: string };

type Package = {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  description: string;
  hero_image: string | null;
  starting_price: string;
  active: boolean;
  audience: string[];
  included: string[];
  addons: string[];
  faqs: FAQ[];
};

// Note: If this file is inside a (public) folder, ensure your route string matches:
// createFileRoute("/(public)/experiences/$slug")
export const Route = createFileRoute("/(public)/experiences/$slug")({
  // 2. Fetch from Django DB before the page loads
  loader: async ({ params }) => {
    try {
      const res = await axiosInstance.get(`packages/${params.slug}/`);
      // Handle both paginated response arrays or direct object responses
      const experience: Package = res.data.results ? res.data.results[0] : res.data;

      if (!experience) {
        throw notFound();
      }

      return { experience };
    } catch (error) {
      console.error("Failed to fetch experience:", error);
      throw notFound();
    }
  },

  // 3. Dynamically set SEO meta tags using the DB data
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Experience not found" }, { name: "robots", content: "noindex" }] };
    }
    const { experience } = loaderData;
    // We take the first 150 characters of the description for the SEO meta description
    const metaDesc = experience.description ? experience.description.substring(0, 150) + "..." : "";

    return {
      meta: [
        { title: experience.name },
        { name: "description", content: metaDesc },
        { property: "og:title", content: experience.name },
        { property: "og:description", content: metaDesc },
      ],
    };
  },
  component: ExperienceDetail,
});

function ExperienceDetail() {
  // 4. Access the fetched data
  const { experience } = Route.useLoaderData();

  return (

      <>
          <section className="relative isolate overflow-hidden">
              <div className="absolute inset-0 -z-10">
                  {/* Changed to hero_image to match DB */}
                  {experience.hero_image ? (
                      <img
                          src={experience.hero_image}
                          alt={experience.name}
                          className="h-full w-full object-cover"/>
                  ) : (
                      <div className="h-full w-full bg-muted"/>
                  )}
                  <div className="absolute inset-0 bg-[image:var(--gradient-hero-overlay)]"/>
              </div>
              <div className="container-wide flex min-h-[60vh] flex-col justify-end pb-16 pt-32 text-ivory">
                  <Link to="/experiences" className="mb-4 text-sm text-ivory/70 hover:text-ivory">
                      ← All experiences
                  </Link>
                  {/* Changed title -> name */}
                  <h1 className="max-w-3xl text-balance text-4xl md:text-6xl">{experience.name}</h1>
                  <p className="mt-4 max-w-xl text-lg text-ivory/85">{experience.tagline}</p>
              </div>
          </section>
          <section className="container-wide grid gap-12 py-20 md:grid-cols-3">
              <div className="md:col-span-2 space-y-12">
                  <div>
                      <h2 className="mb-4 text-2xl md:text-3xl">About this experience</h2>
                      <p className="text-lg text-muted-foreground whitespace-pre-line">
                          {experience.description}
                      </p>
                  </div>

                  {/* Added || [] checks just in case DB returns null for these arrays */}
                  {(experience.audience || []).length > 0 && (
                      <div>
                          <h2 className="mb-5 text-2xl md:text-3xl">Who this is for</h2>
                          <ul className="grid gap-3 sm:grid-cols-2">
                              {experience.audience.map((a) => (
                                  <li
                                      key={a}
                                      className="flex items-start gap-3 rounded-xl bg-accent/60 px-4 py-3"
                                  >
                                      <Check className="mt-0.5 h-4 w-4 text-forest"/> {a}
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}

                  {(experience.included || []).length > 0 && (
                      <div>
                          <h2 className="mb-5 text-2xl md:text-3xl">What's included</h2>
                          <ul className="space-y-3">
                              {experience.included.map((item) => (
                                  <li key={item} className="flex items-start gap-3">
                                      <span
                                          className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                          <Check className="h-3.5 w-3.5"/>
                                      </span>
                                      <span className="text-lg">{item}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  )}

                  {(experience.addons || []).length > 0 && (
                      <div>
                          <h2 className="mb-5 text-2xl md:text-3xl">Optional add-ons</h2>
                          <div className="flex flex-wrap gap-2">
                              {experience.addons.map((a) => (
                                  <span
                                      key={a}
                                      className="rounded-full border border-border bg-card px-4 py-2 text-sm"
                                  >
                                      {a}
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}

                  {(experience.faqs || []).length > 0 && (
                      <div>
                          <h2 className="mb-5 text-2xl md:text-3xl">Frequently asked</h2>
                          <Accordion type="single" collapsible className="w-full">
                              {experience.faqs.map((f, i) => (
                                  <AccordionItem key={i} value={`f-${i}`}>
                                      <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
                                      <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                                  </AccordionItem>
                              ))}
                          </Accordion>
                      </div>
                  )}
              </div>

              <aside className="md:col-span-1">
                  <div
                      className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                      <p className="mb-2 text-xs uppercase tracking-widest text-forest">Next step</p>
                      <h3 className="mb-3 text-2xl">Ready when you are.</h3>

                      {/* Optional: Show pricing from the DB */}
                      {experience.starting_price && (
                          <p className="mb-4 text-lg font-serif">
                              Starting from <span
                              className="font-bold">KES {Number(experience.starting_price).toLocaleString()}</span>
                          </p>
                      )}

                      <p className="mb-6 text-sm text-muted-foreground">
                          Share a few details and we'll come back with a personalized plan within 24 hours.
                      </p>
                      <Button asChild variant="hero" size="lg" className="w-full">
                          <Link to="/plan-my-stay">
                              Plan My Stay <ArrowRight className="ml-2 h-4 w-4"/>
                          </Link>
                      </Button>
                  </div>
              </aside>
          </section>
          <CTABanner/></>

  );
}