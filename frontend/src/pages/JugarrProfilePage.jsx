import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import PageLoader from "@/components/PageLoader.jsx";
import { useSEO } from "@/hooks/useSEO.js";
import { getApiBaseUrl } from "@/lib/api.js";

const fallbackProfiles = {
  "sagar-singh": {
    name: "Sagar Singh",
    slug: "sagar-singh",
    role: "Founding Jugarr Contributor & Lead Developer",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    shortBio: "Building full-stack architecture and student marketplace technology to empower campus micro-economies across India.",
    longBio: "Sagar Singh is a tech enthusiast and product architect passionate about solving real-world challenges for college students. At Jugarr, he spearheads platform engineering, backend scalability, and seamless user experiences.",
    journey: "Sagar joined Jugarr on day one, recognizing that students across colleges were trading books, services, and gadgets through fragmented messaging apps. He helped architect Jugarr's core student marketplace engine.",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    twitter: "https://x.com",
    joinedDate: "Aug 2024",
    featured: true,
  },
  "prince-kumar": {
    name: "Prince Kumar",
    slug: "prince-kumar",
    role: "Founding Contributor & Community Strategist",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    shortBio: "Fostering campus relationships, ambassador networks, and student engagement programs across partner universities.",
    longBio: "Prince Kumar focuses on community growth and outreach strategy. He works closely with campus leaders to launch peer-to-peer trading hubs and student skill showcases.",
    journey: "Prince spearheaded the initial campus outreach initiative for Jugarr, establishing founding student groups and gathering feedback that shaped the platform's core identity.",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    joinedDate: "Sep 2024",
    featured: true,
  },
  "rahul-verma": {
    name: "Rahul Verma",
    slug: "rahul-verma",
    role: "UI/UX & Product Design Contributor",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    shortBio: "Crafting intuitive visual systems, glassmorphism interfaces, and accessible design patterns for the Jugarr ecosystem.",
    longBio: "Rahul Verma is a UI/UX designer who believes that digital tools for students should be visual, fast, and empowering. He translates complex requirements into clean component systems.",
    journey: "Rahul collaborated on Jugarr's early design system, ensuring mobile-first responsiveness and dark-mode light theme harmonious aesthetics.",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    joinedDate: "Oct 2024",
  },
};

export default function JugarrProfilePage() {
  const API_BASE = getApiBaseUrl();
  const { slug } = useParams();
  const fallback = fallbackProfiles[slug];

  const [person, setPerson] = useState(fallback || null);
  const [loading, setLoading] = useState(!fallback);

  useEffect(() => {
    fetch(`${API_BASE}/api/jugarris/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Contributor profile not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.contributor) {
          setPerson(data.contributor);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Could not fetch contributor profile from API, using fallback:", err);
        setLoading(false);
      });
  }, [slug, API_BASE]);

  const profileUrl = `https://jugarr.in/meet-the-jugarris/${slug}`;

  useSEO({
    title: person
      ? `${person.name} | ${person.role || "Jugarr Contributor"}`
      : "Contributor Profile | Jugarr",
    description: person
      ? `Learn more about ${person.name}, an early contributor helping shape the future of Jugarr.`
      : "Meet the contributors, creators, and community members behind Jugarr.",
    canonicalUrl: profileUrl,
    ogType: "profile",
    ogImage: person?.profileImage || "https://jugarr.in/opengraph-image.png",
    robots: "index, follow",
  });

  // Inject Schema.org Person JSON-LD into document head
  useEffect(() => {
    if (!person) return;

    const sameAsUrls = [
      person.linkedin,
      person.github,
      person.twitter,
      person.instagram,
      person.website,
    ].filter(Boolean);

    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": person.name,
      "url": profileUrl,
      "image": person.profileImage || "https://jugarr.in/opengraph-image.png",
      "jobTitle": person.role || "Jugarr Contributor",
      "worksFor": {
        "@type": "Organization",
        "name": "Jugarr",
        "url": "https://jugarr.in"
      },
      "description": person.shortBio || person.longBio,
      "sameAs": sameAsUrls,
    };

    const profilePageSchema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": personSchema,
      "url": profileUrl,
      "name": `${person.name} | Jugarr Contributor`,
    };

    let scriptEl = document.querySelector("#person-jsonld-schema");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "person-jsonld-schema";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(profilePageSchema);

    return () => {
      if (scriptEl) scriptEl.remove();
    };
  }, [person, profileUrl]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PageLoader message="LOADING PROFILE..." />
        </main>
        <Footer />
      </>
    );
  }

  if (!person) {
    return (
      <>
        <Header />
        <main>
          <section style={{ minHeight: "60vh", padding: "80px 0", textAlign: "center" }}>
            <div className="container">
              <h1 className="font-display" style={{ fontSize: "36px", marginBottom: "16px" }}>
                Contributor Not Found
              </h1>
              <p className="font-body text-muted" style={{ marginBottom: "32px" }}>
                The profile you are looking for does not exist or has been updated.
              </p>
              <Link to="/meet-the-jugarris" className="btn btn-primary">
                &larr; Back to Meet The Jugarris
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const socialList = [
    { label: "LinkedIn", url: person.linkedin, icon: "linkedin" },
    { label: "GitHub", url: person.github, icon: "github" },
    { label: "Twitter / X", url: person.twitter, icon: "twitter" },
    { label: "Instagram", url: person.instagram, icon: "instagram" },
    { label: "Website", url: person.website, icon: "website" },
  ].filter((s) => Boolean(s.url));

  return (
    <>
      <Header />
      <main className="jugarr-profile-page">
        {/* Breadcrumb Navigation */}
        <div className="container" style={{ paddingTop: "24px" }}>
          <nav className="jugarr-breadcrumb font-mono">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/meet-the-jugarris">Meet The Jugarris</Link>
            <span>/</span>
            <span className="active">{person.name}</span>
          </nav>
        </div>

        {/* Profile Banner / Header */}
        <section className="profile-hero-section">
          <div className="container">
            <div className="profile-hero-card">
              <div className="profile-hero-avatar-wrapper">
                <img
                  src={person.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                  alt={person.name}
                  className="profile-hero-avatar"
                />
              </div>

              <div className="profile-hero-info">
                <div className="profile-hero-tags">
                  <span className="badge-pill font-mono">{person.role || "Jugarr Contributor"}</span>
                  {person.joinedDate && (
                    <span className="badge-joined font-mono">Joined {person.joinedDate}</span>
                  )}
                </div>

                <h1 className="profile-hero-name font-display">{person.name}</h1>
                <p className="profile-hero-bio font-body">{person.shortBio}</p>

                {/* Social Quick Bar */}
                {socialList.length > 0 && (
                  <div className="profile-hero-socials">
                    <span className="font-mono text-muted" style={{ fontSize: "12px", textTransform: "uppercase" }}>Connect:</span>
                    {socialList.map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-social-pill font-mono"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Story & Detailed Bio Sections */}
        <section className="profile-details-section">
          <div className="container">
            <div className="profile-details-grid">
              <div className="profile-main-content">
                {/* About Section */}
                <div className="profile-content-block">
                  <h2 className="profile-section-title font-display">About</h2>
                  <div className="profile-section-line"></div>
                  <div className="profile-section-body font-body">
                    {person.longBio ? (
                      person.longBio.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))
                    ) : (
                      <p>{person.shortBio}</p>
                    )}
                  </div>
                </div>

                {/* Journey With Jugarr Section */}
                <div className="profile-content-block" style={{ marginTop: "40px" }}>
                  <h2 className="profile-section-title font-display">Journey With Jugarr</h2>
                  <div className="profile-section-line"></div>
                  <div className="profile-section-body font-body">
                    {person.journey ? (
                      person.journey.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))
                    ) : (
                      <p>
                        {person.name} joined Jugarr as a key community contributor, helping build the platform's vision of campus micro-economies and peer-to-peer student trust across India.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="profile-sidebar">
                <div className="profile-sidebar-card">
                  <h3 className="font-display">Contributor Details</h3>
                  <div className="profile-stat-row">
                    <span className="font-mono text-muted">Role:</span>
                    <span className="font-body font-medium">{person.role || "Contributor"}</span>
                  </div>
                  <div className="profile-stat-row">
                    <span className="font-mono text-muted">Member Since:</span>
                    <span className="font-body font-medium">{person.joinedDate || "Day 1"}</span>
                  </div>

                  <h4 className="font-display" style={{ marginTop: "24px", marginBottom: "12px", fontSize: "16px" }}>
                    Connect
                  </h4>
                  <div className="profile-connect-list">
                    {socialList.map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-connect-item font-body"
                      >
                        <span>{s.label}</span>
                        <span className="arrow">&rarr;</span>
                      </a>
                    ))}
                  </div>

                  <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--color-border-subtle)" }}>
                    <Link to="/meet-the-jugarris" className="btn btn-secondary btn-full font-mono">
                      &larr; All Jugarris
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Internal Linking & Call to Action */}
        <section className="profile-footer-links-section">
          <div className="container">
            <div className="profile-footer-links-card">
              <h3 className="font-display">Explore the Jugarr Ecosystem</h3>
              <p className="font-body text-muted">
                Discover more about Jugarr's student marketplace, open career positions, and campus updates.
              </p>
              <div className="profile-nav-links font-mono">
                <Link to="/">Home</Link>
                <Link to="/#about-jugarr">About</Link>
                <Link to="/blog">Blog</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/meet-the-jugarris">Meet The Jugarris Directory</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
