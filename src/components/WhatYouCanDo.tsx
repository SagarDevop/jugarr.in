"use client";

import { useEffect, useRef, useState } from "react";

const actions = [
  {
    num: "01",
    label: "BUY",
    title: "Buy What You Need",
    desc: "Find affordable second-hand books, furniture, gadgets, and cycles listed by students on your campus. Save money on everything from textbooks to hostel essentials.",
    actionText: "BROWSE ITEMS",
  },
  {
    num: "02",
    label: "SELL",
    title: "Sell What You Don’t",
    desc: "Turn unused items into cash. List your old books, notes, furniture, or gadgets and reach buyers in your own college.",
    actionText: "START SELLING",
  },
  {
    num: "03",
    label: "EARN",
    title: "Earn From Your Skills",
    desc: "Offer services like graphic design, coding, tutoring, or content writing. Get paid by fellow students who need your talent.",
    actionText: "OFFER SERVICES",
  },
  {
    num: "04",
    label: "LEARN",
    title: "Learn From Peers",
    desc: "Access shared study notes, exam prep material, and project references created by students in your own university.",
    actionText: "ACCESS NOTES",
  },
  {
    num: "05",
    label: "COLLABORATE",
    title: "Collaborate on Projects",
    desc: "Find teammates for hackathons, startups, college fests, and academic projects. Connect with students who complement your skills.",
    actionText: "FIND PARTNERS",
  },
];

export default function WhatYouCanDo() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  const scrollToCTA = () => {
    const el = document.querySelector(".cta-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="what-you-can-do"
      ref={sectionRef}
      className={`wycd-section ${inView ? "reveal-active" : ""}`}
    >
      <div className="container">
        <span
          className="font-mono text-outline reveal-fade-up"
          style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
        >
          THE STUDENT MARKETPLACE
        </span>
        <h2 className="section-title reveal-fade-up delay-100" style={{ textAlign: "left" }}>
          What Can You Do on Jugarr?
        </h2>
        <div className="editorial-line reveal-fade-up delay-200" style={{ marginBottom: "40px" }}></div>

        <div className="wycd-grid">
          {actions.map((action, i) => (
            <div
              key={action.num}
              onClick={scrollToCTA}
              className={`wycd-card reveal-fade-up delay-${(i + 2) * 100}`}
              style={{ cursor: "pointer" }}
            >
              <div className="wycd-card-header">
                <span className="wycd-card-num font-mono">
                  {action.num} / {action.label}
                </span>
              </div>
              <h3 className="wycd-card-title font-display">{action.title}</h3>
              <p className="wycd-card-desc font-body text-muted">{action.desc}</p>
              <div className="wycd-card-footer">
                <span className="wycd-card-action font-mono">
                  {action.actionText} <span className="wycd-arrow">&rarr;</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
