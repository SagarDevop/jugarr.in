"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/posts";

const categories = ["ALL", "EARN", "SELL", "CAMPUS LIFE"];

export default function BlogIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === "ALL" ||
      post.category.toUpperCase() === activeCategory.toUpperCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Header />
      <main>
        <section className="blog-index-section">
          <div className="container">
            {/* Journal Header */}
            <div className="blog-header">
              <span className="blog-journal-tag font-mono">
                THE CAMPUS HUSTLE JOURNAL
              </span>
              <h1 className="blog-main-title">
                Insights, Guides &amp; Student Stories
              </h1>
              <p className="font-body text-muted" style={{ maxWidth: "600px", fontSize: "18px", lineHeight: "1.6" }}>
                Learn how to buy, sell, earn, and build opportunities inside your campus community. Written by students, for students.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="blog-search-filters">
              <div className="blog-search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search articles, keywords, topics..."
                  className="blog-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="blog-filter-tags">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`blog-filter-tag ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Blog Grid */}
            {filteredPosts.length > 0 ? (
              <div className="blog-grid">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="blog-card"
                  >
                    <div className="blog-card-meta">
                      <span className="blog-card-category font-mono">
                        {post.category}
                      </span>
                      <span className="blog-card-readtime font-mono">
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="blog-card-title">{post.title}</h2>
                    <p className="blog-card-excerpt">{post.excerpt}</p>

                    <div className="blog-card-footer">
                      <span className="blog-card-date">{post.date}</span>
                      <span className="blog-card-link font-mono">
                        READ ARTICLE <span className="blog-card-arrow">&rarr;</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  border: "1px dashed var(--color-outline-variant)",
                  backgroundColor: "var(--color-surface-low)",
                }}
              >
                <p className="font-mono text-outline" style={{ fontSize: "14px" }}>
                  NO ARTICLES FOUND MATCHING YOUR SEARCH
                </p>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "16px", padding: "8px 24px" }}
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("ALL");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
