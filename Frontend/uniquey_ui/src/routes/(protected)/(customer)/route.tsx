import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/(protected)/(customer)")({
  component: CustomerLayout,
});

function CustomerLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}