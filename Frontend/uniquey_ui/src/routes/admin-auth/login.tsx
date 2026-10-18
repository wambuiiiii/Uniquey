import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Import your Auth Context and API client
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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Get the JWT from Django
      const tokenResponse = await axiosInstance.post("auth/login/", {
        email,
        password,
      });

      // 2. Store tokens in the browser
      localStorage.setItem("access_token", tokenResponse.data.access);
      localStorage.setItem("refresh_token", tokenResponse.data.refresh);

      // 3. Fetch the logged-in user's profile and role
      const userResponse = await axiosInstance.get("accounts/me/");

      // 4. Update the global Auth Context
      auth.login(userResponse.data);

      // 5. Redirect to the Admin Dashboard
      navigate({ to: "/admin" });
    } catch (err: any) {
      // Catch 401 Unauthorized errors from Django
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm space-y-8">

        {/* Header Section */}
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">
            Staff access
          </p>
          <h1 className="font-serif text-3xl text-foreground">
            Sign in to the console
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your work email and password to access the admin console.
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
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
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors">
                Forgot?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in to console"}
          </Button>
        </form>

        {/* Footer Section */}
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