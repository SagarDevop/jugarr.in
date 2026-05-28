"use client";

import { useEffect, useRef, useState } from "react";

export default function Ideology() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <section
      id="ideology"
      ref={sectionRef}
      className={`ideology-section ${inView ? "reveal-active" : ""}`}
    >
      <div className="container">
        <div className="ideology-layout">
          <div className="ideology-left">
            <span
              className="font-mono text-outline reveal-fade-up"
              style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}
            >
              THE MANIFESTO
            </span>
            <h2 className="ideology-headline font-display reveal-fade-up delay-100">
              "Every problem you have on campus can be solved by another student sitting 50 meters away."
            </h2>
            <div className="reveal-line delay-200"></div>
            <p className="ideology-intro font-body text-muted reveal-fade-up delay-300">
              Jugarr is built on a simple, powerful truth: a university is not just a campus—it is a self-sustaining circular economy of untapped student genius.
            </p>
          </div>
          <div className="ideology-right">
            <div className="ideology-card reveal-fade-up delay-300">
              <span className="ideology-card-num font-mono">01 / RADICAL TRUST</span>
              <h3 className="ideology-card-title font-display">Verified Peers Only</h3>
              <p className="ideology-card-desc font-body text-muted">
                Only verified student profiles can enter the network. No outside spammers, no corporate middlemen. Just a safe, high-trust circle of classmates.
              </p>
            </div>
            <div className="ideology-card reveal-fade-up delay-400">
              <span className="ideology-card-num font-mono">02 / UNTAPPED CAPITAL</span>
              <h3 className="ideology-card-title font-display">The Broke Genius Economy</h3>
              <p className="ideology-card-desc font-body text-muted">
                Turn your exam prep notes, design skills, coding help, or second-hand hostel gear into real capital. Solve immediate problems for others while funding your own student life.
              </p>
            </div>
            <div className="ideology-card reveal-fade-up delay-500">
              <span className="ideology-card-num font-mono">03 / ZERO COMMISSIONS</span>
              <h3 className="ideology-card-title font-display">Radically Direct</h3>
              <p className="ideology-card-desc font-body text-muted">
                No middleman commissions. No corporate apps charging you platform fees. Direct student-to-student exchange, meeting in your library or hostel lobby.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
