import apartmentImg from "@/assets/experience-apartment.jpg";
import womenImg from "@/assets/experience-women.jpg";
import medicalImg from "@/assets/experience-medical.jpg";
import executiveImg from "@/assets/experience-executive.jpg";
import familyImg from "@/assets/experience-family.jpg";
import heroImg from "@/assets/hero-concierge.jpg";

export type ExperienceSlug =
  | "first-time-arrival"
  | "executive-stay"
  | "medical-stay"
  | "womens-safe-stay"
  | "family-diaspora-stay"
  | "airport-transfer"
  | "concierge-addons";

export interface Experience {
  slug: ExperienceSlug;
  title: string;
  shortTitle: string;
  tagline: string;
  description: string;
  image: string;
  audience: string[];
  included: string[];
  addons: string[];
  faqs: { q: string; a: string }[];
  seo: { title: string; description: string };
}

export const experiences: Experience[] = [
  {
    slug: "first-time-arrival",
    title: "First-Time Arrival in Kenya",
    shortTitle: "First-Time Arrival",
    tagline: "Land in Kenya feeling like a local already knows you.",
    description:
      "Everything you need on day one — airport pickup, verified apartment, local SIM, and a concierge who answers when you call.",
    image: heroImg,
    audience: [
      "First-time visitors to Kenya",
      "Solo travelers",
      "Digital nomads",
      "Diaspora returning after years",
    ],
    included: [
      "JKIA airport pickup with named greeter",
      "Personally verified accommodation match",
      "Guided check-in and orientation",
      "Local SIM card and mobile money setup",
      "24/7 emergency concierge line",
    ],
    addons: [
      "Tour guide for Nairobi city day",
      "Shopping assistance",
      "Currency exchange at fair rates",
      "Private driver by the day",
    ],
    faqs: [
      { q: "How early should I book?", a: "Two weeks ahead is ideal, but we accept requests as late as 48 hours before arrival." },
      { q: "Do you meet me inside the terminal?", a: "Yes — your greeter waits at arrivals holding a UNIQUEY sign with your name." },
    ],
    seo: {
      title: "First Time Visiting Kenya · Concierge Arrival | UNIQUEY",
      description: "First-time visitors to Kenya trust UNIQUEY for airport pickup, verified stays, and 24/7 local concierge support.",
    },
  },
  {
    slug: "executive-stay",
    title: "Executive Stay",
    shortTitle: "Executive Stay",
    tagline: "For leaders who arrive with a full calendar.",
    description:
      "Private chauffeur, premium serviced apartments in Westlands or Kilimani, meeting-ready workspace and quiet, secure accommodation.",
    image: executiveImg,
    audience: [
      "Business travelers",
      "Diplomats and consultants",
      "Investors on field visits",
    ],
    included: [
      "Executive vehicle airport transfer",
      "Premium serviced apartment (Westlands, Kilimani, Riverside)",
      "Discreet 24/7 concierge",
      "Meeting-ready workspace",
      "Housekeeping and laundry",
    ],
    addons: [
      "Full-day chauffeur",
      "Personal security detail",
      "Restaurant reservations",
      "In-city helicopter transfer",
    ],
    faqs: [
      { q: "Can you handle same-day changes?", a: "Yes — your dedicated concierge stays on WhatsApp for the entire trip." },
    ],
    seo: {
      title: "Executive Accommodation Nairobi · Business Concierge | UNIQUEY",
      description: "Premium serviced apartments, private chauffeur, and discreet concierge support for executives visiting Nairobi.",
    },
  },
  {
    slug: "medical-stay",
    title: "Medical Stay",
    shortTitle: "Medical Stay",
    tagline: "Accommodation planned around your treatment, not the other way around.",
    description:
      "Comfortable, private apartments minutes from Kenya's top hospitals — coordinated transport, quiet recovery spaces, and a concierge who understands medical schedules.",
    image: medicalImg,
    audience: [
      "Patients traveling for treatment",
      "Family members supporting a patient",
      "Long-stay recovery visitors",
    ],
    included: [
      "Apartments near Aga Khan, Nairobi Hospital, MP Shah, Karen Hospital",
      "Reliable transport to and from appointments",
      "Grocery and pharmacy runs on your behalf",
      "Quiet, private spaces for recovery",
      "Compassionate 24/7 concierge",
    ],
    addons: [
      "In-home meal delivery",
      "Wheelchair-accessible vehicle",
      "Bilingual patient escort",
      "Home nursing coordination",
    ],
    faqs: [
      { q: "Can family stay in the same apartment?", a: "Yes. We match you with layouts sized for the number of people traveling with the patient." },
      { q: "Do you help with hospital appointments?", a: "We coordinate transport and can escort you to reception when needed." },
    ],
    seo: {
      title: "Medical Accommodation Nairobi · Patient Concierge | UNIQUEY",
      description: "Verified accommodation near Nairobi's top hospitals, with transport and concierge support planned around your treatment.",
    },
  },
  {
    slug: "womens-safe-stay",
    title: "Women's Safe Stay",
    shortTitle: "Women's Safe Stay",
    tagline: "Travel confidently. Every detail already handled.",
    description:
      "Curated for women traveling to Kenya — safe neighborhoods, female drivers on request, and a concierge who checks in on you.",
    image: womenImg,
    audience: [
      "Women traveling solo",
      "Mother-and-daughter trips",
      "Female business travelers",
    ],
    included: [
      "Accommodation in vetted safe neighborhoods",
      "Female driver available on request",
      "Airport pickup with identity verification",
      "Daily WhatsApp check-in",
      "Direct emergency line",
    ],
    addons: [
      "Female tour guide",
      "Shopping and salon appointments",
      "Restaurant company on request",
    ],
    faqs: [
      { q: "Are the apartments in secure buildings?", a: "Yes — every partner apartment has 24-hour security and vetted management." },
    ],
    seo: {
      title: "Safe Accommodation Nairobi for Women · Concierge | UNIQUEY",
      description: "Women travelers to Kenya choose UNIQUEY for safe neighborhoods, verified drivers, and personal concierge check-ins.",
    },
  },
  {
    slug: "family-diaspora-stay",
    title: "Family & Diaspora Stay",
    shortTitle: "Family & Diaspora",
    tagline: "Home is waiting. We just prepare it for you.",
    description:
      "Spacious apartments for families and returning diaspora — with everything the kids need and someone local to lean on.",
    image: familyImg,
    audience: [
      "Diaspora returning to visit family",
      "Multi-generational family trips",
      "Weddings and homecoming visits",
    ],
    included: [
      "2–4 bedroom family apartments",
      "Airport pickup with family-sized vehicle",
      "Grocery pre-stocking",
      "Local SIM cards for adults",
      "Concierge who speaks Swahili and English",
    ],
    addons: [
      "Nanny arrangements",
      "Event driver (weddings, funerals)",
      "Country home coordination",
      "Domestic flights and safari bookings",
    ],
    faqs: [
      { q: "Can you stock the apartment before we arrive?", a: "Yes. Send us your grocery list and it's ready before check-in." },
    ],
    seo: {
      title: "Family Accommodation Nairobi · Diaspora Concierge | UNIQUEY",
      description: "Spacious family apartments and diaspora concierge in Nairobi — airport pickup, grocery stocking, and local support.",
    },
  },
  {
    slug: "airport-transfer",
    title: "Airport Transfer",
    shortTitle: "Airport Transfer",
    tagline: "A friendly face at arrivals. Every time.",
    description:
      "Flight tracked, vehicle ready, and your name on the board when you step out of JKIA or Wilson Airport.",
    image: heroImg,
    audience: [
      "Anyone arriving in or leaving Kenya",
      "Groups needing multiple vehicles",
      "Late-night arrivals",
    ],
    included: [
      "Named greeter inside arrivals hall",
      "Flight tracking (no charge for delays)",
      "Clean, air-conditioned vehicle",
      "Bottled water and Wi-Fi",
      "Fixed transparent pricing",
    ],
    addons: [
      "SUV or luxury vehicle upgrade",
      "Multi-stop city tour on the way",
      "Return transfer package",
    ],
    faqs: [
      { q: "What if my flight is delayed?", a: "We track it in real time — no extra charge and no missed pickup." },
    ],
    seo: {
      title: "Airport Pickup Nairobi · JKIA Transfer | UNIQUEY",
      description: "Reliable JKIA airport pickup with named greeters, flight tracking, and transparent pricing.",
    },
  },
  {
    slug: "concierge-addons",
    title: "Concierge Add-ons",
    shortTitle: "Concierge Add-ons",
    tagline: "Anything else? We probably do that too.",
    description:
      "From safari bookings to shopping runs, our concierge team handles the small requests that make a big trip feel effortless.",
    image: apartmentImg,
    audience: [
      "Any UNIQUEY guest",
      "Travelers with unusual requests",
      "Long-stay visitors",
    ],
    included: [
      "Personal shopper",
      "Restaurant reservations",
      "Event tickets",
      "Errand running",
      "Trusted contractor referrals",
    ],
    addons: [
      "Full-day tour guide",
      "Safari trip booking",
      "Car hire with or without driver",
      "Interpretation and translation",
    ],
    faqs: [
      { q: "Are add-ons priced separately?", a: "Yes — we quote each add-on transparently before you approve." },
    ],
    seo: {
      title: "Kenya Concierge Add-ons · Personal Services | UNIQUEY",
      description: "Extra concierge services in Kenya — shopping, tours, safari bookings, translation, and more.",
    },
  },
];

export const experienceMap = Object.fromEntries(experiences.map((e) => [e.slug, e])) as Record<
  ExperienceSlug,
  Experience
>;
