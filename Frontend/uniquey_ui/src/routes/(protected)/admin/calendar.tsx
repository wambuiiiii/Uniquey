import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";

export const Route = createFileRoute("/(protected)/admin/calendar")({
  component: () => (
    <ComingSoon
      eyebrow="Planning"
      title="Calendar"
      description="Arrivals, check-ins, drivers and concierge shifts."
    />
  ),
});
