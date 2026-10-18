import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CTABanner({
  headline = "Ready to plan your stay?",
  sub = "Tell us about your trip and a concierge specialist will contact you within 24 hours.",
}: {
  headline?: string;
  sub?: string;
}) {
  return (
    <section className="container-wide py-20">
      <div className="relative overflow-hidden rounded-3xl bg-[image:var(--gradient-gold)] px-8 py-16 text-center shadow-[var(--shadow-gold)] md:px-16 md:py-20">
        <h2 className="text-balance text-3xl text-gold-foreground md:text-5xl">
          {headline}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-balance text-gold-foreground/85 md:text-lg">
          {sub}
        </p>
        <Button asChild variant="forest" size="xl" className="mt-8">
          <Link to="/plan-my-stay">Plan My Stay</Link>
        </Button>
      </div>
    </section>
  );
}
