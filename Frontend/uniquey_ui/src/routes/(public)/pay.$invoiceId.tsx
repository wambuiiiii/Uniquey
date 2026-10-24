import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, Receipt, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/api/axios";
import { format } from "date-fns";

export const Route = createFileRoute("/(public)/pay/$invoiceId")({
  component: ClientPaymentPage,
});

function ClientPaymentPage() {
  const { invoiceId } = useParams({ strict: false }) as { invoiceId: string };
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phone, setPhone] = useState("");

  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [justPaidAmount, setJustPaidAmount] = useState<number | null>(null);

  const fetchInvoice = async () => {
    try {
      const res = await axiosInstance.get(`invoices/${invoiceId}/`);
      setInvoice(res.data);
      if (res.data.guest_phone) {
        setPhone(res.data.guest_phone.replace(/[^0-9]/g, ""));
      }
    } catch (err) {
      console.error("Failed to load invoice", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  useEffect(() => {
    let interval: any;
    if (paymentStatus === "sent") {
      interval = setInterval(async () => {
        try {
          const res = await axiosInstance.get(`invoices/${invoiceId}/`);

          if (invoice.status !== "DEPOSIT_PAID" && res.data.status === "DEPOSIT_PAID") {
            setJustPaidAmount(Number(invoice.deposit_required));
            setInvoice(res.data);
            setPaymentStatus("idle");
            clearInterval(interval);
          }
          else if (invoice.status !== "PAID" && res.data.status === "PAID") {
            setJustPaidAmount(Number(invoice.balance_due));
            setInvoice(res.data);
            setPaymentStatus("idle");
            clearInterval(interval);
          }
        } catch (e) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [paymentStatus, invoiceId, invoice]);

  const handleMpesaPay = async () => {
    if (!phone) {
      setErrorMessage("Please enter a valid Safaricom phone number.");
      return;
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      cleanPhone = "254" + cleanPhone.substring(1);
    } else if (cleanPhone.length === 9 && !cleanPhone.startsWith("254")) {
      cleanPhone = "254" + cleanPhone;
    }

    setIsPaying(true);
    setErrorMessage("");

    try {
      await axiosInstance.post(`invoices/${invoiceId}/pay_with_mpesa/`, { phone: cleanPhone });
      setPaymentStatus("sent");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Failed to initiate M-Pesa. Please try again.");
      setPaymentStatus("error");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)] p-4 text-center">
        <p className="text-muted-foreground">Invoice not found or link has expired.</p>
      </div>
    );
  }

  const isDepositPaid = invoice.status === "DEPOSIT_PAID" || (invoice.status === "PAID" && Number(invoice.balance_due) > 0);
  const isFullyPaid = invoice.status === "PAID" && Number(invoice.balance_due) <= 0;

  const amountDue = isDepositPaid ? invoice.balance_due : invoice.deposit_required;
  const dueLabel = isDepositPaid ? "Remaining Balance" : "30% Deposit";

  // SUCCESS OVERLAY
  if (justPaidAmount !== null || isFullyPaid) {
    const displayAmount = justPaidAmount !== null ? justPaidAmount : Number(invoice.grand_total);
    const successMsg = isFullyPaid && justPaidAmount === null
      ? "Your trip is completely paid for. You're all set!"
      : `Thank you, ${invoice.guest_name}. Your payment of ${invoice.currency} ${displayAmount.toLocaleString()} was successful.`;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[color:var(--ivory)] p-4 text-center">
        <Card className="max-w-md p-8 shadow-xl">
          <div className="mx-auto w-16 h-16 bg-forest/10 text-forest rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-foreground mb-2">
            {isFullyPaid ? "Trip Fully Paid!" : "Payment Received!"}
          </h1>
          <p className="text-muted-foreground">{successMsg}</p>

          {/* FIX: Button text updated and hard redirect to /portal clears cache & triggers auth guards */}
          <Button className="mt-6" variant="hero" onClick={() => window.location.href = '/portal'}>
            View Trip
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--ivory)] py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="bg-primary/5 p-6 text-center border-b">
          <div className="mx-auto bg-white p-3 rounded-full shadow-sm w-fit mb-3">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-serif text-2xl text-foreground">Invoice {invoice.invoice_number}</h2>
          <p className="text-xs text-muted-foreground mt-1">Billed to: <span className="font-medium text-foreground">{invoice.guest_name}</span></p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Trip Summary</p>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Accommodation</span>
              <span className="font-medium text-foreground">{invoice.currency} {Number(invoice.accommodation_total).toLocaleString()}</span>
            </div>
            {Number(invoice.additional_fees) > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Additional Services</span>
                <span className="font-medium text-foreground">{invoice.currency} {Number(invoice.additional_fees).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-3 border-t">
              <span className="font-semibold text-foreground">Grand Total</span>
              <span className="font-semibold text-foreground">{invoice.currency} {Number(invoice.grand_total).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-1">Amount Due Now ({dueLabel})</p>
            <p className="text-3xl font-serif text-foreground mb-1">{invoice.currency} {Number(amountDue).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Due by {format(new Date(invoice.due_date), "MMMM d, yyyy")}</p>
          </div>

          <div className="pt-4 border-t space-y-4">
            {!isDepositPaid && (
              <p className="text-center text-xs text-muted-foreground mb-2">
                Remaining balance of {invoice.currency} {Number(invoice.balance_due || 0).toLocaleString()} is due before arrival.
              </p>
            )}

            {paymentStatus === "sent" ? (
              <div className="text-center space-y-3 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm font-medium">Please check your phone.</p>
                <p className="text-xs text-muted-foreground">Enter your M-Pesa PIN on the prompt. Waiting for confirmation...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Safaricom Phone Number</Label>
                  <Input
                    type="tel"
                    placeholder="e.g. 0712345678 or 2547..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isPaying}
                  />
                  {errorMessage && <p className="text-xs text-destructive flex items-center mt-1"><AlertCircle className="h-3 w-3 mr-1"/>{errorMessage}</p>}
                </div>

                <Button
                  className="w-full bg-[#1db954] hover:bg-[#1aa34a] text-white h-12 text-md shadow-md"
                  onClick={handleMpesaPay}
                  disabled={isPaying || !phone}
                >
                  {isPaying ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Smartphone className="mr-2 h-5 w-5" />}
                  {isPaying ? "Sending Prompt..." : "Pay with M-Pesa Express"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}