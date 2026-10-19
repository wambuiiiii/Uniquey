import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/api/axios";

export const Route = createFileRoute("/admin-auth/login")({
  head: () => ({
    meta: [
      { title: "Admin sign in — UNIQUEY" },
      { name: "description", content: "UNIQUEY concierge admin sign in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Get the JWT from Django
      const tokenResponse = await axiosInstance.post("auth/login/", {
        email: email.trim(),
        password,
      });

      // 2. Store tokens
      localStorage.setItem("access_token", tokenResponse.data.access);
      localStorage.setItem("refresh_token", tokenResponse.data.refresh);

      // 3. Fetch the profile and role
      const userResponse = await axiosInstance.get("accounts/me/");

      // 4. A valid login that isn't an admin must not stay signed in here
      if (userResponse.data.role !== "admin") {
        clearTokens();
        setError("This account doesn't have admin access. Guests can sign in from the guest login.");
        return;
      }

      // 5. Update the global Auth Context and go to the dashboard
      auth.login(userResponse.data);
      navigate({ to: "/admin" });
    } catch (err: any) {
      clearTokens();
      const status = err.response?.status;
      if (!err.response) {
        setError("Can't reach the server. Check your internet connection and try again.");
      } else if (status === 401) {
        setError("Incorrect email or password.");
      } else if (status === 400) {
        setError("Please enter a valid email and password.");
      } else if (status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else if (status >= 500) {
        setError("Something went wrong on our side. Please try again shortly.");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Staff access</p>
          <h1 className="font-serif text-3xl text-foreground">Sign in to the console</h1>
          <p className="text-sm text-muted-foreground">
            Enter your work email and password to access the admin console.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {error && (
            <div role="alert" className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@uniquey.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* Hidden until a password reset flow exists */}
              {/* <a href="#" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4">Forgot?</a> */}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in to console"}
          </Button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Not staff? Guest sign in
          </Link>
        </div>
      </div>
    </div>
  );
}