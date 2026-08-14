import heroImg from "@/assets/hero1.png";
import { useNavigate } from "react-router-dom";
import { useWaitlist } from "@/context/WaitlistContext.jsx";

export default function Hero() {
  const navigate = useNavigate();
  const { isJoined, user } = useWaitlist();
  
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

  return (
    <section id="hero" className="container hero">
      <div className="hero-content">
        <div 
          className="hero-referral-badge"
          onClick={handleBadgeClick}
        >
          <span className="live-pulse"></span>
          <span>
            {isJoined
              ? `🎉 You're in the queue ${user?.rank ? `(#${user.rank})` : ""}! Tap to view your referrals & rewards \u2192`
              : "🔥 Free Merch Alert: Get T-Shirt, Notebook & Pen! Invite friends to climb rank \u2192"}
          </span>
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
          <button className="btn btn-primary" onClick={handlePrimaryClick}>
            {isJoined ? "See Your Referrals \u2192" : "Join the Waitlist — It\u2019s Free"}
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
