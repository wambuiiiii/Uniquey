import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Users,
  Plane,
  Building2,
  CalendarDays,
  Receipt,
  Settings,
  LifeBuoy,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const primary: NavItem[] = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Inquiries", url: "/admin/inquiries", icon: Inbox },
  { title: "Guests", url: "/admin/guests", icon: Users },
  { title: "Experiences", url: "/admin/experiences", icon: Sparkles },
  { title: "Transfers", url: "/admin/transfers", icon: Plane },
  { title: "Apartments", url: "/admin/apartments", icon: Building2 },
  { title: "Calendar", url: "/admin/calendar", icon: CalendarDays },
  { title: "Invoices", url: "/admin/invoices", icon: Receipt },
];

const secondary = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
  { title: "Support", url: "/admin/support", icon: LifeBuoy },
] as const;

export function AdminSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/admin" className="flex items-center gap-2 px-2 py-1.5 font-serif text-lg">
          <span className="text-forest">UNI</span>
          <span className="text-primary">QUEY</span>
          <span className="ml-1 rounded-full border border-primary/50 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-primary">
            Admin
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Concierge</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url, item.exact)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin-auth/login" className="flex items-center gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
