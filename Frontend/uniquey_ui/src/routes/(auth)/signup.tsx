import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Separator } from "@/components/ui/separator.tsx";

export const Route = createFileRoute("/(auth)/signup")({
  head: () => ({
    meta: [
      { title: "Create your UNIQUEY account" },
      {
        name: "description",
        content:
          "Create a UNIQUEY account to plan your Kenya trip, save inquiries, and access your concierge itinerary.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [submitted, setSubmitted] = useState(false);
  return (

      <section className="container-wide grid min-h-[calc(100vh-10rem)] items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="hidden lg:block">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Guest Account</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground">
            Kenya, arranged before you land.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Save your itinerary drafts, revisit past inquiries, and keep every
            confirmation, transfer detail, and concierge note in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Track your Plan My Stay inquiries in real time",
              "Message your dedicated concierge",
              "Store passport, referral & flight documents securely",
              "See invoices and payment history",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          {submitted ? (
            <div className="space-y-4 text-center">
              <h2 className="font-serif text-2xl text-foreground">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to your email. This is a UI preview —
                no backend is connected yet.
              </p>
              <Button variant="secondary" onClick={() => setSubmitted(false)}>
                Back to form
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl text-foreground">Create your account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Already with us?{" "}
                <Link to="/login" className="text-forest underline underline-offset-4">
                  Sign in
                </Link>
              </p>

              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first">First name</Label>
                    <Input id="first" required placeholder="Amina" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last">Last name</Label>
                    <Input id="last" required placeholder="Otieno" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@email.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (with country code)</Label>
                  <Input id="phone" required placeholder="+254 700 000 000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required placeholder="At least 8 characters" />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox id="terms" defaultChecked className="mt-0.5" />
                  <span>
                    I agree to UNIQUEY's{" "}
                    <a className="underline underline-offset-4" href="#">Terms</a> and{" "}
                    <a className="underline underline-offset-4" href="#">Privacy Policy</a>.
                  </span>
                </label>
                <Button type="submit" variant="hero" className="w-full">
                  Create account
                </Button>
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    or
                  </span>
                  <Separator className="flex-1" />
                </div>
                <Button type="button" variant="outline" className="w-full">
                  Continue with Google
                </Button>
              </form>
            </>
          )}
        </div>
      </section>

  );
}
