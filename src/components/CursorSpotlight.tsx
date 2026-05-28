"use client";

import { useEffect, useRef } from "react";

export default function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let mouseX = -1000;
    let mouseY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isVisible = false;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        spotlight.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      spotlight.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible = true;
      spotlight.style.opacity = "1";
    };

    const updatePosition = () => {
      // Lerp smoothing (0.15 factor for smooth organic inertia)
      currentX += (mouseX - currentX) * 0.15;
      currentY += (mouseY - currentY) * 0.15;

      if (spotlight) {
        spotlight.style.transform = `translate3d(${currentX - 150}px, ${currentY - 150}px, 0)`;
      }

      requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    
    const animFrame = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255, 225, 109, 0.45) 0%, rgba(255, 225, 109, 0.15) 50%, transparent 80%)",
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "multiply",
        transform: "translate3d(-1000px, -1000px, 0)",
        opacity: 0,
        transition: "opacity 0.3s ease",
        willChange: "transform, opacity",
      }}
    />
  );
}
