import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import {
  Search, Loader2, Copy, CheckCircle2, MessageSquare,
  Users, BedDouble, Bath, MapPin, X,
  Home, Receipt, CreditCard, Clock
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(protected)/admin/inquiries")({
  component: InquiriesPage,
});

type SelectedAccommodation = {
  recommendation_id: string;
  property_id: string;
  property_name: string;
  area: string;
  bedrooms: number;
  nightly_price: number;
  duration_nights: number;
  calculated_stay_total: number;
  cover_image?: string | null;
};

type InvoiceSummary = {
  id: string;
  invoice_number: string;
  status: string;
  status_display: string;
  grand_total: number;
  deposit_required: number;
  deposit_paid: boolean;
};

type Inquiry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  nationality: string;
  arrival_date: string;
  departure_date: string;
  guests: number;
  purpose: string;
  purpose_display: string;
  budget_min: string;
  budget_max: string;
  preferred_location: string;
  special_requests: string;
  status: string;
  status_display: string;
  selected_accommodation?: SelectedAccommodation | null;
  invoice_summary?: InvoiceSummary | null;
};

type Property = {
  id: string;
  property_name: string;
  area: string;
  nightly_price: string;
  bedrooms: number;
  bathrooms: number;
  capacity: number;
  airport_minutes: number;
  hospital_distance: number;
  supermarket_distance: number;
  wifi: boolean;
  parking: boolean;
  female_friendly: boolean;
  family_friendly: boolean;
  safety_score: number;
  verification_status: boolean;
  images?: { image: string; is_cover: boolean }[];
  active_bookings?: { check_in: string; check_out: string }[];
};

const statusStyles: Record<string, string> = {
  NEW: "bg-primary/15 text-primary border-primary/30",
  CONTACTED: "bg-accent text-accent-foreground border-border",
  QUOTE_SENT: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  OPTION_SELECTED: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  INVOICE_SENT: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  DEPOSIT_RECEIVED: "bg-forest/15 text-forest border-forest/30",
  COMPLETED: "bg-muted text-muted-foreground border-border",
};

const safeNumber = (val: any) => Number(String(val).replace(/[^0-9.]/g, ""));

const formatWhatsAppNumber = (phone: string) => {
  const hasPlus = phone.trim().startsWith("+");
  let cleanPhone = phone.replace(/[^0-9]/g, "");

  if (hasPlus) {
    return cleanPhone;
  }

  if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
    cleanPhone = "254" + cleanPhone.substring(1);
  } else if (cleanPhone.length === 9 && !cleanPhone.startsWith("254")) {
    cleanPhone = "254" + cleanPhone;
  }
  return cleanPhone;
};

function checkAvailabilityExact(property: Property, start: string, end: string) {
  if (!start || !end || !property.active_bookings || property.active_bookings.length === 0) return true;
  const s = new Date(start);
  const e = new Date(end);
  for (const b of property.active_bookings) {
    const bs = new Date(b.check_in);
    const be = new Date(b.check_out);
    if (s < be && e > bs) return false;
  }
  return true;
}

function getDuration(start: string, end: string) {
  if (!start || !end) return 1;
  const days = differenceInDays(new Date(end), new Date(start));
  return days > 0 ? days : 1;
}

function InquiriesPage() {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [active, setActive] = useState<Inquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [proposalLink, setProposalLink] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [propSearch, setPropSearch] = useState("");
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<string>("");
  const [minBedsFilter, setMinBedsFilter] = useState<string>("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [previewProp, setPreviewProp] = useState<Property | null>(null);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  const fetchInquiries = async () => {
    try {
      const response = await axiosInstance.get("inquiries/");
      const data = response.data.results || response.data;
      setInquiries(data);
      if (active) {
        const updatedActive = data.find((i: Inquiry) => i.id === active.id);
        if (updatedActive) setActive(updatedActive);
      }
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await axiosInstance.patch(`inquiries/${inquiryId}/`, { status: newStatus });

      const statusMap: Record<string, string> = {
        NEW: "New", CONTACTED: "Contacted", QUOTE_SENT: "Proposal Sent",
        OPTION_SELECTED: "Property Selected", INVOICE_SENT: "Invoice Sent",
        DEPOSIT_RECEIVED: "Deposit Paid", COMPLETED: "Completed"
      };

      setActive(prev => prev ? { ...prev, status: newStatus, status_display: statusMap[newStatus] } : null);
      setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus, status_display: statusMap[newStatus] } : inq));

    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const handleOpenProposal = async () => {
    setIsProposalOpen(true);
    setProposalLink(null);
    setSelectedProps([]);
    setPropSearch("");
    setMaxBudgetFilter(active?.budget_max ? String(safeNumber(active?.budget_max)) : "");
    setMinBedsFilter("");
    setFilterStart(active?.arrival_date || "");
    setFilterEnd(active?.departure_date || "");

    try {
      const propRes = await axiosInstance.get("properties/");
      setProperties(propRes.data.results || propRes.data);
    } catch (err) {
      console.error("Failed to fetch properties", err);
    }
  };

  const handleGenerateProposal = async () => {
    if (selectedProps.length === 0 || !active) return;
    setIsGenerating(true);
    try {
      await Promise.all(
        selectedProps.map((propertyId) =>
          axiosInstance.post("recommendations/", {
            inquiry: active.id,
            accommodation: propertyId,
            recommendation_reason: "Handpicked to match your requirements.",
            sent: true
          })
        )
      );

      const link = `${window.location.origin}/proposals/${active.id}`;
      setProposalLink(link);

      await axiosInstance.patch(`inquiries/${active.id}/`, { status: "QUOTE_SENT" });

      setActive(prev => prev ? { ...prev, status: "QUOTE_SENT", status_display: "Proposal Sent" } : null);
      setInquiries(prev => prev.map(inq => inq.id === active.id ? { ...inq, status: "QUOTE_SENT", status_display: "Proposal Sent" } : inq));

    } catch (err) {
      alert("Error generating proposal");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkDepositPaid = async (inquiry: Inquiry) => {
    try {
      if (inquiry.invoice_summary?.id) {
        await axiosInstance.patch(`invoices/${inquiry.invoice_summary.id}/`, { status: "DEPOSIT_PAID" });
      } else {
        await axiosInstance.patch(`inquiries/${inquiry.id}/`, { status: "DEPOSIT_RECEIVED" });
      }

      setActive(prev => prev ? { ...prev, status: "DEPOSIT_RECEIVED", status_display: "Deposit Paid" } : null);
      setInquiries(prev => prev.map(inq => inq.id === inquiry.id ? { ...inq, status: "DEPOSIT_RECEIVED", status_display: "Deposit Paid" } : inq));
    } catch (err) {
      alert("Failed to update deposit status.");
    }
  };

  const handleCopyMessage = () => {
    if (!active || !proposalLink) return;
    const msg = `Hello ${active.first_name},\n\nHere are our recommendations for your stay in Kenya. You can review the details, photos, and select your preferred apartment here:\n\n${proposalLink}\n\nLet me know if you have any questions!\nUNIQUEY Concierge`;
    navigator.clipboard.writeText(msg);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!active || !proposalLink) return;
    const cleanPhone = formatWhatsAppNumber(active.phone || "");
    const msg = encodeURIComponent(`Hello ${active.first_name},\n\nHere are our recommendations for your stay in Kenya. You can review the details, photos, and select your preferred apartment here:\n\n${proposalLink}\n\nLet me know if you have any questions!\nUNIQUEY Concierge`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${msg}`, "_blank");
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (activeTab !== "all" && inq.status.toLowerCase() !== activeTab) return false;
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const fullName = `${inq.first_name} ${inq.last_name}`.toLowerCase();
      const ref = inq.id.split("-")[0].toLowerCase();
      if (!fullName.includes(term) && !inq.email.toLowerCase().includes(term) && !ref.includes(term)) return false;
    }
    return true;
  });

  const filteredProps = properties.filter((p) => {
    const matchesSearch = p.property_name.toLowerCase().includes(propSearch.toLowerCase());
    const bMax = parseFloat(maxBudgetFilter);
    const matchesBudget = !isNaN(bMax) && bMax > 0 ? parseFloat(p.nightly_price) <= bMax : true;
    const bedsMin = parseInt(minBedsFilter);
    const matchesBeds = !isNaN(bedsMin) && bedsMin > 0 ? p.bedrooms >= bedsMin : true;
    const matchesDates = checkAvailabilityExact(p, filterStart, filterEnd);
    return matchesSearch && matchesBudget && matchesBeds && matchesDates;
  });

  return (
    <div className="space-y-6 relative p-4 sm:p-6 lg:p-8">
      {zoomedImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomedImg(null)}>
          <button className="absolute top-6 right-6 text-white bg-black/50 p-2 rounded-full hover:bg-black/80"><X className="h-6 w-6" /></button>
          <img src={zoomedImg} alt="Zoomed" className="max-w-full max-h-[90vh] object-contain rounded-md" />
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Concierge</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">Inquiries & Pipeline</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="quote_sent">Proposal Sent</TabsTrigger>
            <TabsTrigger value="option_selected">Property Selected</TabsTrigger>
            <TabsTrigger value="invoice_sent">Invoice Sent</TabsTrigger>
            <TabsTrigger value="deposit_received">Deposit Paid</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:max-w-xs mt-2 sm:mt-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search guests..." className="pl-9 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Selected Stay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Arrival</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /></TableCell></TableRow>
              ) : filteredInquiries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12">No inquiries found.</TableCell></TableRow>
              ) : (
                filteredInquiries.map((r) => (
                  <TableRow key={r.id} onClick={() => setActive(r)} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.id.split("-")[0].toUpperCase()}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.first_name} {r.last_name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.selected_accommodation ? (
                        <span className="font-medium text-foreground flex items-center gap-1.5"><Home className="h-3.5 w-3.5 text-primary" /> {r.selected_accommodation.property_name}</span>
                      ) : <span className="text-xs text-muted-foreground">Awaiting choice</span>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className={statusStyles[r.status] || "bg-muted"}>{r.status_display || r.status}</Badge></TableCell>
                    <TableCell>
                      {r.invoice_summary?.deposit_paid || r.status === "DEPOSIT_RECEIVED" || r.status === "COMPLETED" ? (
                        <Badge className="bg-forest/15 text-forest border-forest/30"><CheckCircle2 className="mr-1 h-3 w-3" /> Paid</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{r.arrival_date ? format(new Date(r.arrival_date), "MMM d") : "TBD"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="flex h-dvh w-full max-w-full flex-col overflow-y-auto border-l p-4 sm:max-w-lg sm:p-6">
          {active && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-muted-foreground">REF: {active.id.split("-")[0].toUpperCase()}</p>

                  <Select value={active.status} onValueChange={(val) => handleStatusChange(active.id, val)}>
                    <SelectTrigger className={`w-fit h-7 text-xs px-3 border ${statusStyles[active.status] || "bg-muted"}`}>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONTACTED">Contacted</SelectItem>
                      <SelectItem value="QUOTE_SENT">Proposal Sent</SelectItem>
                      <SelectItem value="OPTION_SELECTED">Property Selected</SelectItem>
                      <SelectItem value="INVOICE_SENT">Invoice Sent</SelectItem>
                      <SelectItem value="DEPOSIT_RECEIVED">Deposit Paid</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <SheetTitle className="font-serif text-2xl pt-2">{active.first_name} {active.last_name}</SheetTitle>
                <div className="flex flex-col text-sm text-muted-foreground mt-1">
                  <span>{active.email}</span>
                  {active.phone && <span>{active.phone}</span>}
                </div>
              </SheetHeader>

              <div className="mt-6 min-w-0 space-y-6 text-sm">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-primary border-b pb-1">Client Accommodation Selection</h3>
                  {active.selected_accommodation ? (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge className="bg-primary text-white mb-1.5">Selected by Guest</Badge>
                          <h4 className="font-serif text-lg text-foreground">{active.selected_accommodation.property_name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {active.selected_accommodation.area} · {active.selected_accommodation.bedrooms} Beds</p>
                        </div>
                        {active.selected_accommodation.cover_image && (
                          <img src={active.selected_accommodation.cover_image} alt="Property" className="h-16 w-24 object-cover rounded border" />
                        )}
                      </div>
                      <div className="border-t border-primary/20 pt-2 flex justify-between items-center text-xs">
                        <span className="font-semibold text-foreground text-sm">Stay Total: KES {active.selected_accommodation.calculated_stay_total.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Guest has not selected an apartment from the proposal link yet.</div>}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-primary border-b pb-1">Invoice & Deposit Tracking</h3>
                  <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
                    {active.invoice_summary ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold">{active.invoice_summary.invoice_number}</span>
                          <Badge variant="outline" className={active.invoice_summary.deposit_paid ? "bg-forest/15 text-forest border-forest/30" : ""}>
                            {active.invoice_summary.deposit_paid ? "Deposit Paid" : active.invoice_summary.status_display}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div>
                            <p className="text-muted-foreground">Grand Total</p>
                            <p className="font-semibold text-foreground">KES {active.invoice_summary.grand_total.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">30% Deposit Required</p>
                            <p className="font-semibold text-primary">KES {active.invoice_summary.deposit_required.toLocaleString()}</p>
                          </div>
                        </div>
                      </>
                    ) : <p className="text-xs text-muted-foreground">No invoice generated for this inquiry yet.</p>}

                    {active.status !== "DEPOSIT_RECEIVED" && active.status !== "COMPLETED" && (
                      <Button size="sm" variant="outline" className="w-full text-xs border-forest/40 text-forest hover:bg-forest/10" onClick={() => handleMarkDepositPaid(active)}>
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Mark Deposit as Paid
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-primary border-b pb-1">Original Trip Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Experience" value={active.purpose_display} />
                    <Field label="Dates" value={active.arrival_date && active.departure_date ? `${format(new Date(active.arrival_date), "MMM d")} - ${format(new Date(active.departure_date), "MMM d, yyyy")} (${getDuration(active.arrival_date, active.departure_date)} nights)` : "TBD"} />
                    <Field label="Party Size" value={`${active.guests} Guests`} />
                    <Field label="Nationality" value={active.nationality} />
                    <Field label="Budget Range" value={active.budget_min && active.budget_max ? `KES ${safeNumber(active.budget_min).toLocaleString()} - ${safeNumber(active.budget_max).toLocaleString()}` : "Not specified"} />
                    <Field label="Area Preference" value={active.preferred_location || "Flexible"} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Special Requests</p>
                    <p className="text-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">{active.special_requests || "No special requests provided."}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  {active.selected_accommodation && (
                    <Button variant="hero" className="h-auto min-h-10 w-full whitespace-normal px-3 py-2 text-center" onClick={() => {
                        navigate({
                          to: "/admin/invoices",
                          search: {
                            auto_fill: true, email: active.email,
                            guest_name: `${active.first_name} ${active.last_name}`,
                            inquiry_id: active.id,
                            accommodation_total: String(active.selected_accommodation!.calculated_stay_total),
                            property_name: active.selected_accommodation!.property_name,
                          } as any,
                        });
                      }}>
                      <Receipt className="mr-2 h-4 w-4" /> Review & Prepare Invoice Draft
                    </Button>
                  )}
                  <Button variant={active.selected_accommodation ? "outline" : "hero"} className="h-auto min-h-10 w-full whitespace-normal px-3 py-2 text-center" onClick={handleOpenProposal}>
                    {active.selected_accommodation ? "Send New Proposal Link" : "Create Proposal Link"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isProposalOpen} onOpenChange={setIsProposalOpen}>
        <DialogContent className="flex h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] max-w-5xl flex-col overflow-hidden p-0 sm:h-auto sm:max-h-[90vh]">
          <div className="p-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Curate Proposal</DialogTitle>
              <DialogDescription>Filter properties by dates and budget, click a property to view photos, and select options to send to the client.</DialogDescription>
            </DialogHeader>

            {!proposalLink && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                <div className="relative col-span-2 md:col-span-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Property name..." className="pl-9" value={propSearch} onChange={(e) => setPropSearch(e.target.value)} />
                </div>
                <div><Input type="text" placeholder="Max Budget (KES)" value={maxBudgetFilter} onChange={(e) => setMaxBudgetFilter(e.target.value.replace(/[^0-9]/g, ""))} /></div>
                <div><Input type="text" placeholder="Min Beds" value={minBedsFilter} onChange={(e) => setMinBedsFilter(e.target.value.replace(/[^0-9]/g, ""))} /></div>
                <div><Input type="date" title="Check In" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} /></div>
                <div><Input type="date" title="Check Out" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} /></div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
            {proposalLink ? (
              <div className="py-8 text-center space-y-6 max-w-2xl mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-forest/10 text-forest mb-2"><CheckCircle2 className="w-6 h-6" /></div>
                <div><h3 className="text-xl font-serif text-foreground">Proposal Ready!</h3></div>

                <a
                  href={proposalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-background p-4 rounded-lg text-left text-sm font-mono break-all border text-primary hover:underline mb-3"
                >
                  {proposalLink}
                </a>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                      <Button variant="outline" className="w-full sm:w-auto" onClick={handleCopyMessage}>{isCopied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} Copy Link</Button>
                      <Button variant="hero" className="w-full border-[#25D366] bg-[#25D366] text-white hover:bg-[#20b858] sm:w-auto" onClick={handleWhatsAppShare}><MessageSquare className="mr-2 h-4 w-4" /> Share via WhatsApp</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProps.map((p) => {
                  const isSelected = selectedProps.includes(p.id);
                  return (
                    <Card key={p.id} className={`overflow-hidden transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}>
                      <div className="flex items-center p-4">
                        <Checkbox checked={isSelected} onCheckedChange={(checked) => { if (checked) setSelectedProps([...selectedProps, p.id]); else setSelectedProps(selectedProps.filter(id => id !== p.id)); }} className="mr-4 h-5 w-5" />
                        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer" onClick={() => setPreviewProp(p)}>
                          <div>
                            <h4 className="font-medium text-foreground text-lg">{p.property_name}</h4>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2"><MapPin className="h-3 w-3" /> {p.area} <span>·</span> <BedDouble className="h-3 w-3" /> {p.bedrooms} Beds</p>
                          </div>
                          <div className="text-left sm:text-right mt-2 sm:mt-0 flex items-center gap-4">
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {!proposalLink && (
            <div className="flex flex-col gap-3 border-t bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{selectedProps.length}</span> properties selected</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="ghost" className="w-full sm:w-auto" onClick={() => setIsProposalOpen(false)}>Cancel</Button>
                <Button variant="hero" className="w-full sm:w-auto" onClick={handleGenerateProposal} disabled={selectedProps.length === 0 || isGenerating}>{isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Generate Link</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewProp} onOpenChange={(o) => !o && setPreviewProp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {previewProp && (
            <>
              <div className="relative h-72 w-full bg-black cursor-pointer group" onClick={() => previewProp.images?.[0] && setZoomedImg(previewProp.images[0].image)}>
                {previewProp.images && previewProp.images.length > 0 ? <img src={previewProp.images[0].image} className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity" alt="Cover" /> : <div className="w-full h-full flex items-center justify-center text-white/50">No Cover Photo</div>}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-none">
                  <h2 className="text-3xl font-serif text-white">{previewProp.property_name}</h2>
                  <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {previewProp.area}</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {previewProp.images && previewProp.images.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Photo Gallery</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                      {previewProp.images.slice(1).map((img, idx) => (
                        <div key={idx} className="relative h-32 w-48 shrink-0 snap-center cursor-pointer group" onClick={() => setZoomedImg(img.image)}>
                          <img src={img.image} className="h-full w-full object-cover rounded-md border group-hover:opacity-80 transition-opacity" alt="Gallery" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold mb-3 border-b pb-2">Property Specs</h3>
                      <div className="grid grid-cols-2 gap-y-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary" /> {previewProp.bedrooms} Bedrooms</p>
                        <p className="flex items-center gap-2"><Bath className="h-4 w-4 text-primary" /> {previewProp.bathrooms} Bathrooms</p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Sleeps {previewProp.capacity}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3 border-b pb-2">Amenities & Distances</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong>Airport:</strong> {previewProp.airport_minutes} mins</p>
                      <p><strong>Hospital:</strong> {previewProp.hospital_distance} mins</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setPreviewProp(null)}>Close</Button>
                  <Button variant="hero" onClick={() => { if (!selectedProps.includes(previewProp.id)) { setSelectedProps([...selectedProps, previewProp.id]); } setPreviewProp(null); }}><CheckCircle2 className="mr-2 h-4 w-4" /> Select</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <div className="font-medium text-foreground">{value}</div>
    </div>
  );
}