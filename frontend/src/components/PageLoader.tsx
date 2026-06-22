"use client";

import { useEffect, useState } from "react";

export default function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Lock scrolling on mount
    document.body.style.overflow = "hidden";

    // Kickoff server-side keep-alive self-pinging loop
    fetch("/api/ping").catch((err) => console.error("Keep-alive kickoff failed:", err));

    // Dynamic, organic progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Increment by an organic random step
        const step = Math.floor(Math.random() * 8) + 3;
        const next = prev + step;
        return next > 100 ? 100 : next;
      });
    }, 45);

    return () => {
      clearInterval(interval);
      // Fallback cleanup
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (progress === 100) {
      // Trigger exit animation
      setIsLoaded(true);
      // Wait for exit slide-up transition to finish, then unmount
      const timeout = setTimeout(() => {
        setIsHidden(true);
        document.body.style.overflow = "";
      }, 700); // matches the 0.7s transition in CSS

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  if (isHidden) return null;

  // Staged loading status taglines
  let tagline = "CONNECTING CAMPUS DOTS...";
  if (progress >= 35 && progress < 75) {
    tagline = "ASSEMBLING BROKE GENIUS CAPITAL...";
  } else if (progress >= 75) {
    tagline = "LAUNCHING STUDENT ECONOMY...";
  }

  return (
    <div className={`page-loader-overlay ${isLoaded ? "loader-exit-active" : ""}`}>
      <div className="loader-paper-sheet">
        {/* Giant branding symbol "J" in the background */}
        <div className="loader-giant-j font-display">J</div>

        <div className="loader-inner-content">
          {/* Top Ticker Status */}
          <div className="loader-ticker-header font-mono">
            <span>[ SYSTEM_INIT ]</span>
            <span>JUGARR_NET_v1.0</span>
          </div>

          {/* Central Logo Signature */}
          <div className="loader-logo-title font-display">Jugarr</div>
          
          {/* Staged Message */}
          <div className="loader-tagline font-mono">{tagline}</div>

          {/* High-Contrast Progress Bar */}
          <div className="loader-bar-container">
            <div 
              className="loader-bar-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Monospace percentage counter */}
          <div className="loader-counter font-mono">
            [ HUSTLE_INIT: {progress.toString().padStart(3, "0")}% ]
          </div>
        </div>
      </div>
    </div>
  );
}
