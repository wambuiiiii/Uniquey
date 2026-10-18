import { createFileRoute, Link } from "@tanstack/react-router";
import { CTABanner } from "@/components/cta-banner";
import { blogPosts } from "@/lib/blog";

export const Route = createFileRoute("/(public)/blog/")({
  head: () => ({
    meta: [
      { title: "Kenya Travel Tips · UNIQUEY Blog" },
      {
        name: "description",
        content:
          "Practical Kenya travel tips: JKIA airport guide, best areas to stay in Nairobi, first-time visitor advice and more.",
      },
      { property: "og:title", content: "Kenya Travel Tips · UNIQUEY Blog" },
      { property: "og:description", content: "Get to know Kenya before you land." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  return (

      <>
          <section className="container-wide pt-24 pb-10">
              <p className="mb-3 text-sm uppercase tracking-widest text-forest">Travel Tips</p>
              <h1 className="max-w-3xl text-balance text-4xl md:text-6xl">
                  Get to know Kenya before you land.
              </h1>
          </section>
          <section className="container-wide grid gap-6 pb-24 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                  <Link
                      key={post.slug}
                      to="/blog/$slug"
                      params={{slug: post.slug}}
                      className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]"
                  >
                      <p className="mb-3 text-xs uppercase tracking-widest text-forest">{post.category}</p>
                      <h2 className="mb-3 text-xl leading-tight group-hover:text-forest">{post.title}</h2>
                      <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                      <p className="mt-5 text-xs text-muted-foreground">{post.readTime} read</p>
                  </Link>
              ))}
          </section>
          <CTABanner/></>

  );
}
