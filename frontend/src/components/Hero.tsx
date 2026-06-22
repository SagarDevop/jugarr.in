import heroImg from "@/assets/hero1.png";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  
  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="container hero">
      <div className="hero-content">
        <div 
          className="hero-referral-badge"
          onClick={() => navigate("/success")}
        >
          <span className="live-pulse"></span>
          <span>🔥 Free Merch Alert: Get T-Shirt, Notebook & Pen! Invite friends to climb rank &rarr;</span>
        </div>
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
        <img
          src={heroImg}
          alt="Jugarr – India's student-to-student campus marketplace illustration"
          className="hero-image"
        />
      </div>
    </section>
  );
}
