import { createFileRoute } from "@tanstack/react-router";
import { CTABanner } from "@/components/cta-banner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/(public)/faq")({
  head: () => ({
    meta: [
      { title: "FAQ · UNIQUEY Kenya Concierge" },
      {
        name: "description",
        content:
          "Frequently asked questions about UNIQUEY's Kenya travel concierge — pricing, payments, safety, add-ons and more.",
      },
      { property: "og:title", content: "UNIQUEY FAQ" },
      { property: "og:description", content: "Answers to the questions guests ask most." },
    ],
  }),
  component: FAQ,
});

const faqs = [
  { q: "How much does UNIQUEY cost?", a: "Every trip is quoted individually. Accommodation is priced at partner rates plus a transparent concierge fee. We send a written quotation before anything is booked." },
  { q: "How do I book?", a: "Fill out the Plan My Stay form. A concierge contacts you within 24 hours, sends a quotation, and once you accept and pay a deposit, your booking is confirmed." },
  { q: "Is a deposit refundable?", a: "Deposit refund policy depends on the accommodation partner. We disclose the exact terms in your quotation before you pay." },
  { q: "Can UNIQUEY help me during my stay?", a: "Yes — your concierge stays available on WhatsApp for the full trip. Requests range from grocery runs to safari bookings." },
  { q: "Do you serve visitors outside Nairobi?", a: "Nairobi is our primary base, but we regularly coordinate stays and travel to Mombasa, Naivasha, Nanyuki and safari destinations." },
  { q: "How safe are the accommodations?", a: "Every partner apartment is personally vetted. We only work with buildings that have 24/7 security and trusted management." },
  { q: "Do you support long-term stays?", a: "Yes — we regularly host guests for weeks or months. Longer stays typically unlock better rates." },
];

function FAQ() {
  return (
      <>
          <section className="container-wide max-w-3xl pt-24 pb-16">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">FAQ</p>
              <h1 className="text-balance text-4xl md:text-6xl">Answers, before you ask.</h1>
              <Accordion type="single" collapsible className="mt-12">
                  {faqs.map((f, i) => (
                      <AccordionItem key={i} value={`f-${i}`}>
                          <AccordionTrigger className="text-left text-lg">{f.q}</AccordionTrigger>
                          <AccordionContent className="text-base text-muted-foreground">
                              {f.a}
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
          </section>
          <CTABanner/></>
  );
}
