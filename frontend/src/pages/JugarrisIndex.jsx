import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import PageLoader from "@/components/PageLoader.jsx";
import { useSEO } from "@/hooks/useSEO.js";
import { getApiBaseUrl } from "@/lib/api.js";

// Fallback initial data in case database is offline or loading
const fallbackJugarris = [
  {
    _id: "fb-1",
    name: "Sagar Singh",
    slug: "sagar-singh",
    role: "Founding Jugarr Contributor & Lead Developer",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    shortBio: "Building full-stack architecture and student marketplace technology to empower campus micro-economies across India.",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    twitter: "https://x.com",
    featured: true,
    active: true,
  },
  {
    _id: "fb-2",
    name: "Prince Kumar",
    slug: "prince-kumar",
    role: "Founding Contributor & Community Strategist",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    shortBio: "Fostering campus relationships, ambassador networks, and student engagement programs across partner universities.",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    featured: true,
    active: true,
  },
  {
    _id: "fb-3",
    name: "Rahul Verma",
    slug: "rahul-verma",
    role: "UI/UX & Product Design Contributor",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    shortBio: "Crafting intuitive visual systems, glassmorphism interfaces, and accessible design patterns for the Jugarr ecosystem.",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    featured: false,
    active: true,
  },
  {
    _id: "fb-4",
    name: "Ananya Sharma",
    slug: "ananya-sharma",
    role: "Content & Brand Creator",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
    shortBio: "Spearheading student stories, editorial content, and social media campaigns celebrating campus entrepreneurship.",
    instagram: "https://instagram.com",
    twitter: "https://x.com",
    featured: false,
    active: true,
  },
];

export default function JugarrisIndex() {
  const API_BASE = getApiBaseUrl();
  const [jugarris, setJugarris] = useState(fallbackJugarris);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Meet The Jugarris | Contributors & Community Members Behind Jugarr",
    description: "Meet the contributors, creators, supporters, and community members helping build Jugarr from day one.",
    canonicalUrl: "https://jugarr.in/meet-the-jugarris",
    keywords: ["Jugarr contributors", "Meet The Jugarris", "Jugarr team", "Jugarr community", "Student marketplace team"],
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/jugarris`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contributors");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.contributors) && data.contributors.length > 0) {
          setJugarris(data.contributors);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Could not fetch Jugarris from API, using fallback:", err);
        setLoading(false);
      });
  }, [API_BASE]);

  const filteredJugarris = jugarris.filter((person) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.name.toLowerCase().includes(query) ||
      (person.role && person.role.toLowerCase().includes(query)) ||
      (person.shortBio && person.shortBio.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <Header />
      <main className="jugarris-directory-page">
        {/* Hero Section */}
        <section className="jugarris-hero-section">
          <div className="container">
            <div className="jugarris-hero-content">
              <span className="badge-pill font-mono">OUR COMMUNITY ENGINE</span>
              <h1 className="jugarris-h1 font-display">Meet The Jugarris</h1>
              <p className="jugarris-subheading font-body">
                The people helping shape and grow the Jugarr community.
              </p>
              
              {/* Search Bar */}
              <div className="jugarris-search-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="jugarris-search-input"
                  placeholder="Search by name, role, or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contributor Showcase Grid */}
        <section className="jugarris-grid-section">
          <div className="container">
            {loading ? (
              <PageLoader message="LOADING CONTRIBUTORS..." />
            ) : filteredJugarris.length === 0 ? (
              <div className="jugarris-empty-state">
                <h3>No contributors found matching "{searchQuery}"</h3>
                <p>Try searching for a different name or role title.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="btn btn-secondary"
                  style={{ marginTop: "16px" }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="jugarris-grid">
                {filteredJugarris.map((person) => (
                  <div key={person._id || person.slug} className="jugarris-card">
                    <div className="jugarris-card-header">
                      <img
                        src={person.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                        alt={person.name}
                        className="jugarris-card-avatar"
                        loading="lazy"
                      />
                      {person.featured && (
                        <span className="jugarris-featured-badge">Featured</span>
                      )}
                    </div>
                    <div className="jugarris-card-body">
                      <span className="jugarris-card-role font-mono">{person.role || "Contributor"}</span>
                      <h2 className="jugarris-card-name font-display">
                        <Link to={`/meet-the-jugarris/${person.slug}`}>
                          {person.name}
                        </Link>
                      </h2>
                      <p className="jugarris-card-bio font-body">
                        {person.shortBio}
                      </p>
                    </div>
                    <div className="jugarris-card-footer">
                      <div className="jugarris-social-links">
                        {person.linkedin && (
                          <a href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} LinkedIn`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                          </a>
                        )}
                        {person.github && (
                          <a href={person.github} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} GitHub`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                          </a>
                        )}
                        {person.twitter && (
                          <a href={person.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} X / Twitter`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                        )}
                        {person.instagram && (
                          <a href={person.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} Instagram`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                            </svg>
                          </a>
                        )}
                        {person.website && (
                          <a href={person.website} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} Website`}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="2" y1="12" x2="22" y2="12"></line>
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                          </a>
                        )}
                      </div>

                      <Link to={`/meet-the-jugarris/${person.slug}`} className="jugarris-profile-link font-mono">
                        View Profile &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Internal Linking SEO Section */}
        <section className="jugarris-internal-links-section">
          <div className="container">
            <div className="jugarris-internal-links-card">
              <h3 className="font-display">Explore More of Jugarr</h3>
              <p className="font-body text-muted">
                Jugarr is building India's premier student-to-student campus marketplace. Learn more about our mission, open roles, and stories.
              </p>
              <div className="jugarris-links-grid">
                <Link to="/" className="jugarris-nav-btn">Home</Link>
                <Link to="/#about-jugarr" className="jugarris-nav-btn">About Jugarr</Link>
                <Link to="/blog" className="jugarris-nav-btn">Jugarr Blog</Link>
                <Link to="/careers" className="jugarris-nav-btn">Careers at Jugarr</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
