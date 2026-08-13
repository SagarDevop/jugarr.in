import React, { useState } from "react";
import jugguImg from "../assets/jugguu.png";
import "./JugarrCardModal.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function JugarrCardModal({ person, isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !person) return null;

  const downloadFileName = `jugarr-${person.slug}-card.png`;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(`${API_BASE}/api/jugarris/${person.slug}/card?download=true&t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch card image");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Card download error:", err);
      // Direct window fallback
      window.open(`${API_BASE}/api/jugarris/${person.slug}/card?download=true&t=${Date.now()}`, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const profileImgSrc = person.profileImage
    ? (person.profileImage.startsWith("/uploads")
        ? `${API_BASE}${person.profileImage}`
        : person.profileImage)
    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `https://jugarr.in/meet-the-jugarris/${person.slug}`
  )}`;

  const badgeCleanText = (person.badge || "Founding Contributor").replace(/[🏆🚀⭐]\s*/g, "");

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Actions */}
        <div className="card-modal-topbar">
          <div className="card-modal-title">
            <span className="card-modal-badge font-mono">OFFICIAL IDENTITY CARD</span>
          </div>
          <button className="card-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Card Reference Design 1:1 Display */}
        <div className="jugarr-id-card-wrapper">
          <div className="jugarr-id-card">
            {/* Card Top Header */}
            <div className="id-card-header">
              <div className="id-card-brand">
                <img src={jugguImg} alt="Jugarr Mascot" className="id-card-mascot" />
                <span className="id-card-logo-text font-display">JUGARR</span>
              </div>
              <div className="id-card-role font-display">
                {person.role || "Contributor"}
              </div>
            </div>

            {/* Avatar Circle */}
            <div className="id-card-avatar-container">
              <div className="id-card-avatar-ring">
                <img
                  src={profileImgSrc}
                  alt={person.name}
                  className="id-card-avatar-img"
                />
              </div>
            </div>

            {/* Name & Short Bio */}
            <div className="id-card-info">
              <h2 className="id-card-name font-display">{person.name}</h2>
              <p className="id-card-bio font-body">
                {person.shortBio || "Building India’s student-driven ecosystem."}
              </p>
            </div>

            {/* Golden Achievement Badge Box */}
            <div className="id-card-achievement-box">
              <div className="id-card-achievement-seal">
                <span>👑</span>
              </div>
              <div className="id-card-achievement-sub font-mono">── ACHIEVEMENT ──</div>
              <div className="id-card-achievement-title font-display">
                {badgeCleanText}
              </div>
              <div className="id-card-achievement-tagline font-body">
                Building the future of student opportunities
              </div>
              <div className="id-card-achievement-stars">
                ★ ★ ★ ★ ★
              </div>
              <span className="wreath-icon wreath-left">🌾</span>
              <span className="wreath-icon wreath-right">🌾</span>
            </div>

            {/* Middle 2-Column Grid (Joined & QR Code) */}
            <div className="id-card-grid">
              <div className="id-card-col id-card-col-left">
                <div className="id-card-joined-container">
                  <div className="id-card-cal-box">📅</div>
                  <div className="id-card-joined-info">
                    <span className="id-card-label font-body">Joined</span>
                    <span className="id-card-val font-display">{person.joinedDate || "May 2026"}</span>
                  </div>
                </div>
              </div>

              <div className="id-card-divider"></div>

              <div className="id-card-col id-card-col-right">
                <span className="id-card-label font-body">Scan Profile</span>
                <div className="id-card-qr-box">
                  <img src={qrUrl} alt="QR Code" className="id-card-qr-img" />
                </div>
              </div>
            </div>

            {/* Horizontal Line */}
            <div className="id-card-footer-line"></div>

            {/* Footer Text */}
            <div className="id-card-footer">
              <p className="id-card-footer-sub font-body">Building India’s Student-Driven Ecosystem</p>
              <p className="id-card-footer-url font-display">jugarr.in</p>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="card-modal-actions">
          <button
            className="btn-download-card font-display"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className="spinner-icon">⏳</span> Generating PNG...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download My Jugarr Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
