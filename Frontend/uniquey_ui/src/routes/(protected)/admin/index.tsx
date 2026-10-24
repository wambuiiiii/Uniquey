import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import { ArrowUpRight, Inbox, Plane, Users, Wallet, Clock, CheckCircle2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(protected)/admin/")({
  component: AdminOverview,
});

const statusStyles: Record<string, string> = {
  NEW: "bg-primary/15 text-primary border-primary/30",
  CONTACTED: "bg-accent text-accent-foreground border-border",
  QUOTE_SENT: "bg-forest/10 text-forest border-forest/30",
  DEPOSIT_RECEIVED: "bg-forest text-forest-foreground border-forest",
};

function AdminOverview() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get("inquiries/");
        const data = response.data.results || response.data;
        setInquiries(data);
      } catch (error) {
        console.error("Failed to fetch inquiries", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const currentHour = new Date().getHours();
  let timeOfDay = "evening";
  if (currentHour < 12) timeOfDay = "morning";
  else if (currentHour < 17) timeOfDay = "afternoon";

  const totalInquiries = inquiries.length;
  const newToday = inquiries.filter(inq => isToday(new Date(inq.created_at))).length;

  const firstName = user?.first_name || "Admin";

  const dynamicKpis = [
    { label: "New inquiries", value: totalInquiries.toString(), delta: `+${newToday} today`, icon: Inbox, tone: "text-primary" },
    { label: "Active guests", value: "0", delta: "0 in-country", icon: Users, tone: "text-forest" },
    { label: "Airport transfers", value: "0", delta: "0 next 24h", icon: Plane, tone: "text-primary" },
    { label: "Revenue (mo)", value: "KES 0", delta: "+0% vs last", icon: Wallet, tone: "text-forest" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Overview</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">
            Good {timeOfDay}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what's happening across concierge operations today.
          </p>
        </div>
        <Button variant="hero">
          New Inquiry
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicKpis.map((k) => (
          <Card key={k.label} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <p className="mt-2 font-serif text-3xl text-foreground">{k.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif">Recent inquiries</CardTitle>
              <p className="text-xs text-muted-foreground">Latest guest requests across all experiences</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Arrival</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading real-time data...
                    </TableCell>
                  </TableRow>
                ) : inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No inquiries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.slice(0, 5).map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {inq.id.split('-')[0].substring(0,8).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">{inq.first_name} {inq.last_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{inq.purpose_display}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[inq.status] || "bg-muted text-foreground"}>
                          {inq.status_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(inq.arrival_date), "MMM d")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Today's operations</CardTitle>
            <p className="text-xs text-muted-foreground">Next 24 hours</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: Plane, tint: "text-primary", title: "KQ102 · JKIA pickup", meta: "14:20 · Driver: Peter M." },
              { icon: CheckCircle2, tint: "text-forest", title: "Apartment check-in · Westlands 3B", meta: "16:00 · Guest: D. Chen" },
              { icon: Clock, tint: "text-primary", title: "Concierge call · A. Yusuf", meta: "18:30 · Medical brief" },
              { icon: AlertCircle, tint: "text-destructive", title: "Invoice pending · INQ-1035", meta: "Follow up today" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg border border-border bg-muted/50 p-2">
                  <item.icon className={`h-4 w-4 ${item.tint}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.meta}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}