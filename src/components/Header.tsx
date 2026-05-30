"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../public/assets/logo.png";

export default function Header() {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Run initially

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
      window.removeEventListener("hashchange", handleHashChange);
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="logo" onClick={() => setActiveHash("")}>
          <Image
            src={logoImg}
            alt="Jugarr Logo"
            width={36}
            height={36}
            className="logo-img"
            priority
          />
          <span>Jugarr</span>
        </Link>
        <div className="nav-links">
          <Link
            href="#ecosystem"
            className={`nav-link ${activeHash === "#ecosystem" ? "active" : ""}`}
            onClick={() => setActiveHash("#ecosystem")}
          >
            Ecosystem
          </Link>
          <Link
            href="#how-it-works"
            className={`nav-link ${activeHash === "#how-it-works" ? "active" : ""}`}
            onClick={() => setActiveHash("#how-it-works")}
          >
            How it Works
          </Link>
          <Link
            href="#stories"
            className={`nav-link ${activeHash === "#stories" ? "active" : ""}`}
            onClick={() => setActiveHash("#stories")}
          >
            Our Story
          </Link>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            const el = document.querySelector(".cta-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Join Free Waitlist
        </button>
      </div>
    </nav>
  );
}
