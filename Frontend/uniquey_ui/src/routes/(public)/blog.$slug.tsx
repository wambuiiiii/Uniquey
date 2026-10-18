import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CTABanner } from "@/components/cta-banner";
import { blogMap, type BlogPost } from "@/lib/blog";

export const Route = createFileRoute("/(public)/blog/$slug")({
  loader: ({ params }) => {
    const post = blogMap[params.slug];
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: post.seo.title },
        { name: "description", content: post.seo.description },
        { property: "og:title", content: post.seo.title },
        { property: "og:description", content: post.seo.description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: BlogPostView,
});

function BlogPostView() {
  const { post } = Route.useLoaderData() as { post: BlogPost };
  return (

      <>
          <article className="container-wide max-w-3xl pt-24 pb-16">
              <Link to="/blog" className="mb-6 inline-block text-sm text-forest hover:underline">
                  ← All articles
              </Link>
              <p className="mb-3 text-xs uppercase tracking-widest text-forest">{post.category}</p>
              <h1 className="text-balance text-4xl md:text-5xl">{post.title}</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString(undefined, {year: "numeric", month: "long", day: "numeric"})}
                  {" · "}
                  {post.readTime} read
              </p>
              <div className="prose prose-lg mt-10 max-w-none space-y-5 text-foreground/90">
                  <p className="text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  {post.body.map((p, i) => (
                      <p key={i} className="text-lg leading-relaxed">
                          {p}
                      </p>
                  ))}
              </div>
          </article>
          <CTABanner headline="Planning a trip like this?"
                     sub="Let us handle it — from your first inquiry to your last day."/></>

  );
}
