"use client";
import { useEffect, useRef } from "react";

export default function Problem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const floats = containerRef.current.querySelectorAll(".floating-bubble");
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;

      floats.forEach((float, index) => {
        const speed = (index + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        const direction = index % 2 === 0 ? "-" : "";
        const baseRotation = 3 + index;
        (float as HTMLElement).style.transform = `translate(${x}px, ${y}px) rotate(${direction}${baseRotation}deg)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="problem-section" ref={containerRef}>
      <div className="cluster-container container">
        {/* Floating hostel chat bubbles */}
        <div
          className="floating-bubble"
          style={{ top: "0", left: "10%", transform: "rotate(-3deg)" }}
        >
          notes bhej de
        </div>
        <div
          className="floating-bubble"
          style={{ top: "80px", right: "15%", transform: "rotate(5deg)" }}
        >
          bike chahiye
        </div>
        <div
          className="floating-bubble"
          style={{ bottom: "40px", left: "20%", transform: "rotate(-2deg)" }}
        >
          PPT bana de
        </div>
        <div
          className="floating-bubble"
          style={{ top: "40%", right: "5%", transform: "rotate(8deg)" }}
        >
          editor hai?
        </div>
        <div
          className="floating-bubble"
          style={{ bottom: "80px", right: "25%", transform: "rotate(-4deg)" }}
        >
          roommate needed
        </div>

        {/* Central editorial card */}
        <div className="center-card">
          <h2>Students were already helping each other.</h2>
          <div className="editorial-line" style={{ margin: "16px auto" }}></div>
          <p>The system just never existed.</p>
        </div>
      </div>
    </section>
  );
}
