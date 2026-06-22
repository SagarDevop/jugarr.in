import React from "react";

const trustSignals = [
  {
    tag: "SECURE",
    title: "Safe Student Ecosystem",
    desc: "Only verified college students can join. No outside sellers, no spam, no scams.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    tag: "COMMUNITY",
    title: "Community Driven",
    desc: "Built by students, moderated by students. Every transaction happens within your trusted campus circle.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    tag: "0% FEES",
    title: "Zero Platform Fees",
    desc: "No commissions, no hidden charges. Every rupee stays between you and the other student.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    tag: "CAMPUS",
    title: "Campus-First Approach",
    desc: "Jugarr is designed for Indian colleges. Meet in your library, canteen, or hostel lobby — safe and convenient.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
  },
];

export default function Trust() {
  return (
    <section id="trust" className="trust-section">
      <div className="container">
        <span
          className="font-mono text-outline"
          style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
        >
          TRUST & SAFETY
        </span>
        <h2 className="section-title" style={{ textAlign: "left" }}>
          Why Students Trust Jugarr
        </h2>
        <div className="editorial-line" style={{ marginBottom: "40px" }}></div>
        
        <div className="trust-grid">
          {trustSignals.map((signal) => (
            <div key={signal.title} className="trust-card">
              <div className="trust-card-meta">
                <span className="trust-card-tag font-mono">[ {signal.tag} ]</span>
              </div>
              <div className="trust-icon-container">
                {signal.icon}
              </div>
              <h3 className="trust-card-title font-display">{signal.title}</h3>
              <p className="trust-card-desc font-body text-muted">{signal.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
