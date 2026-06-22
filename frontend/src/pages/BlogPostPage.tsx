import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/posts";
import { useSEO } from "@/hooks/useSEO";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useSEO({
    title: post ? `${post.seoTitle} | Jugarr Blog` : "Article Not Found | Jugarr Blog",
    description: post?.seoDescription || "Read article on Jugarr student marketplace blog.",
    keywords: post?.keywords || [],
  });

  if (!post) {
    return (
      <>
        <Header />
        <main>
          <section className="blog-post-section" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="container" style={{ textAlign: "center" }}>
              <h1 className="blog-post-title" style={{ marginBottom: "24px" }}>Article Not Found</h1>
              <p className="font-body text-muted" style={{ marginBottom: "32px" }}>
                The article you are looking for does not exist or has been moved.
              </p>
              <Link to="/blog" className="btn btn-primary" style={{ textDecoration: "none" }}>
                Back to Journal
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // Get related posts (exclude current)
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  // Article JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.seoDescription,
    "datePublished": new Date(post.date).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Jugarr",
      "url": "https://jugarr.in",
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jugarr",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jugarr.in/assets/logo.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://jugarr.in/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <section className="blog-post-section">
          <div className="container">
            {/* Back Button */}
            <Link to="/blog" className="blog-post-back" style={{ textDecoration: "none" }}>
              <span>&larr; BACK TO JOURNAL</span>
            </Link>

            {/* Post Header */}
            <article className="blog-post-header">
              <span className="blog-card-category font-mono">
                {post.category}
              </span>
              <h1 className="blog-post-title">{post.title}</h1>
              
              <div className="blog-post-meta">
                <div className="blog-post-meta-item">
                  BY <strong>{post.author}</strong>
                </div>
                <div className="blog-post-meta-item">
                  PUBLISHED <strong>{post.date}</strong>
                </div>
                <div className="blog-post-meta-item">
                  READ TIME <strong>{post.readTime}</strong>
                </div>
              </div>
            </article>

            {/* Post Layout */}
            <div className="blog-post-layout">
              <div className="blog-post-main">
                {/* Article Body */}
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* High Conversion CTA */}
                <div className="blog-cta-block">
                  <h3 className="blog-cta-title">
                    Ready to Buy, Sell &amp; Earn on Your Campus?
                  </h3>
                  <p className="blog-cta-desc">
                    Join verified students from your college on Jugarr. List your old textbooks, trade study notes, sell hostel essentials, or offer your skills without any platform fees.
                  </p>
                  <div>
                    <Link
                      to="/#hero"
                      className="btn btn-primary"
                      style={{ textDecoration: "none" }}
                    >
                      Join Jugarr Waitlist — Free &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="related-posts-section">
                <h3 className="related-posts-title">More from the Journal</h3>
                <div className="blog-grid">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/blog/${p.slug}`}
                      className="blog-card"
                    >
                      <div className="blog-card-meta">
                        <span className="blog-card-category font-mono">
                          {p.category}
                        </span>
                        <span className="blog-card-readtime font-mono">
                          {p.readTime}
                        </span>
                      </div>
                      <h4 className="blog-card-title">{p.title}</h4>
                      <p className="blog-card-excerpt">{p.excerpt}</p>
                      <div className="blog-card-footer">
                        <span className="blog-card-date">{p.date}</span>
                        <span className="blog-card-link font-mono">
                          READ ARTICLE <span className="blog-card-arrow">&rarr;</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
