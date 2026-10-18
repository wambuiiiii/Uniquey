import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";

export const Route = createFileRoute("/(protected)/admin/transfers")({
  component: () => (
    <ComingSoon
      eyebrow="Operations"
      title="Airport transfers"
      description="Every pickup and drop-off, matched to a vetted driver."
    />
  ),
});
