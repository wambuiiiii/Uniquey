import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";

export const Route = createFileRoute("/(protected)/admin/support")({
  component: () => (
    <ComingSoon
      eyebrow="Help"
      title="Support"
      description="Playbooks, escalations, and internal knowledge base."
    />
  ),
});
