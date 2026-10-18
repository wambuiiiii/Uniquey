import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Home as HomeIcon,
  Plane,
  MapPin,
  MessageCircle,
  Phone,
  Receipt,
  ShieldAlert,
  CalendarDays,
  FileText,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { SiteLayout } from "@/components/site-layout";
import axiosInstance from "@/api/axios";
import apartmentImg from "@/assets/experience-apartment.jpg";

export const Route = createFileRoute("/(protected)/(customer)/portal")({
  head: () => ({
    meta: [
      { title: "My Trip · UNIQUEY Concierge" },
      {
        name: "description",
        content:
          "Track your Kenya trip: itinerary, accommodation, transfers, invoices and concierge messages — all in one place.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PortalDashboard,
});

interface PortalData {
  first_name: string;
  email: string;
  has_active_trip: boolean;
  days_until_arrival?: number | null;
  package_name?: string | null;
  arrival_date?: string | null;
  duration_nights?: number | null;
  timeline?: Array<{ label: string; done: boolean; meta: string }>;
  accommodation?: {
    title: string;
    location: string;
    image_url?: string;
    amenities: string[];
  } | null;
  invoice?: {
      id: string;
    invoice_number: string;
    currency: string;
    package_total: number | string;
    accommodation_total: number | string;
    additional_fees: number | string;
    grand_total: number | string;
    deposit_required: number | string;
    balance_due: number | string;
    status: string;
    deposit_paid: boolean;
    due_date?: string | null;
  } | null;
}

const emergency = [
  { label: "UNIQUEY 24/7 Concierge", phone: "+254 711 111 111", tint: "text-primary" },
  { label: "Police (Kenya)", phone: "999 / 112", tint: "text-forest" },
  { label: "Aga Khan Hospital", phone: "+254 20 366 2000", tint: "text-forest" },
  { label: "Your Embassy", phone: "Add contact", tint: "text-muted-foreground" },
];

function PortalDashboard() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const response = await axiosInstance.get("customer/portal/");
        setData(response.data);
      } catch (err: any) {
        setError("Failed to load your trip portal. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (error || !data) {
    return (
      <SiteLayout>
        <div className="container-wide py-16 text-center">
          <p className="text-destructive">{error || "Something went wrong."}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </SiteLayout>
    );
  }

  // Handle case where user logged in but has no active trip/inquiry
  if (!data.has_active_trip) {
    return (
      <SiteLayout>
        <section className="bg-[color:var(--ivory)] py-16">
          <div className="container-wide max-w-2xl text-center">
            <Card className="p-8">
              <h1 className="font-serif text-3xl text-foreground">
                Welcome, {data.first_name} 👋
              </h1>
              <p className="mt-2 text-muted-foreground">
                You don't have an active trip booking yet. Explore our curated experiences to start planning your stay in Kenya.
              </p>
              <Button variant="hero" className="mt-6" asChild>
                <Link to="/experiences">Explore Experiences</Link>
              </Button>
            </Card>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const { invoice } = data;
  const currencySymbol = invoice?.currency || "USD";

  // Compute values safely
  const packageVal = Number(invoice?.package_total || 0);
  const accommodationVal = Number(invoice?.accommodation_total || 0);
  const addFeesVal = Number(invoice?.additional_fees || 0);
  const grandTotalVal = Number(invoice?.grand_total || 0);
  const depositVal = Number(invoice?.deposit_required || 0);
  const balanceVal = Number(invoice?.balance_due || 0);

  // Timeline progress count
  const completedTimelineCount = data.timeline?.filter((t) => t.done).length || 0;
  const totalTimelineCount = data.timeline?.length || 1;
  const progressPercent = Math.round((completedTimelineCount / totalTimelineCount) * 100);

  return (
    <SiteLayout>
      <section className="bg-[color:var(--ivory)]">
        <div className="container-wide py-10 lg:py-14">
          {/* Greeting */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">My Trip</p>
              <h1 className="mt-1 font-serif text-4xl text-foreground">
                Welcome back, {data.first_name} <span className="ml-1">👋</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.days_until_arrival !== null && data.days_until_arrival !== undefined ? (
                  <>
                    Arriving Nairobi in{" "}
                    <span className="font-medium text-forest">{data.days_until_arrival} days</span>
                  </>
                ) : (
                  "Trip planning in progress"
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href="https://wa.me/254746148654" target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp concierge
                </a>
              </Button>
             {balanceVal > 0 && (
                <Button variant="hero" onClick={() => window.location.href = `/pay/${invoice?.id}`}>
                    <Receipt className="mr-1.5 h-4 w-4" /> Pay balance

                </Button>
              )}
            </div>
          </div>

          {/* Trip status timeline */}
          {data.timeline && data.timeline.length > 0 && (
            <Card className="mt-8 overflow-hidden border-border/60">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-card">
                <div>
                  <CardTitle className="font-serif">Trip status</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {completedTimelineCount} of {totalTimelineCount} steps complete
                  </p>
                </div>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                  {progressPercent === 100 ? "Ready for Arrival" : "On track"}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <Progress value={progressPercent} className="h-1.5" />
                <div className="mt-6 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {data.timeline.map((s) => (
                    <div key={s.label} className="flex flex-col gap-2">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                          s.done
                            ? "border-forest bg-forest text-forest-foreground"
                            : "border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.meta}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Package Details */}
              <Card>
                <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Your package
                    </p>
                    <p className="mt-1 font-serif text-2xl text-foreground">
                      {data.package_name || "Custom Experience"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Arrival
                    </p>
                    <p className="mt-1 flex items-center gap-2 font-serif text-2xl text-foreground">
                      <CalendarDays className="h-5 w-5 text-primary" />{" "}
                      {data.arrival_date || "To be confirmed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Duration
                    </p>
                    <p className="mt-1 font-serif text-2xl text-foreground">
                      {data.duration_nights ? `${data.duration_nights} nights` : "Flexible"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Accommodation */}
              {data.accommodation && (
                <Card className="overflow-hidden">
                  <div className="grid gap-0 md:grid-cols-[240px_1fr]">
                    <img
                      src={data.accommodation.image_url || apartmentImg}
                      alt={data.accommodation.title}
                      className="h-56 w-full object-cover md:h-full"
                    />
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-widest text-primary">
                        Accommodation Details
                      </p>
                      <h3 className="mt-1 font-serif text-2xl text-foreground">
                        {data.accommodation.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {data.accommodation.location}
                      </p>
                      <ul className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                        {data.accommodation.amenities.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="hero">
                          Confirm choice
                        </Button>
                        <Button size="sm" variant="ghost">
                          Ask for alternatives
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Dynamic Invoice */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-serif">Invoice Overview</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {invoice ? "Generated by UNIQUEY Operations" : "Pending quote confirmation"}
                    </p>
                  </div>
                  {invoice && (
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-1.5 h-4 w-4" /> Download PDF
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {!invoice ? (
                    <p className="text-sm text-muted-foreground">
                      Your concierge is preparing your personalized quote. Details will appear here shortly.
                    </p>
                  ) : (
                    <>
                      {/* Conditionally render line items ONLY if > 0 */}
                      {packageVal > 0 && (
                        <Row
                          label={`${data.package_name || "Experience Package"}`}
                          value={`${currencySymbol} ${packageVal.toLocaleString()}`}
                        />
                      )}
                      {accommodationVal > 0 && (
                        <Row
                          label="Confirmed Accommodation"
                          value={`${currencySymbol} ${accommodationVal.toLocaleString()}`}
                        />
                      )}
                      {addFeesVal > 0 && (
                        <Row
                          label="Transfers & Service Add-ons"
                          value={`${currencySymbol} ${addFeesVal.toLocaleString()}`}
                        />
                      )}

                      <Separator />

                      <Row
                        label="Total Amount"
                        value={`${currencySymbol} ${grandTotalVal.toLocaleString()}`}
                        strong
                      />

                      <Row
                        label={
                          <span className="flex items-center gap-2">
                            Required Deposit
                            <Badge
                              className={
                                invoice.deposit_paid
                                  ? "border-forest/40 bg-forest/10 text-forest"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-600"
                              }
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              {invoice.deposit_paid ? "Paid" : "Awaiting Payment"}
                            </Badge>
                          </span>
                        }
                        value={`${currencySymbol} ${depositVal.toLocaleString()}`}
                      />

                      <Row
                        label="Remaining Balance"
                        value={`${currencySymbol} ${balanceVal.toLocaleString()}`}
                        strong
                      />

{balanceVal > 0 && (
                        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4 mt-4">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Pay balance to lock your booking
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Card, M-Pesa or bank transfer · secured checkout
                            </p>
                          </div>
                          <Button variant="hero" onClick={() => window.location.href = `/pay/${invoice.id}`}>
                              Pay {currencySymbol} {balanceVal.toLocaleString()}
                            </Button>

                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">


              {/* Emergency */}
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" /> Emergency contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {emergency.map((e) => (
                    <div
                      key={e.label}
                      className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{e.label}</p>
                        <p className={`text-xs ${e.tint}`}>{e.phone}</p>
                      </div>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Request Add-ons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { icon: Plane, label: "Extra airport transfer" },
                    { icon: HomeIcon, label: "Private chef for a night" },
                    { icon: MapPin, label: "Guided Nairobi day tour" },
                  ].map((a) => (
                    <button
                      key={a.label}
                      className="flex w-full items-center justify-between rounded-lg border border-border/60 p-3 text-left hover:bg-accent"
                    >
                      <span className="flex items-center gap-2">
                        <a.icon className="h-4 w-4 text-primary" /> {a.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: React.ReactNode;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        strong ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      <span className="text-sm">{label}</span>
      <span className={`text-sm ${strong ? "font-serif text-lg text-foreground" : ""}`}>
        {value}
      </span>
    </div>
  );
}