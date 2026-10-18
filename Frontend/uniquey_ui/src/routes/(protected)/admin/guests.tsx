import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(protected)/admin/guests")({
  component: GuestsPage,
});

// Matches your Django CustomerSerializer
type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  nationality: string;
  account_status_display: string;
  trip_count: number;
  is_vip: boolean;
};

// Map CRM statuses to badge styles
const badgeStyles: Record<string, string> = {
  Active: "bg-primary/15 text-primary border-primary/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Banned: "bg-destructive/15 text-destructive border-destructive/30",
  VIP: "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground border-transparent",
};

function GuestsPage() {
  const [guests, setGuests] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        // Fetches from your Django Customer endpoint
        const response = await axiosInstance.get("customers/");
        const data = response.data.results || response.data;
        setGuests(data);
      } catch (error) {
        console.error("Failed to fetch guests", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuests();
  }, []);

  // Real-time Search Logic
  const filteredGuests = guests.filter((g) => {
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    const fullName = `${g.first_name} ${g.last_name}`.toLowerCase();

    return (
      fullName.includes(term) ||
      (g.email && g.email.toLowerCase().includes(term)) ||
      (g.nationality && g.nationality.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">People</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">Guests</h1>
          <p className="text-sm text-muted-foreground">Everyone we've hosted, past and upcoming.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or nationality"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>Loading guest directory...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="py-24 text-center text-muted-foreground border rounded-lg border-dashed">
          No guests found matching your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuests.map((g) => {
            // Determine the status badge to show. VIP overrides normal status.
            const displayStatus = g.is_vip ? "VIP" : (g.account_status_display || "Active");
            const initials = `${g.first_name?.charAt(0) || ""}${g.last_name?.charAt(0) || ""}`.toUpperCase();

            return (
              <Card key={g.id} className="border-border/60">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-forest text-forest-foreground font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {g.first_name} {g.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {g.nationality || "Nationality unknown"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="outline" className={badgeStyles[displayStatus] || badgeStyles.Active}>
                          {displayStatus}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {g.trip_count} trip{g.trip_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Centralized Profile Button mapping to the guest's ID */}
                  <div className="mt-5 pt-4 border-t border-border/40">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/admin/guests/${g.id}`}>
                        View Full Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}