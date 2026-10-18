import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AdminAuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[var(--gradient-forest)] p-12 text-forest-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="font-serif text-2xl tracking-tight">
          <span>UNI</span>
          <span className="text-primary">QUEY</span>
          <span className="ml-2 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
            Admin
          </span>
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Concierge Ops</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight">
            The command center for every arrival.
          </h2>
          <p className="mt-4 text-sm text-forest-foreground/80">
            Manage inquiries, dispatch drivers, confirm apartments, and track every
            guest from first message to safe departure.
          </p>
        </div>
        <div className="text-xs text-forest-foreground/60">
          © {new Date().getFullYear()} UNIQUEY Concierge Ltd.
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </aside>

      <main className="flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-3xl text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-center text-xs text-muted-foreground">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
