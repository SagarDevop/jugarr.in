"use client";

import Image from "next/image";
import heroImg from "../../public/assets/hero1.png";

export default function Hero() {
  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="container hero">
      <div className="hero-content">
        <div className="editorial-line"></div>
        <h1 className="hero-title">
          India’s Student Hustle Network
        </h1>
        <p className="hero-subtitle">
          Buy, sell, collaborate and earn inside your campus ecosystem.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => scrollToSection(".cta-section")}>
            Join Waitlist
          </button>
          <button className="btn btn-secondary" onClick={() => scrollToSection("#ecosystem")}>
            Explore Ecosystem
          </button>
        </div>
        <p className="hero-ticker">
          Notes move. Skills move. Money moves. Students grow.
        </p>
      </div>
      <div className="hero-image-container">
        <Image
          src={heroImg}
          alt="Jugarr student campus network editorial line illustration"
          className="hero-image"
          priority
        />
      </div>
    </section>
  );
}
