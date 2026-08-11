"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "@/assets/logo.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHash, setActiveHash] = useState("");

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

  const handleJoinClick = () => {
    if (location.pathname !== "/") {
      navigate("/#cta");
    } else {
      const el = document.getElementById("cta") || document.querySelector(".cta-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <img
            src={logoImg}
            alt="Jugarr Logo"
            width={36}
            height={36}
            className="logo-img"
          />
          <span>Jugarr</span>
        </Link>
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
        <button className="btn btn-primary" onClick={handleJoinClick}>
          Join Free Waitlist
        </button>
      </div>
    </nav>
  );
}
