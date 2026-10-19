// src/routes/(protected)/admin/route.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)/admin")({
  component: () => <Outlet />,
});