import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// 1. Import Auth Context
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/(protected)/admin")({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.role !== "admin") {
      throw redirect({ to: "/portal" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  // 2. Fetch the user from context
  const { user } = useAuth();

  const isAuthRoute = pathname === "/admin/login" || pathname === "/admin/signup";

  if (isAuthRoute) return <Outlet />;

  // 3. Create dynamic name and initials
  const firstName = user?.first_name || "Admin";
  const lastName = user?.last_name || "User";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${firstName} ${lastName.charAt(0)}.`;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="relative hidden flex-1 max-w-md md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search inquiries, guests, transfers…" className="pl-9 bg-muted/40 border-transparent focus-visible:bg-background" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background pl-1 pr-3 py-1">
                <Avatar className="h-7 w-7">
                  {/* Replaced 'AK' with dynamic initials */}
                  <AvatarFallback className="bg-forest text-forest-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight sm:block">
                  {/* Replaced 'Amina K.' with dynamic name */}
                  <p className="text-xs font-medium text-foreground">{fullName}</p>
                  <p className="text-[10px] text-muted-foreground">System Admin</p>
                </div>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}