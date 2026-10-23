import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, FileText, MessageSquare, Send, Receipt, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/api/axios";
import { format } from "date-fns";

export const Route = createFileRoute("/(protected)/admin/invoices")({
  component: AdminInvoices,
  validateSearch: (search: Record<string, unknown>) => ({
    auto_fill: search.auto_fill as boolean | undefined,
    email: search.email as string | undefined,
    guest_name: search.guest_name as string | undefined,
    inquiry_id: search.inquiry_id as string | undefined,
    accommodation_total: search.accommodation_total as string | undefined,
    property_name: search.property_name as string | undefined,
  }),
});

type Invoice = {
  id?: string;
  invoice_number: string;
  inquiry?: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  accommodation_total: string | number;
  additional_fees: string | number;
  grand_total?: string | number;
  deposit_required: string | number;
  balance_due?: string | number;
  currency: string;
  due_date: string;
  status: string;
  status_display?: string;
  whatsapp_link?: string | null;
  property_name?: string;
};

const generateInvNumber = () => `INV-${Math.floor(100000 + Math.random() * 900000)}`;

const emptyDraft: Invoice = {
  invoice_number: "",
  guest_name: "",
  guest_email: "",
  guest_phone: "",
  accommodation_total: "",
  additional_fees: "0",
  deposit_required: "0",
  currency: "KES",
  due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  status: "DRAFT",
};

function calculateDeposit(acc: string | number, fees: string | number): string {
  const total = (parseFloat(String(acc)) || 0) + (parseFloat(String(fees)) || 0);
  return (total * 0.3).toFixed(2);
}

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

function AdminInvoices() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Invoice>(emptyDraft);
  const [selectedPropertyNote, setSelectedPropertyNote] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [previewInv, setPreviewInv] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const invRes = await axiosInstance.get("invoices/");
      const invoicesList: Invoice[] = invRes.data.results || invRes.data;
      setInvoices(invoicesList);

      if (search.auto_fill) {
        const email = search.email || "";
        const name = search.guest_name || "";
        const accTotal = search.accommodation_total || "0";
        const propName = search.property_name || "";
        const inquiryId = search.inquiry_id || "";

        setSelectedPropertyNote(propName);

        const existingDraft = invoicesList.find(
          (inv) => inv.guest_email?.toLowerCase() === email.toLowerCase() && inv.status === "DRAFT"
        );

        if (existingDraft) {
          const updatedAcc = parseFloat(accTotal) > 0 ? String(accTotal) : String(existingDraft.accommodation_total);
          setDraft({
            ...existingDraft,
            inquiry: inquiryId || existingDraft.inquiry,
            accommodation_total: updatedAcc,
            property_name: propName,
            deposit_required: calculateDeposit(updatedAcc, existingDraft.additional_fees),
          });
          setIsEditing(true);
        } else {
          setDraft({
            ...emptyDraft,
            invoice_number: generateInvNumber(),
            inquiry: inquiryId || null,
            guest_name: name,
            guest_email: email,
            accommodation_total: String(accTotal),
            property_name: propName,
            additional_fees: "0",
            deposit_required: calculateDeposit(accTotal, "0"),
          });
          setIsEditing(false);
        }

        setOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch invoices", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    if (search.auto_fill) {
      navigate({
        to: "/admin/invoices",
        search: { auto_fill: undefined, email: undefined, guest_name: undefined, inquiry_id: undefined, accommodation_total: undefined, property_name: undefined },
        replace: true,
      });
    }
  };

  const handleAmountChange = (field: "accommodation_total" | "additional_fees", value: string) => {
    const updated = { ...draft, [field]: value };
    updated.deposit_required = calculateDeposit(updated.accommodation_total, updated.additional_fees);
    setDraft(updated);
  };

  const handleOpenNew = () => {
    setSelectedPropertyNote("");
    setDraft({ ...emptyDraft, invoice_number: generateInvNumber() });
    setIsEditing(false);
    setOpen(true);
  };

  const handleOpenEdit = (inv: Invoice) => {
    setSelectedPropertyNote("");
    setDraft(inv);
    setIsEditing(true);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!draft.guest_name || !draft.guest_email) {
      alert("Please provide the guest's name and email.");
      return;
    }
    if (!draft.invoice_number) {
      alert("Please provide an invoice number.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        invoice_number: draft.invoice_number,
        inquiry: draft.inquiry || null,
        guest_name: draft.guest_name,
        guest_email: draft.guest_email,
        guest_phone: draft.guest_phone || "",
        accommodation_total: parseFloat(String(draft.accommodation_total)) || 0.00,
        additional_fees: parseFloat(String(draft.additional_fees)) || 0.00,
        deposit_required: parseFloat(String(draft.deposit_required)) || 0.00,
        currency: draft.currency || "KES",
        due_date: draft.due_date,
        status: draft.status || "DRAFT",
      };

      if (isEditing && draft.id) {
        const res = await axiosInstance.patch(`invoices/${draft.id}/`, payload);
        setInvoices((prev) => prev.map((inv) => (inv.id === draft.id ? res.data : inv)));
      } else {
        const res = await axiosInstance.post("invoices/", payload);
        setInvoices((prev) => [res.data, ...prev]);
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(`Failed to save invoice.\n${error.response?.data ? JSON.stringify(error.response.data) : ""}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axiosInstance.delete(`invoices/${id}/`);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } catch (error) {
      alert("Failed to delete invoice.");
    }
  };

  const sendInvoiceWhatsApp = async (inv: Invoice) => {
    const cleanPhone = formatWhatsAppNumber(inv.guest_phone || "");

    // Only auto-update status to SENT if it was previously a DRAFT
    if (inv.status === "DRAFT" && inv.id) {
      try {
        const res = await axiosInstance.patch(`invoices/${inv.id}/`, { status: "SENT" });
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? res.data : i)));
        setPreviewInv(res.data);
      } catch (e) {
        console.error("Failed to auto-update status to SENT");
      }
    }

    const link = `${window.location.origin}/pay/${inv.id}`;
    let msg = "";

    // Dynamic WhatsApp message based on payment state
    if (inv.status === "DEPOSIT_PAID") {
      msg = encodeURIComponent(`Hello ${inv.guest_name},\n\nThank you for your deposit! Your UNIQUEY reservation is secured. When you are ready, you can pay your remaining balance safely here:\n\n${link}`);
    } else {
      msg = encodeURIComponent(`Hello ${inv.guest_name},\n\nYour UNIQUEY accommodation invoice (${inv.invoice_number}) is ready! To secure your reservation, please view your breakdown and securely pay your 30% deposit here:\n\n${link}`);
    }

    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  // LIVE MATH FOR THE EDITOR
  const liveGrandTotal = (parseFloat(String(draft.accommodation_total)) || 0) + (parseFloat(String(draft.additional_fees)) || 0);
  const liveDeposit = liveGrandTotal * 0.3;
  const liveBalanceDue = liveGrandTotal - liveDeposit;

  const filtered = invoices.filter((inv) =>
    (inv.invoice_number + inv.guest_email + inv.guest_name).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Finance</p>
          <h1 className="mt-1 font-serif text-3xl text-foreground">Invoices & Billing</h1>
        </div>
        <Button variant="hero" onClick={handleOpenNew}><Plus className="mr-1.5 h-4 w-4" /> Generate Invoice</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, or INV-#" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/20">No invoices generated yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inv) => {
            // Dynamic State Logic
            const isFullyPaid = inv.status === "PAID";
            const isDepositPaid = inv.status === "DEPOSIT_PAID";
            const isLocked = isFullyPaid || isDepositPaid;

            // Calculate exact dynamic balances overriding backend staleness
            let amountPaid = 0;
            if (isFullyPaid) amountPaid = Number(inv.grand_total || 0);
            else if (isDepositPaid) amountPaid = Number(inv.deposit_required || 0);

            const depositDue = isLocked ? 0 : Number(inv.deposit_required || 0);
            const balanceDue = Number(inv.grand_total || 0) - amountPaid;

            return (
              <Card key={inv.id} className="border-border/60 overflow-hidden flex flex-col">
                <CardContent className="space-y-4 p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-lg text-foreground flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" /> {inv.invoice_number}
                      </p>
                      <p className="text-xs text-muted-foreground">{inv.guest_name || inv.guest_email}</p>
                    </div>
                    <Badge variant="outline" className={isLocked ? "bg-forest/15 text-forest border-forest/30" : "bg-muted text-muted-foreground"}>
                      {inv.status_display || inv.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg text-sm border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stay Total:</span>
                      <span>{inv.currency} {Number(inv.accommodation_total || 0).toLocaleString()}</span>
                    </div>
                    {Number(inv.additional_fees) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Additional Fees:</span>
                        <span>{inv.currency} {Number(inv.additional_fees).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border/60">
                      <span className="text-muted-foreground">Grand Total:</span>
                      <span className="font-semibold text-foreground">{inv.currency} {Number(inv.grand_total || 0).toLocaleString()}</span>
                    </div>

                    {/* DYNAMIC DEPOSIT DISPLAY */}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit Due (30%):</span>
                      <span className={isLocked ? "text-muted-foreground" : "font-semibold text-primary"}>
                        {isLocked ? "Paid" : `${inv.currency} ${depositDue.toLocaleString()}`}
                      </span>
                    </div>

                    {/* DYNAMIC BALANCE DISPLAY */}
                    <div className="flex justify-between">
                      <span className={isDepositPaid ? "font-medium text-foreground" : "text-muted-foreground"}>Balance Remaining:</span>
                      <span className={`font-medium ${isDepositPaid ? "text-primary text-base" : "text-foreground"}`}>
                        {isFullyPaid ? "Paid in Full" : `${inv.currency} ${balanceDue.toLocaleString()}`}
                      </span>
                    </div>

                    {!isLocked && (
                      <div className="flex justify-between text-xs pt-2 border-t border-border/60">
                        <span className="text-muted-foreground">Deposit Due By:</span>
                        <span>{format(new Date(inv.due_date), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 mt-auto">
                    {/* HIDE EDIT & SEND IF PAID */}
                    {!isLocked ? (
                      <>
                        <Button variant="hero" size="sm" className="flex-1" onClick={() => setPreviewInv(inv)}>
                          <Send className="mr-1.5 h-3.5 w-3.5" /> Preview & Send
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(inv)}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setPreviewInv(inv)}>
                        <Receipt className="mr-1.5 h-3.5 w-3.5" /> View Receipt
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => inv.id && handleDelete(inv.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* EDITOR MODAL ... */}
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{isEditing ? "Review & Edit Invoice" : "Prepare Invoice Draft"}</DialogTitle>
            <DialogDescription>
              {draft.guest_name || draft.guest_email
                ? <span className="block font-medium text-foreground mb-1">Billed to: {draft.guest_name || draft.guest_email}</span>
                : <span className="block font-medium text-destructive mb-1">No guest linked.</span>}
              {selectedPropertyNote
                ? `Auto-populated for guest staying at ${selectedPropertyNote}. Add any additional concierge fees below.`
                : "Generate structured breakdown and automatic 30% deposit requirement."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="space-y-1.5">
              <Label>Invoice Number</Label>
              <Input value={draft.invoice_number} onChange={(e) => setDraft({ ...draft, invoice_number: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Guest Full Name</Label>
                <Input value={draft.guest_name} onChange={(e) => setDraft({ ...draft, guest_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label>Guest Email</Label>
                <Input value={draft.guest_email} onChange={(e) => setDraft({ ...draft, guest_email: e.target.value })} placeholder="john@example.com" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Accommodation Total</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.accommodation_total}
                  onChange={(e) => handleAmountChange("accommodation_total", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Additional Fees (Chef, Transfers, etc.)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={draft.additional_fees}
                  onChange={(e) => handleAmountChange("additional_fees", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Grand Total</p>
                <p className="font-serif text-xl text-foreground mt-0.5">{draft.currency} {liveGrandTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Required Deposit (30%)</p>
                <p className="font-serif text-xl text-primary mt-0.5">{draft.currency} {liveDeposit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining Balance</p>
                <p className="font-serif text-xl text-foreground mt-0.5">{draft.currency} {liveBalanceDue.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Deposit Due Date</Label>
                <Input type="date" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Input value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} placeholder="KES" />
              </div>
              <div className="space-y-1.5">
                <Label>Invoice Status</Label>
                <Select value={draft.status || "DRAFT"} onValueChange={(val) => setDraft({ ...draft, status: val })}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent to Customer</SelectItem>
                    <SelectItem value="DEPOSIT_PAID">Deposit Paid</SelectItem>
                    <SelectItem value="PAID">Fully Paid</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button variant="hero" onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Saving..." : "Save Invoice"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CLIENT PREVIEW & RECEIPT MODAL */}
      <Dialog open={!!previewInv} onOpenChange={(o) => !o && setPreviewInv(null)}>
        <DialogContent className="max-w-md bg-muted/30 p-4">
          <DialogHeader className="text-center pb-0">
            <div className="mx-auto bg-white p-2.5 rounded-full shadow-sm w-fit mb-2"><Receipt className="h-5 w-5 text-primary" /></div>
            <DialogTitle className="font-serif text-xl">
              {previewInv?.status === "PAID" ? "Receipt" : "Invoice"} {previewInv?.invoice_number}
            </DialogTitle>
            <DialogDescription className="text-xs">Billed to: <span className="text-foreground font-medium">{previewInv?.guest_name || previewInv?.guest_email}</span></DialogDescription>
          </DialogHeader>

          {previewInv && (() => {
            const isPreviewFullyPaid = previewInv.status === "PAID";
            const isPreviewDepositPaid = previewInv.status === "DEPOSIT_PAID";

            let previewAmountPaid = 0;
            if (isPreviewFullyPaid) previewAmountPaid = Number(previewInv.grand_total || 0);
            else if (isPreviewDepositPaid) previewAmountPaid = Number(previewInv.deposit_required || 0);

            const previewBalanceDue = Number(previewInv.grand_total || 0) - previewAmountPaid;

            return (
              <div className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Trip Summary</p>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Accommodation</span>
                    <span className="font-medium text-foreground">{previewInv.currency} {Number(previewInv.accommodation_total).toLocaleString()}</span>
                  </div>
                  {Number(previewInv.additional_fees) > 0 && (
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Additional Services</span>
                      <span className="font-medium text-foreground">{previewInv.currency} {Number(previewInv.additional_fees).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-semibold text-foreground">Grand Total</span>
                    <span className="font-semibold text-foreground">{previewInv.currency} {Number(previewInv.grand_total).toLocaleString()}</span>
                  </div>
                </div>

                {isPreviewFullyPaid ? (
                  <div className="bg-forest/10 border border-forest/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-forest mb-0.5">Status</p>
                    <p className="text-2xl font-serif text-forest mb-0.5">Fully Paid</p>
                  </div>
                ) : (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">
                      {isPreviewDepositPaid ? "Balance Due Now" : "Deposit Due Now"}
                    </p>
                    <p className="text-2xl font-serif text-foreground mb-0.5">
                      {previewInv.currency} {isPreviewDepositPaid ? previewBalanceDue.toLocaleString() : Number(previewInv.deposit_required).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Due by {format(new Date(previewInv.due_date), "MMM d, yyyy")}</p>
                  </div>
                )}

                <div className="pt-2 border-t space-y-2">
                  {!isPreviewFullyPaid && (
                    <p className="text-center text-xs text-muted-foreground mb-2">
                      Remaining balance of {previewInv.currency} {previewBalanceDue.toLocaleString()} due before arrival.
                    </p>
                  )}

                  {!isPreviewFullyPaid && (
                    <a
                      href={`${window.location.origin}/pay/${previewInv.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full bg-[#1db954] hover:bg-[#1aa34a] text-white h-10 text-sm shadow-md">
                        <Smartphone className="mr-2 h-4 w-4" /> Open Payment Link
                      </Button>
                    </a>
                  )}

                  <Button variant="outline" className="w-full h-10 text-sm" onClick={() => sendInvoiceWhatsApp(previewInv)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {isPreviewFullyPaid ? "Send Receipt via WhatsApp" : "Send to Guest via WhatsApp"}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}