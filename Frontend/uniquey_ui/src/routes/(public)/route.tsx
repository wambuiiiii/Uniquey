import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/(public)")({
  component: PublicLayoutWrapper,
});

function PublicLayoutWrapper() {
  return (
    <SiteLayout>
      {/*
        The Outlet is the critical piece!
        When a user visits /plan-my-stay, that specific form is injected right here.
      */}
      <Outlet />
    </SiteLayout>
  );
}