import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWaitlist } from "@/context/WaitlistContext.jsx";
import logoImg from "@/assets/logo.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isJoined, user } = useWaitlist();
  const [activeHash, setActiveHash] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/blog")) {
      setActiveHash("/blog");
    } else if (location.hash) {
      setActiveHash(location.hash);
    } else if (location.pathname === "/") {
      if (window.scrollY < 100) {
        setActiveHash("");
      }
    }
    // Close mobile menu on route change
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = ["ecosystem", "how-it-works", "stories"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveHash(`#${id}`);
            }
          });
        },
        {
          rootMargin: "-30% 0px -60% 0px",
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".navbar")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [menuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleCtaClick = () => {
    setMenuOpen(false);
    if (isJoined && user?.email) {
      navigate(`/success?email=${encodeURIComponent(user.email)}`);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/#cta");
    } else {
      const el = document.getElementById("cta") || document.querySelector(".cta-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavLinkClick = () => {
    setMenuOpen(false);
  };

  const [lookupModalOpen, setLookupModalOpen] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const { saveUser } = useWaitlist();

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalEmail.trim()) return;

    setModalLoading(true);
    setModalError("");

    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/waitlist/status?email=${encodeURIComponent(modalEmail.trim().toLowerCase())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "No registration found for this email.");
        setModalLoading(false);
        return;
      }

      saveUser(data);
      setLookupModalOpen(false);
      setModalLoading(false);
      navigate(`/success?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      console.error("Modal lookup error:", err);
      setModalError("Network error. Please try again.");
      setModalLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="logo">
            <img
              src={logoImg}
              alt="Jugarr Logo"
              width={41}
              height={41}
              className="logo-img"
            />
            <span>Jugarr</span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-links">
            <Link
              to="/#ecosystem"
              className={`nav-link ${activeHash === "#ecosystem" ? "active" : ""}`}
            >
              Ecosystem
            </Link>
            <Link
              to="/#how-it-works"
              className={`nav-link ${activeHash === "#how-it-works" ? "active" : ""}`}
            >
              How it Works
            </Link>
            <Link
              to="/#stories"
              className={`nav-link ${activeHash === "#stories" ? "active" : ""}`}
            >
              Our Story
            </Link>
            <Link
              to="/blog"
              className={`nav-link ${activeHash === "/blog" ? "active" : ""}`}
            >
              Blog
            </Link>
          </div>

          {/* Right side: CTA button + hamburger on mobile */}
          <div className="navbar-right" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!isJoined && (
              <button
                type="button"
                onClick={() => setLookupModalOpen(true)}
                className="font-mono"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "11px",
                  color: "var(--color-outline)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  padding: "4px 6px",
                  display: "none", // Will be shown on desktop
                }}
                id="header-already-joined-btn"
              >
                Already Joined?
              </button>
            )}
            <style>{`
              @media (min-width: 768px) {
                #header-already-joined-btn {
                  display: block !important;
                }
              }
            `}</style>
            <button className="btn btn-primary navbar-cta" onClick={handleCtaClick}>
              {ctaButtonText}
            </button>
            <button
              className={`hamburger-btn ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <div className={`nav-mobile-menu ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
          <div className="nav-mobile-links">
            <Link
              to="/#ecosystem"
              className={`nav-mobile-link ${activeHash === "#ecosystem" ? "active" : ""}`}
              onClick={handleNavLinkClick}
            >
              Ecosystem
            </Link>
            <Link
              to="/#how-it-works"
              className={`nav-mobile-link ${activeHash === "#how-it-works" ? "active" : ""}`}
              onClick={handleNavLinkClick}
            >
              How it Works
            </Link>
            <Link
              to="/#stories"
              className={`nav-mobile-link ${activeHash === "#stories" ? "active" : ""}`}
              onClick={handleNavLinkClick}
            >
              Our Story
            </Link>
            <Link
              to="/blog"
              className={`nav-mobile-link ${activeHash === "/blog" ? "active" : ""}`}
              onClick={handleNavLinkClick}
            >
              Blog
            </Link>
          </div>
          <div className="nav-mobile-footer" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleCtaClick}>
              {ctaButtonText}
            </button>
            {!isJoined && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setLookupModalOpen(true);
                }}
                className="font-mono"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "12px",
                  color: "var(--color-outline)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Already Joined? Check Your Rank &rarr;
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Already Joined Member Lookup Modal */}
      {lookupModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setLookupModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "var(--color-surface-lowest)",
              border: "2px solid var(--color-primary)",
              boxShadow: "10px 10px 0px 0px var(--color-yellow-accent)",
              padding: "32px 24px",
              maxWidth: "460px",
              width: "100%",
              position: "relative",
              textAlign: "left",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLookupModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                fontWeight: "bold",
                color: "var(--color-primary)",
              }}
            >
              ✕
            </button>

            <span className="font-mono text-outline" style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              WAITLIST MEMBER LOGIN
            </span>
            <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "8px" }}>
              Check Your Queue Status
            </h3>
            <p className="font-body text-muted" style={{ fontSize: "13px", marginBottom: "20px" }}>
              Already registered in the waitlist? Enter your registered email to immediately retrieve your referral rank and rewards link.
            </p>

            <form onSubmit={handleModalSubmit}>
              <div style={{ display: "flex", border: "1px solid var(--color-primary)", marginBottom: "12px", backgroundColor: "var(--color-surface-low)" }}>
                <input
                  type="email"
                  placeholder="YOUR REGISTERED EMAIL"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  style={{
                    flexGrow: 1,
                    padding: "14px",
                    border: "none",
                    background: "transparent",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "12px",
                    outline: "none",
                    color: "var(--color-primary)",
                  }}
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="font-mono"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    border: "none",
                    padding: "0 20px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {modalLoading ? "..." : "CHECK \u2192"}
                </button>
              </div>
              {modalError && (
                <p className="font-mono" style={{ color: "#ff3b30", fontSize: "11px", marginBottom: "12px" }}>
                  {modalError}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
