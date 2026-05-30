"use client";

import Image from "next/image";
import heroImg from "../../public/assets/hero1.png";

export default function Hero() {
  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="container hero">
      <div className="hero-content">
        <div className="editorial-line"></div>
        <h1 className="hero-title">
          <span className="hero-title-segment">India&apos;s Student</span>
          <br className="hero-title-br" />
          <span className="hero-title-segment">Campus Marketplace</span>
        </h1>
        <p className="hero-subtitle">
          Buy and sell books, notes, gadgets, and furniture. Find internships, offer services, and earn — all within your college campus.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => scrollToSection(".cta-section")}>
            Join the Waitlist — It&apos;s Free
          </button>
          <button className="btn btn-secondary" onClick={() => scrollToSection("#how-it-works")}>
            See How It Works
          </button>
        </div>
        <p className="hero-ticker">
          India&apos;s student hustle network — where notes, skills, and money move.
        </p>
      </div>
      <div className="hero-image-container">
        <Image
          src={heroImg}
          alt="Jugarr – India's student-to-student campus marketplace illustration"
          className="hero-image"
          priority
        />
      </div>
    </section>
  );
}
