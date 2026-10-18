export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  category: string;
  readTime: string;
  date: string;
  seo: { title: string; description: string };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "jkia-airport-guide",
    title: "The Complete JKIA Airport Arrival Guide",
    excerpt: "What to expect the moment you land at Jomo Kenyatta International Airport — visas, SIMs, taxis, and the small things nobody tells you.",
    category: "Arrival Guide",
    readTime: "6 min",
    date: "2025-06-14",
    body: [
      "Jomo Kenyatta International Airport (JKIA) is Kenya's main gateway. Terminal 1A handles most international arrivals.",
      "eTA on arrival: Kenya now uses an Electronic Travel Authorization. Apply online before you fly — approvals usually come in 2–3 days.",
      "SIM cards: Safaricom and Airtel counters are inside the arrivals hall. Bring your passport and around USD 5. Or let your UNIQUEY greeter hand you a pre-activated line.",
      "Getting to town: JKIA is 15–45 minutes from most neighborhoods depending on traffic. Avoid unmarked taxis outside — pre-book with a trusted operator.",
      "Money: ATMs work well but withdraw a small amount to start. Most restaurants and apartments accept M-Pesa; your concierge can set you up.",
    ],
    seo: {
      title: "JKIA Airport Arrival Guide · Kenya Travel Tips | UNIQUEY",
      description: "What to expect at Nairobi's JKIA airport — visas, SIM cards, ground transport, and safe arrival tips.",
    },
  },
  {
    slug: "best-areas-to-stay-nairobi",
    title: "The Best Areas to Stay in Nairobi (Honest Guide)",
    excerpt: "Westlands, Kilimani, Karen, Lavington — where should you actually book? A neighborhood-by-neighborhood breakdown.",
    category: "Neighborhoods",
    readTime: "8 min",
    date: "2025-06-08",
    body: [
      "Westlands: Central, walkable, restaurant-dense. Best for business and first-time visitors.",
      "Kilimani: Modern apartments, cafes, quieter streets. Great for longer stays and digital nomads.",
      "Karen and Lang'ata: Leafy, quieter, close to Nairobi National Park. Best for families and recovery stays.",
      "Riverside and Upperhill: Diplomatic feel, close to hospitals and embassies. Common for medical visitors.",
    ],
    seo: {
      title: "Where to Stay in Nairobi · Best Neighborhoods for Visitors | UNIQUEY",
      description: "An honest guide to Nairobi's best neighborhoods for visitors — Westlands, Kilimani, Karen and more.",
    },
  },
  {
    slug: "first-time-in-nairobi",
    title: "First Time in Nairobi? Read This First.",
    excerpt: "Six things every first-time visitor to Nairobi should know before touching down.",
    category: "First Time",
    readTime: "5 min",
    date: "2025-05-30",
    body: [
      "1. Traffic is unpredictable — always add a buffer.",
      "2. M-Pesa is used everywhere. Get set up on day one.",
      "3. Weather is mild year-round. Layers work best.",
      "4. English and Swahili are both official languages.",
      "5. Uber and Bolt work well, but pre-arranged drivers are safer at night.",
      "6. Tipping is appreciated but not mandatory.",
    ],
    seo: {
      title: "First Time in Nairobi · Kenya Travel Tips | UNIQUEY",
      description: "Six essential things to know before your first visit to Nairobi, Kenya.",
    },
  },
];

export const blogMap = Object.fromEntries(blogPosts.map((p) => [p.slug, p])) as Record<
  string,
  BlogPost
>;
