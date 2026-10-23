import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Facebook, MessageCircle, Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-[color:var(--forest)] text-forest-foreground">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="font-serif text-2xl">
            <span>UNI</span>
            <span className="text-primary">QUEY</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-forest-foreground/75">
            Your trusted local concierge in Kenya — before, during and after arrival.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="https://wa.me/254700000000" aria-label="WhatsApp" className="hover:text-primary">
              <MessageCircle className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-primary">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-primary">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            Explore
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/experiences" className="hover:text-primary">Experiences</Link></li>
            <li><Link to="/how-it-works" className="hover:text-primary">How It Works</Link></li>
            <li><Link to="/why-uniquey" className="hover:text-primary">Why UNIQUEY</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Travel Tips</Link></li>
            <li><Link to="/testimonials" className="hover:text-primary">Testimonials</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            Contact
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +254721529527
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp 24/7
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> concierge@uniqueytravels.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Pangani opposite Hashgrill Restaurant
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
            Newsletter
          </h4>
          <p className="mb-3 text-sm text-forest-foreground/75">
            Kenya travel tips, straight to your inbox.
          </p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="you@email.com"
              className="w-full rounded-full border border-forest-foreground/20 bg-transparent px-4 py-2 text-sm placeholder:text-forest-foreground/50 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-forest-foreground/15">
        <div className="container-wide flex flex-col justify-between gap-2 py-6 text-xs text-forest-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} UNIQUEY Concierge. All rights reserved.</p>
          <p>Kenya travel concierge · Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
