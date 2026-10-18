export interface Testimonial {
  name: string;
  country: string;
  flag: string;
  package: string;
  quote: string;
  stars: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Amara O.",
    country: "United States",
    flag: "🇺🇸",
    package: "Family & Diaspora Stay",
    quote:
      "We hadn't been home in 12 years. UNIQUEY made the whole trip effortless — the apartment was stocked, the driver was patient, and someone was one WhatsApp away the entire time.",
    stars: 5,
  },
  {
    name: "Chloé M.",
    country: "France",
    flag: "🇫🇷",
    package: "Women's Safe Stay",
    quote:
      "As a solo woman traveler I felt safer than I have anywhere else. A female driver picked me up, the neighborhood was calm, and someone checked on me every morning.",
    stars: 5,
  },
  {
    name: "Deepak R.",
    country: "India",
    flag: "🇮🇳",
    package: "Medical Stay",
    quote:
      "My father came for surgery at Aga Khan. UNIQUEY placed us five minutes from the hospital, arranged transport, and quietly stocked the kitchen. That kind of care matters.",
    stars: 5,
  },
  {
    name: "Sarah K.",
    country: "United Kingdom",
    flag: "🇬🇧",
    package: "Executive Stay",
    quote:
      "A serviced apartment in Westlands, a punctual driver, and a concierge who anticipated every logistics change. Exactly what a business trip should feel like.",
    stars: 5,
  },
];
