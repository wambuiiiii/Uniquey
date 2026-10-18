import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CTABanner } from "@/components/cta-banner";
import axiosInstance from "@/api/axios";
import heroImg from "@/assets/hero-concierge.jpg";

export const Route = createFileRoute("/(public)/experiences/")({
  // 1. Fetch live data from Django before the page renders
  loader: async () => {
    try {
      const response = await axiosInstance.get("packages/");
      const data = response.data.results || response.data;
      // Only return packages marked as 'active' (Live)
      return data.filter((pkg: any) => pkg.active);
    } catch (error) {
      console.error("Failed to load packages", error);
      return [];
    }
  },
  head: () => ({
    meta: [
      { title: "Guest Experiences · UNIQUEY Kenya Concierge" },
      { name: "description", content: "Curated Kenya travel experiences." },
    ],
  }),
  component: ExperiencesIndex,
});

function ExperiencesIndex() {
  // 2. Get the fetched data
  const packages = Route.useLoaderData();

  return (
    <>
      <section className="container-wide pt-24 pb-10">
        <p className="mb-3 text-sm uppercase tracking-widest text-forest">Guest Experiences</p>
        <h1 className="max-w-3xl text-balance text-4xl md:text-6xl">
          Every stay shaped around your reason for coming.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Choose the experience that fits — or share your story on the Plan My Stay form and we'll
          shape one for you.
        </p>
      </section>

      <section className="container-wide grid gap-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((e: any) => (
          <Link
            key={e.slug}
            to="/experiences/$slug"
            params={{ slug: e.slug }}
            className="group overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={e.hero_image || heroImg}
                alt={e.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h2 className="mb-2 text-xl">{e.name}</h2>
              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-forest group-hover:text-primary">
                Learn more <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </section>
      <CTABanner />
    </>
  );
}