import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { to: "/", label: "Home" },
  { to: "/experiences", label: "Experiences" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/why-uniquey", label: "Why UNIQUEY" },
  { to: "/blog", label: "Blog" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container-wide flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 font-serif text-2xl tracking-tight">
          <span className="text-forest">UNI</span>
          <span className="text-primary">QUEY</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-muted-foreground transition-colors hover:text-forest"
              activeProps={{ className: "text-forest font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/portal"
                className="hidden text-sm font-medium text-primary transition-colors hover:text-forest md:inline"
              >
                My Trip
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex text-muted-foreground hover:text-destructive"
                onClick={logout}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-forest md:inline"
              >
                Sign in
              </Link>
              <Button asChild variant="hero" size="default" className="hidden sm:inline-flex">
                <Link to="/plan-my-stay">Plan My Stay</Link>
              </Button>
            </>
          )}

          <button
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background lg:hidden",
          open ? "max-h-[600px]" : "max-h-0",
          "transition-[max-height] duration-300",
        )}
      >
        <div className="container-wide flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-forest"
            >
              {item.label}
            </Link>
          ))}

          <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/portal"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-accent hover:text-forest"
                >
                  My Trip
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 text-muted-foreground hover:text-destructive"
                  onClick={() => { logout(); setOpen(false); }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-forest"
                >
                  Sign in
                </Link>
                <Button asChild variant="hero" className="w-full mt-1 sm:hidden">
                  <Link to="/plan-my-stay" onClick={() => setOpen(false)}>
                    Plan My Stay
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}