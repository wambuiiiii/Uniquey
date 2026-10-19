import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(protected)")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) return;
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: location.pathname.startsWith("/admin") ? "/admin-auth/login" : "/login",
      });
    }
  },
  component: () => <Outlet />,
});