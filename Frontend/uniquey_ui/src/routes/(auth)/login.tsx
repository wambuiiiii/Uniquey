import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Separator } from "@/components/ui/separator.tsx";

import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/(auth)/login")({
  head: () => ({
    meta: [
      { title: "Sign in — UNIQUEY" },
      { name: "description", content: "Sign in to your UNIQUEY concierge account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter(); // 2. Initialize router
  const auth = useAuth();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Separate loading states for different actions
  const [isLoading, setIsLoading] = useState(false); // For initial request and verifying
  const [isResending, setIsResending] = useState(false); // Specifically for the resend action

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const otpInputRef = useRef<HTMLInputElement>(null);

  // Cooldown timer for the "Resend code" button (60 seconds)
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Handle Initial OTP Request AND Resending
  const handleRequestCode = async (e: React.FormEvent, isResendAction = false) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isResendAction) {
      setIsResending(true);
    } else {
      setIsLoading(true);
    }

    try {
      await axiosInstance.post("auth/otp/request/", { email });
      setStep("otp");
      setCountdown(60);
      setSuccessMessage(
        isResendAction
          ? "A fresh 6-digit code has been sent to your email."
          : ""
      );
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to send login code. Please check your network connection.");
      }
    } finally {
      setIsLoading(false);
      setIsResending(false);
    }
  };

  // Verify OTP and Login
const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const tokenResponse = await axiosInstance.post("auth/otp/verify/", {
        email,
        otp,
      });

      // 1. Sync tokens to local storage immediately
      localStorage.setItem("access_token", tokenResponse.data.access);
      localStorage.setItem("refresh_token", tokenResponse.data.refresh);

      // 2. Fetch User Profile
      const userResponse = await axiosInstance.get("accounts/me/");

      // 3. Update Auth Context synchronously
      auth.login(userResponse.data);

      // 4. CRITICAL FIX: Invalidate router cache so it recognizes you are logged in
      await router.invalidate();

      // 5. Now navigate safely
      navigate({ to: "/portal" });

    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Invalid or expired code. Please try again.");
      }
      setOtp("");
      setTimeout(() => otpInputRef.current?.focus(), 50);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container-wide flex min-h-[calc(100vh-10rem)] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Guest Portal</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {step === "email"
            ? "Enter your email to receive a secure 6-digit login code."
            : `We sent a 6-digit code to ${email}. It remains valid for 10 minutes.`}
        </p>

        {error && (
          <div className="mt-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600">
            {successMessage}
          </div>
        )}

        {step === "email" ? (
          <form className="mt-6 space-y-4" onSubmit={(e) => handleRequestCode(e, false)}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending code..." : "Send code"}
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
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyCode}>
            <div className="space-y-1.5">
              <Label htmlFor="otp">6-Digit Code</Label>
              <Input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading || isResending}
                ref={otpInputRef}
                className="text-center font-mono tracking-[0.5em] text-lg"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full" disabled={isLoading || isResending}>
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            {/* Resend Code Section */}
            <div className="text-center pt-2">
              {countdown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Resend code in <span className="font-semibold">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleRequestCode(e, true)}
                  disabled={isLoading || isResending}
                  className="text-xs text-primary underline underline-offset-4 hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Resending code..." : "Resend new code"}
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => {
                setStep("email");
                setError("");
                setSuccessMessage("");
                setOtp("");
              }}
              disabled={isLoading || isResending}
            >
              Use a different email
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}