import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";// Fallback experiences array just in case the import fails or is empty
import { experiences } from "@/lib/experiences";
import axiosInstance from "@/api/axios.ts";
export const Route = createFileRoute("/(public)/plan-my-stay")({
  head: () => ({
    meta: [
      { title: "Plan My Stay · UNIQUEY Kenya Concierge" },
      {
        name: "description",
        content:
          "Tell UNIQUEY about your Kenya trip and a concierge specialist will contact you within 24 hours.",
      },
    ],
  }),
  component: PlanMyStay,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Please enter your name").max(100),
  nationality: z.string().trim().min(2, "Nationality is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(5, "Enter a valid phone").max(30),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  arrivalDate: z.string().min(1, "Arrival date required"),
  departureDate: z.string().min(1, "Departure date required"),
  // Adjusted coercion to prevent NaN render loops
  guests: z.coerce.number().min(1, "At least 1 guest").max(30),
  purpose: z.enum(["Vacation", "Business", "Medical", "Diaspora Visit", "Other"]),
  budget: z.string().max(60).optional().or(z.literal("")),
  area: z.string().max(60).optional().or(z.literal("")),
  package: z.string().max(80).optional().or(z.literal("")),
  requests: z.string().max(1000).optional().or(z.literal("")),
  referral: z.string().max(80).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

function PlanMyStay() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(""); // Add error state
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      purpose: "Vacation",
      guests: 1,
      package: "",
    },
  });

 const onSubmit = async (data: FormValues) => {
    setServerError("");
    try {
      // 1. Split Full Name into First and Last
      const nameParts = data.fullName.trim().split(/\s+/);
      const first_name = nameParts[0];
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "N/A";

      // 2. Map Purpose to Django Choices
      const purposeMap: Record<string, string> = {
        "Vacation": "VACATION",
        "Business": "BUSINESS",
        "Medical": "MEDICAL",
        "Diaspora Visit": "DIASPORA",
        "Other": "VACATION", // fallback
      };

      // 3. Extract a rough number from the free-text budget string
      const extractedBudget = parseInt(data.budget?.replace(/[^0-9]/g, "") || "0");

      // 4. Append package title and referral source to special requests
      // (Since we don't have the Package UUID on the frontend yet)
      let special_requests = data.requests || "";
      if (data.package) {
        special_requests += `\n\nRequested Package: ${data.package}`;
      }
      if (data.referral) {
        special_requests += `\n\nReferral Source: ${data.referral}`;
      }

      // 5. Construct the exact payload Django expects
      const payload = {
        first_name,
        last_name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp || "",
        nationality: data.nationality,
        arrival_date: data.arrivalDate,
        departure_date: data.departureDate,
        guests: data.guests,
        purpose: purposeMap[data.purpose] || "VACATION",
        budget_min: extractedBudget,
        budget_max: extractedBudget > 0 ? extractedBudget * 2 : 0, // Ensure max >= min
        preferred_location: data.area || "",
        special_requests: special_requests.trim(),
        // package: null (omitted so Django handles it gracefully)
      };

      // 6. Send to Django!
        await axiosInstance.post("inquiries/", payload);
  setSubmitted(true);
        setSubmitted(true);
    } catch (err: any) {
      console.error("Submission failed:", err.response?.data || err);
      // Catch specific validation errors from Django
      const errorMsg = err.response?.data?.departure_date
        ? "Departure date must occur after the arrival date."
        : "Failed to submit your inquiry. Please try again or contact us on WhatsApp.";
      setServerError(errorMsg);
    }
  };

  const onError = (errors: any) => {
    console.error("Form blocked by validation:", errors);
  };

  if (submitted) {
    return (

        <section className="container-wide max-w-xl py-32 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-balance text-3xl md:text-4xl">Thank you!</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            One of our concierge specialists will contact you within 24 hours.
          </p>
        </section>

    );
  }

  return (

      <section className="container-wide max-w-3xl pt-24 pb-16">
        <p className="mb-3 text-sm uppercase tracking-widest text-forest">Plan My Stay</p>
        <h1 className="text-balance text-4xl md:text-5xl">Tell us about your trip.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A concierge specialist will contact you within 24 hours with a personalized plan.
        </p>
          {serverError && (
          <div className="mt-6 rounded-lg bg-destructive/15 p-4 text-sm font-medium text-destructive">
            {serverError}
          </div>
        )}


        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-10"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Full name" error={form.formState.errors.fullName?.message}>
              <Input {...form.register("fullName")} placeholder="Your name" />
            </Field>

            <Field label="Nationality" error={form.formState.errors.nationality?.message}>
              <Input {...form.register("nationality")} placeholder="e.g. Kenyan American" />
            </Field>

            <Field label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} placeholder="you@email.com" />
            </Field>

            <Field label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} placeholder="+1 555 000 0000" />
            </Field>

            <Field label="WhatsApp (optional)">
              <Input {...form.register("whatsapp")} placeholder="If different from phone" />
            </Field>

            <Field label="Number of guests" error={form.formState.errors.guests?.message}>
              <Input type="number" min={1} {...form.register("guests", { valueAsNumber: true })} />
            </Field>

            <Field label="Arrival date" error={form.formState.errors.arrivalDate?.message}>
              <Input type="date" {...form.register("arrivalDate")} />
            </Field>

            <Field label="Departure date" error={form.formState.errors.departureDate?.message}>
              <Input type="date" {...form.register("departureDate")} />
            </Field>

            {/* Controlled Select prevents the infinite loop freeze */}
            <Field label="Purpose of trip" error={form.formState.errors.purpose?.message}>
              <Controller
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Vacation", "Business", "Medical", "Diaspora Visit", "Other"].map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Budget (optional)">
              <Input {...form.register("budget")} placeholder="e.g. $80/night" />
            </Field>

            <Field label="Preferred area (optional)">
              <Input {...form.register("area")} placeholder="Westlands, Kilimani, Karen…" />
            </Field>

            {/* Controlled Select prevents the infinite loop freeze */}
            <Field label="Package interested in">
              <Controller
                control={form.control}
                name="package"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose one (or none)" />
                    </SelectTrigger>
                    <SelectContent>
                      {experiences?.map((e) => (
                        <SelectItem key={e.slug} value={e.title}>
                          {e.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field label="Special requests" error={form.formState.errors.requests?.message}>
            <Textarea rows={4} {...form.register("requests")} placeholder="Anything we should know?" />
          </Field>

          <Field label="How did you hear about us?">
            <Input {...form.register("referral")} placeholder="Google, referral, social…" />
          </Field>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Sending…" : "Submit Request"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            No payment required. We respond within 24 hours.
          </p>
        </form>
      </section>

  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error ? <p className="text-xs font-semibold text-red-500">{error}</p> : null}
    </div>
  );
}