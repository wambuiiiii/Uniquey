import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Plane,
  Home as HomeIcon,
  UserCheck,
  ShieldCheck,
  LifeBuoy,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTABanner } from "@/components/cta-banner";
import { testimonials } from "@/lib/testimonials";
import { blogPosts } from "@/lib/blog";
import heroImg from "@/assets/hero-concierge.jpg";
import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(public)/")({
  // 1. Fetch live active packages from Django before the home page renders
  loader: async () => {
    try {
      const response = await axiosInstance.get("packages/");
      const data = response.data.results || response.data;
      return data.filter((pkg: any) => pkg.active);
    } catch (error) {
      console.error("Failed to load packages", error);
      return [];
    }
  },
  component: Home,
});

const whyCards = [
  { icon: Plane, title: "Airport Arrival", body: "A named greeter meets you at JKIA the moment you land." },
  { icon: HomeIcon, title: "Accommodation Matching", body: "Personally verified apartments matched to your needs." },
  { icon: UserCheck, title: "Local Concierge", body: "One trusted person on WhatsApp for your whole trip." },
  { icon: ShieldCheck, title: "Verified Partners", body: "Every driver, apartment and vendor is personally vetted." },
  { icon: LifeBuoy, title: "Emergency Support", body: "24/7 local team ready if anything goes sideways." },
];

const trustPoints = [
  "Personally verified accommodation partners",
  "Local concierge team in Nairobi",
  "Airport assistance with named greeters",
  "Personalized planning for every trip",
  "Dedicated support before, during and after",
];

function Home() {
  const navigate = useNavigate();
  // 2. Get the dynamic packages from the loader
  const packages = Route.useLoaderData();

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt="A UNIQUEY concierge greeting a traveler at JKIA airport"
            className="h-full w-full object-cover"
            width={1600}
            height={1100}
          />
          <div className="absolute inset-0 bg-[image:var(--gradient-hero-overlay)]" />
        </div>

        <div className="container-wide flex min-h-[88vh] flex-col justify-end pb-20 pt-40 text-ivory">
          <div className="max-w-3xl">
            <span className="mb-6 inline-block rounded-full border border-ivory/30 bg-ivory/10 px-4 py-1.5 text-xs uppercase tracking-widest text-ivory/90 backdrop-blur">
              Kenya's personal travel concierge
            </span>
            <h1 className="text-balance text-4xl leading-[1.05] text-ivory md:text-6xl lg:text-7xl">
              Land in Kenya knowing someone local is already taking care of everything.
            </h1>
            <p className="mt-6 max-w-xl text-balance text-lg text-ivory/85">
              Airport pickup. Verified accommodation. Personalized concierge support.
              Local expertise. One trusted team.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate({ to: "/plan-my-stay" })}
              >
                Plan My Stay <ArrowRight />
              </Button>

              <Button
                variant="outline"
                size="xl"
                className="border-ivory/40 text-ivory hover:bg-ivory hover:text-forest"
                onClick={() => navigate({ to: "/experiences" })}
              >
                Explore Experiences
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container-wide py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-forest">Why UNIQUEY</p>
          <h2 className="text-balance text-3xl md:text-5xl">
            You don't have to figure Kenya out alone.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {whyCards.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent text-forest">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[color:var(--sand)]/40 py-24">
        <div className="container-wide">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">
                Guest Experiences
              </p>
              <h2 className="text-balance text-3xl md:text-5xl">
                A stay shaped around your reason for coming.
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/experiences">See all experiences</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 3. Render the dynamic packages array here instead of the hardcoded one! */}
            {packages.slice(0, 6).map((e: any) => (
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
                  <h3 className="mb-2 text-xl">{e.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{e.tagline || e.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-forest group-hover:text-primary">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-wide py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-forest">How It Works</p>
          <h2 className="text-balance text-3xl md:text-5xl">Seven quiet steps to a great trip.</h2>
        </div>
        <ol className="mx-auto grid max-w-3xl gap-4">
          {[
            "Tell us about your trip.",
            "Our concierge contacts you.",
            "We recommend trusted accommodation.",
            "Approve your itinerary.",
            "Receive your invoice.",
            "Pay your deposit.",
            "Travel with confidence.",
          ].map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-gold)] font-serif text-lg text-gold-foreground">
                {i + 1}
              </span>
              <p className="pt-1.5 text-lg">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Trust */}
      <section className="bg-[color:var(--forest)] py-24 text-forest-foreground">
        <div className="container-wide grid gap-14 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm uppercase tracking-widest text-primary">Why visitors trust us</p>
            <h2 className="text-balance text-3xl md:text-5xl">
              A concierge team, not a booking website.
            </h2>
            <p className="mt-5 max-w-md text-forest-foreground/80">
              Every partner is personally vetted. Every trip is coordinated by a real person.
              And someone from our team stays reachable for the entire time you're in Kenya.
            </p>
          </div>
          <ul className="space-y-4">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-lg">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-wide py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-forest">Testimonials</p>
          <h2 className="text-balance text-3xl md:text-5xl">Guests, in their own words.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.slice(0, 4).map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]"
            >
              <div className="mb-3 flex gap-1 text-primary">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {t.name} <span className="ml-1">{t.flag}</span>
                </span>
                <span>{t.package}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Blog */}
      <section className="bg-[color:var(--sand)]/40 py-24">
        <div className="container-wide">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">
                Travel Tips Before You Arrive
              </p>
              <h2 className="text-balance text-3xl md:text-5xl">Get to know Kenya first.</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/blog">Read all articles</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
              >
                <p className="mb-3 text-xs uppercase tracking-widest text-forest">{post.category}</p>
                <h3 className="mb-3 text-xl leading-tight group-hover:text-forest">{post.title}</h3>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="mt-5 text-xs text-muted-foreground">{post.readTime} read</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTABanner />
    </>
  );
}