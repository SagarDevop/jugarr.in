import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import PageLoader from "@/components/PageLoader.jsx";
import { useSEO } from "@/hooks/useSEO.js";
import { getApiBaseUrl } from "@/lib/api.js";

export default function JugarrProfilePage() {
  const API_BASE = getApiBaseUrl();
  const { slug } = useParams();

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

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
        console.warn("Could not fetch contributor profile from API:", err);
        setLoading(false);
      });
  }, [slug, API_BASE]);

  const profileUrl = `https://jugarr.in/meet-the-jugarris/${slug}`;
  const ogImageUrl = `https://jugarr.in/api/og/${slug}`;
  const apiOgImageUrl = `${API_BASE}/api/og/${slug}`;

  useSEO({
    title: person
      ? `${person.name} | Jugarr Contributor`
      : "Contributor Profile | Jugarr",
    description: person
      ? person.shortBio || `Learn more about ${person.name}, an early contributor helping shape the future of Jugarr.`
      : "Meet the contributors, creators, and community members behind Jugarr.",
    canonicalUrl: profileUrl,
    ogType: "profile",
    ogImage: ogImageUrl,
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
      "image": ogImageUrl,
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
  }, [person, profileUrl, ogImageUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadCard = async () => {
    if (downloading || !person) return;
    try {
      setDownloading(true);
      const res = await fetch(apiOgImageUrl);
      if (!res.ok) throw new Error("Failed to fetch OG image card");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `jugarr-${person.slug}-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading card:", err);
      // Fallback direct window download
      window.open(apiOgImageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const shareText = person
    ? `Check out ${person.name}'s Jugarr Profile and Digital Identity Card! Building India's student-driven ecosystem.`
    : "Check out this Jugarr Contributor Profile!";

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + profileUrl)}`;

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
                  src={person.profileImage ? (person.profileImage.startsWith("/uploads") ? `${API_BASE}${person.profileImage}` : person.profileImage) : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
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
                  <span className="badge-verified font-mono">&check; Verified Contributor</span>
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

                {/* Main Identity Share & Download Actions */}
                <div className="profile-hero-actions">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="profile-btn-share font-mono"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share My Jugarr Profile</span>
                  </button>

                  <button
                    onClick={handleDownloadCard}
                    disabled={downloading}
                    className="profile-btn-download font-mono"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>{downloading ? "Downloading..." : "Download My Jugarr Card"}</span>
                  </button>
                </div>
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
                        {person.name} joined Jugarr as a key community contributor, helping build the platform&apos;s vision of campus micro-economies and peer-to-peer student trust across India.
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
                  <div className="profile-stat-row">
                    <span className="font-mono text-muted">Status:</span>
                    <span className="font-body font-medium" style={{ color: "#10b981" }}>Verified Contributor</span>
                  </div>

                  {/* Share Card Widget in Sidebar */}
                  <div className="profile-card-widget">
                    <div className="widget-badge font-mono">DIGITAL IDENTITY CARD</div>
                    <p className="widget-text font-body">
                      Share {person.name}&apos;s verified Jugarr card on social networks.
                    </p>
                    <div className="widget-actions">
                      <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="btn btn-primary btn-full font-mono"
                        style={{ fontSize: "13px" }}
                      >
                        Share My Jugarr Profile
                      </button>
                      <button
                        onClick={handleDownloadCard}
                        disabled={downloading}
                        className="btn btn-secondary btn-full font-mono"
                        style={{ marginTop: "8px", fontSize: "12px" }}
                      >
                        {downloading ? "Downloading Card..." : "Download My Jugarr Card"}
                      </button>
                    </div>
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
                Discover more about Jugarr&apos;s student marketplace, open career positions, and campus updates.
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

        {/* Share Profile & Identity Card Modal */}
        {isShareModalOpen && (
          <div className="share-modal-backdrop" onClick={() => setIsShareModalOpen(false)}>
            <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="share-modal-header">
                <div>
                  <span className="share-modal-tag font-mono">DIGITAL IDENTITY CARD</span>
                  <h3 className="share-modal-title font-display">Share Jugarr Profile</h3>
                </div>
                <button
                  className="share-modal-close"
                  onClick={() => setIsShareModalOpen(false)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="share-modal-body">
                {/* Generated Identity Card Live Preview */}
                <div className="share-card-preview-wrapper">
                  <img
                    src={apiOgImageUrl}
                    alt={`${person.name} Jugarr Identity Card`}
                    className="share-card-preview-img"
                  />
                  <div className="share-card-badge font-mono">1200 x 630 &bull; Auto Generated OG Card</div>
                </div>

                <p className="share-modal-desc font-body">
                  Promote {person.name}&apos;s contributor page with automatically generated identity previews optimized for LinkedIn, Twitter/X, WhatsApp &amp; Facebook.
                </p>

                {/* Social Sharing Grid */}
                <div className="share-social-grid">
                  <a
                    href={linkedinShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-social-btn share-btn-linkedin font-mono"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn Share</span>
                  </a>

                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-social-btn share-btn-twitter font-mono"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span>Twitter/X Share</span>
                  </a>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-social-btn share-btn-whatsapp font-mono"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.099 4.019 4.02-1.052z" />
                    </svg>
                    <span>WhatsApp Share</span>
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="share-social-btn share-btn-copy font-mono"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>{copied ? "Link Copied!" : "Copy Profile Link"}</span>
                  </button>
                </div>

                {/* Direct Download Identity Card CTA */}
                <div className="share-modal-footer">
                  <button
                    onClick={handleDownloadCard}
                    disabled={downloading}
                    className="btn btn-primary btn-full font-mono"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>{downloading ? "Preparing PNG Download..." : "Download My Jugarr Card"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
