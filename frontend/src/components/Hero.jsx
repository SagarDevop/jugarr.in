import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWaitlist } from "@/context/WaitlistContext.jsx";

export default function Hero() {
  const navigate = useNavigate();
  const { isJoined, user } = useWaitlist();
  const [wordIndex, setWordIndex] = useState(0);
  const animatedWords = ["Learn.", "Earn.", "Buy.", "Sell.", "Collab.", "Grow."];

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [animatedWords.length]);

  const scrollToSection = (selector) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleBadgeClick = () => {
    if (isJoined && user?.email) {
      navigate(`/success?email=${encodeURIComponent(user.email)}`);
    } else {
      navigate("/success");
    }
  };

  const handlePrimaryClick = () => {
    if (isJoined && user?.email) {
      navigate(`/success?email=${encodeURIComponent(user.email)}`);
    } else {
      scrollToSection(".cta-section");
    }
  };

  const collegeMarqueeItems = [
    { icon: "", label: "NIT Trichy" },
    { icon: "", label: "IITs & NITs" },
    { icon: "", label: "DTU Delhi" },
    { icon: "", label: "NMIMS Mumbai" },
    { icon: "", label: "Chitkara University" },
    { icon: "", label: "Amity University" },
    { icon: "", label: "IIT Bombay" },
    { icon: "", label: "SRCC Delhi" },
    { icon: "", label: "BITS Pilani" },
    { icon: "", label: "VIT Vellore" },
    { icon: "", label: "Thapar University" },
    { icon: "", label: "MCU Bhopal" },
  ];

  return (
    <section id="hero" className="hero" aria-label="Jugarr Hero Section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Area: Compact Impact Counter / Referral Badge, Typography, CTAs, Features Bar */}
          <div className="hero-content">
            {/* Top Referral Badge - Compact Capsule */}
            <div 
              className="hero-referral-badge" 
              role="button" 
              aria-label="Waitlist Reward Status"
              onClick={handleBadgeClick}
            >
              <span className="live-pulse" aria-hidden="true" />
              <span>
                {isJoined
                  ? `🎉 You're in the queue ${user?.rank ? `(#${user.rank})` : ""}! Tap to view your referrals & rewards \u2192`
                  : "🔥 Free Merch Alert: Get T-Shirt, Notebook & Pen! Invite friends to climb rank \u2192"}
              </span>
            </div>

            {/* Main Title with Smooth Rotating Word Animation */}
            <div>
              <h1 className="hero-title">
                <span>India&apos;s Student</span>
                <br />
                <span>Marketplace to</span>{" "}
                <span className="hero-title-highlight animated-word-wrapper">
                  <span key={wordIndex} className="animated-word">
                    {animatedWords[wordIndex]}
                  </span>
                </span>
              </h1>
            </div>

            {/* Subtitle / Value Proposition */}
            <p className="hero-subtitle">
              India&apos;s all-in-one student platform to buy, sell, offer services, find internships, join communities, and grow together with <span className="subtitle-highlight">verified students</span>.
            </p>

            {/* High-Conversion CTA Buttons */}
            <div className="hero-actions">
              <button
                className="hero-btn-primary"
                onClick={handlePrimaryClick}
                aria-label={isJoined ? "See Your Referrals" : "Join the Waitlist - It's Free"}
              >
                <span>{isJoined ? "SEE YOUR REFERRALS" : "JOIN THE WAITLIST - IT'S FREE"}</span>
                <span aria-hidden="true">→</span>
              </button>
              <button
                className="hero-btn-secondary"
                onClick={() => scrollToSection("#how-it-works")}
                aria-label="See How It Works"
              >
                <span>SEE HOW IT WORKS</span>
                <span className="play-triangle" aria-hidden="true">▶</span>
              </button>
            </div>


          </div>

          {/* Right Area: Looping Video Showcase (Large & Blending seamlessly) */}
          <div className="hero-media">
            <div className="hero-video-wrapper">
              <div className="video-frame">
                <img
                  src="/hero.png"
                  alt="Jugarr App and Marketplace image Showcase"
                  className="hero-media-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Marquee Conveyor Belt */}
      <div className="hero-marquee-belt" role="region" aria-label="College Trust Conveyor Belt">
        <div className="marquee-track">
          {/* Group 1 */}
          <div className="marquee-group">
            {collegeMarqueeItems.map((item, index) => (
              <div key={`g1-${index}`} className="marquee-pill">
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          {/* Group 2 (Duplicate for seamless infinite scroll loop) */}
          <div className="marquee-group" aria-hidden="true">
            {collegeMarqueeItems.map((item, index) => (
              <div key={`g2-${index}`} className="marquee-pill">
                <span className="marquee-icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
