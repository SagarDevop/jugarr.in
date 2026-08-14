"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleJoinClick = () => {
    setMenuOpen(false);
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

  return (
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
        <div className="navbar-right">
          <button className="btn btn-primary navbar-cta" onClick={handleJoinClick}>
            Join Free Waitlist
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
        <div className="nav-mobile-footer">
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleJoinClick}>
            Join Free Waitlist
          </button>
        </div>
      </div>
    </nav>
  );
}
