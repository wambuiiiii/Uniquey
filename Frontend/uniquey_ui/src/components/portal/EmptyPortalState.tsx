import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyPortalState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-accent/30 px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
        <Compass className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </div>

      <h2 className="font-serif text-2xl text-foreground md:text-3xl">
        Your journey begins here
      </h2>

      <p className="mt-3 max-w-md text-sm text-muted-foreground md:text-base">
        You don't have any upcoming trips scheduled yet. Let us craft an unforgettable, bespoke experience tailored perfectly to you.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button asChild variant="hero" size="lg">
          <Link to="/plan-my-stay">Plan My Stay</Link>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link to="/experiences">Explore Experiences</Link>
        </Button>
      </div>
    </div>
  );
}