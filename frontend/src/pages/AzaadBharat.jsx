import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { useMusic } from "../context/MusicContext";
import { getApiBaseUrl } from "../lib/api";

/* ─────────── DATA ─────────── */
const QUOTES = [
  { text: "वतन पर जो फिदा होगा, अमर वो नौजवान होगा।", by: "भगत सिंह" },
  { text: "तुम मुझे खून दो, मैं तुम्हें आज़ादी दूँगा।", by: "सुभाष चंद्र बोस" },
  { text: "सरफ़रोशी की तमन्ना अब हमारे दिल में है।", by: "राम प्रसाद बिस्मिल" },
  { text: "स्वतंत्रता कभी दी नहीं जाती, उसे हासिल किया जाता है।", by: "महात्मा गांधी" },
  { text: "मेरा जीवन ही मेरा संदेश है।", by: "महात्मा गांधी" },
  { text: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य न मिले।", by: "स्वामी विवेकानंद" },
  { text: "मैं आज़ाद हूँ, आज़ाद रहूँगा और आज़ाद ही मरूँगा।", by: "चंद्रशेखर आज़ाद" },
  { text: "जय जवान, जय किसान।", by: "लाल बहादुर शास्त्री" },
  { text: "इंकलाब ज़िन्दाबाद!", by: "भगत सिंह" },
  { text: "सत्यमेव जयते — सत्य की सदा विजय होती है।", by: "मुंडक उपनिषद" },
];

const SLOGANS = [
  "भारत माता की जय!",
  "जय हिन्द!",
  "वन्दे मातरम्!",
  "इंकलाब ज़िन्दाबाद!",
  "जय जवान, जय किसान!",
];

const fmt = (s) => {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/* ─────────── EXPORT ROOT ─────────── */
export default function AzaadBharat() {
  const {
    isPlaying,
    meta,
    ytTitle,
    currentTime,
    duration,
    progress,
    playerReady,
    playerError,
    togglePlay,
    next,
    prev,
    seekTo,
    unlock,
  } = useMusic();

  const [quoteIdx, setQuoteIdx]     = useState(0);
  const [quoteVis, setQuoteVis]     = useState(true);
  const [count, setCount]           = useState(40);
  const jgAudioRef                  = useRef(null);
  const eggBuf                      = useRef("");

  /* Dark theme & Browser Title */
  useEffect(() => {
    const html = document.documentElement;
    const prevCls = html.className;
    const prevBg  = document.body.style.cssText;
    const prevTitle = document.title;
    
    html.classList.remove("light");
    document.body.style.cssText = "background:#08070d;overflow:hidden;margin:0;";
    document.title = "आजाद भारत 🇮🇳";
    
    return () => {
      html.className = prevCls;
      document.body.style.cssText = prevBg;
      document.title = prevTitle;
    };
  }, []);

  /* Quote rotation */
  useEffect(() => {
    const id = setInterval(() => {
      setQuoteVis(false);
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteVis(true); }, 600);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  /* Counter - Fetch real active visitor count from backend */
  useEffect(() => {
    let token = sessionStorage.getItem("ab_visitor_token");
    if (!token) {
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem("ab_visitor_token", token);
    }

    const API_BASE = getApiBaseUrl();

    const sendHeartbeat = () => {
      fetch(`${API_BASE}/api/visitors/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data.count === "number") {
            setCount(data.count);
          }
        })
        .catch((err) => {
          // fallback to random dynamic count if backend is down/offline
          setCount(c => Math.max(120, Math.min(480, c + Math.floor(Math.random() * 7) - 3)));
        });
    };

    // Initial heartbeat
    sendHeartbeat();

    // Poll count every 9 seconds
    const id = setInterval(sendHeartbeat, 9000);
    return () => clearInterval(id);
  }, []);

  /* Easter egg */
  useEffect(() => {
    const h = (e) => {
      const k = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(k)) { eggBuf.current = ""; return; }
      eggBuf.current = (eggBuf.current + k).slice(-5);
      if (eggBuf.current === "INDIA") {
        eggBuf.current = "";
        const cols = ["#FF8C00", "#ffffff", "#138808"];
        confetti({ particleCount: 180, spread: 100, colors: cols, zIndex: 9999, startVelocity: 45 });
        setTimeout(() => confetti({ particleCount: 100, spread: 130, colors: cols, zIndex: 9999, decay: 0.91 }), 400);
        if (navigator.vibrate) navigator.vibrate([80, 40, 160]);
      }
    };
    window.addEventListener("keyup", h);
    return () => window.removeEventListener("keyup", h);
  }, []);

  /* Share */
  const share = () => {
    const text = "मैं आजाद भारत पर स्वतंत्रता दिवस मना रहा हूँ 🇮🇳\njugarr.in/azaad-bharat";
    if (navigator.share) navigator.share({ title: "आजाद भारत 🇮🇳", text, url: "https://jugarr.in/azaad-bharat" });
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  /* Jayghosh */
  const fireJayghosh = () => {
    unlock();
    if (!jgAudioRef.current) {
      jgAudioRef.current = new Audio("/bharatmatakijay.mp3");
    }
    jgAudioRef.current.currentTime = 0;
    jgAudioRef.current.play().catch(err => console.log("Audio play failed:", err));
    if (navigator.vibrate) navigator.vibrate([60, 30, 60]);
  };

  /* Seek on progress bar click */
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(ratio);
  };

  let displayTitle  = meta?.title || "Loading...";
  let displayArtist = meta?.artist || "";

  if (ytTitle) {
    const parts = ytTitle.split(/[-|–]/);
    if (parts.length >= 2) {
      const p0 = parts[0].trim();
      const p1 = parts[1].trim();
      const p0IsArtist = /lata|rahman|sonu|arijit|shreya|kishore|rafi|mahendra|hemant/i.test(p0);
      if (p0IsArtist) {
        displayArtist = p0;
        displayTitle  = p1;
      } else {
        displayTitle  = p0;
        displayArtist = p1;
      }
    } else {
      displayTitle  = ytTitle;
      displayArtist = "Azaad Bharat Playlist";
    }
  }

  const quote = QUOTES[quoteIdx];

  return (
    <>
      <style>{CSS}</style>
      <div className="ab-wrap" onClick={unlock}>

        {/* ── BG: bharat.webp full-bleed with mask edges */}
        <div className="ab-bg-img" />

        {/* ── dark overlay */}
        <div className="ab-overlay" />

        {/* ── TOP: counter & home button */}
        <div className="ab-top">
          <Link to="/" className="ab-home-btn" title="Back to Jugarr">
            ← Jugarr
          </Link>
          <div className="ab-counter">
            <span className="ab-dot" />
            <span className="ab-cnt">{count.toLocaleString("en-IN")}</span>
            <span className="ab-cnt-label">Indians celebrating freedom</span>
          </div>
        </div>

        {/* ── MAIN: title only */}
        <div className="ab-main">
          <h1 className="ab-title">आजाद भारत</h1>
        </div>

        {/* ── QUOTE — floats just above music player */}
        <div className="ab-quote-wrap" style={{ opacity: quoteVis ? 1 : 0 }}>
          <p className="ab-quote">
            {quote.text}
            <span className="ab-quote-by">— {quote.by}</span>
          </p>
        </div>

        {/* ── LEFT: जयघोष */}
        <button className="ab-fab ab-fab-left" onClick={fireJayghosh} aria-label="जयघोष">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
          <span className="ab-fab-txt">जयघोष</span>
        </button>

        {/* ── RIGHT: share */}
        <button className="ab-fab ab-fab-right" onClick={share} aria-label="Share">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span className="ab-fab-txt">Share</span>
        </button>

        {/* ── BOTTOM: music player */}
        <div className="ab-player">
          <div className={`ab-spin-tiranga ${isPlaying ? 'ab-spinning' : 'ab-paused'}`}>
            {meta?.thumbnail && meta.thumbnail !== '/bharat.webp' ? (
              <img
                src={meta.thumbnail}
                alt="Thumbnail"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <svg viewBox="0 0 100 100" style={{ width: "16px", height: "16px" }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#000080" strokeWidth="6" />
                <circle cx="50" cy="50" r="6" fill="#000080" />
                {[...Array(24)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 40 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={50 + 40 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="#000080"
                    strokeWidth="3.5"
                  />
                ))}
              </svg>
            )}
          </div>

          <div className="ab-player-mid">
            <div className="ab-player-song" title={displayTitle}>
              {displayTitle}
            </div>
            <div className="ab-player-meta-row">
              <span className="ab-player-artist">{displayArtist}</span>
              {meta?.position && (
                <span className="ab-player-pos-badge" title="Playlist Position">
                  {meta.position}
                </span>
              )}
            </div>
            <div className="ab-player-bar" onClick={handleSeek}>
              <div className="ab-player-bar-track">
                <div className="ab-player-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="ab-player-times">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
            {playerError && <div className="ab-player-warn">{playerError}</div>}
          </div>

          <div className="ab-player-ctrl">
            <button className="ab-prev-btn" onClick={prev} aria-label="Previous">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="4" width="3" height="16" rx="1"/>
                <polygon points="19,4 9,12 19,20"/>
              </svg>
            </button>
            <button className="ab-play-btn" onClick={togglePlay} aria-label="Play/Pause">
              {isPlaying
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1.5"/><rect x="14" y="4" width="4" height="16" rx="1.5"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              }
            </button>
            <button className="ab-next-btn" onClick={next} aria-label="Next">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="16" y="4" width="3" height="16" rx="1"/></svg>
            </button>
          </div>
        </div>

        {/* Credit */}
        <div className="ab-credit">Made with ❤️ by Jugarr</div>
      </div>
    </>
  );
}

/* ─────────── STYLES ─────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;700;900&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.ab-wrap {
  position: fixed; inset: 0; overflow: hidden;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #08070d;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
}

/* ── BACKGROUND — bharat.webp full screen, edges fade via mask */
.ab-bg-img {
  position: absolute; inset: 0; z-index: 0;
  background: url('/bharat.webp') center 44% / cover no-repeat;
  /* Subtle edge fade — keeps full screen but softens hard corners */
  -webkit-mask-image: radial-gradient(ellipse 95% 95% at 50% 50%, black 40%, transparent 95%);
  mask-image:         radial-gradient(ellipse 95% 95% at 50% 50%, black 40%, transparent 95%);
  opacity: 0.80;
}

/* ── OVERLAY — cinematic dark vignette */
.ab-overlay {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    linear-gradient(to bottom,
      rgba(8,7,13,0.70) 0%,
      rgba(8,7,13,0.10) 28%,
      rgba(8,7,13,0.10) 62%,
      rgba(8,7,13,0.85) 100%
    );
}

/* ── TOP */
.ab-top {
  position: relative; z-index: 10;
  display: flex; justify-content: center; align-items: center;
  padding: 20px 24px 0;
}
.ab-home-btn {
  position: absolute; left: 24px; top: 20px;
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  padding: 6px 14px;
  color: rgba(255,255,255,0.85);
  font-size: 0.78rem;
  font-family: inherit;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}
.ab-home-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.28);
  color: #fff;
  transform: translateX(-2px);
}
@media (max-width: 600px) {
  .ab-top { padding-top: 14px; }
  .ab-home-btn { left: 14px; top: 14px; padding: 5px 10px; font-size: 0.72rem; }
}
.ab-counter {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 100px;
  padding: 7px 18px;
}
.ab-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4ade80; flex-shrink: 0;
  box-shadow: 0 0 8px #4ade80;
  animation: ab-blink 2.4s ease-in-out infinite;
}
@keyframes ab-blink {
  0%,100% { box-shadow: 0 0 6px #4ade80; }
  50%      { box-shadow: 0 0 16px #4ade80, 0 0 32px rgba(74,222,128,0.3); }
}
.ab-cnt {
  font-size: 0.80rem; font-weight: 600;
  color: rgba(255,255,255,0.88); letter-spacing: 0.02em;
}
.ab-cnt-label {
  font-size: 0.72rem; color: rgba(255,255,255,0.38);
}

/* ── MAIN — title + quote sit in center grid row */
.ab-main {
  position: relative; z-index: 10;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0;
  text-align: center;
  padding: 0 24px;
  pointer-events: none;
}
.ab-title {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: clamp(3.8rem, 11vw, 8.5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  animation: ab-rise 1.2s cubic-bezier(.22,1,.36,1) forwards;
}
@keyframes ab-rise {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Quote floats just above the player */
.ab-quote-wrap {
  position: absolute;
  bottom: calc(28px + 72px + 20px); /* player bottom + player height + gap */
  left: 50%; transform: translateX(-50%);
  z-index: 15;
  text-align: center;
  pointer-events: none;
  transition: opacity 0.6s ease;
  white-space: nowrap;
}
.ab-quote {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: clamp(0.78rem, 1.4vw, 0.96rem);
  color: rgba(255, 255, 255, 0.90);
  font-weight: 400;
  line-height: 1.7;
  text-shadow: 0 1px 8px rgba(0,0,0,0.7);
}
.ab-quote-by {
  display: block;
  font-size: 0.68em;
  color: rgba(255,255,255,0.40);
  margin-top: 4px;
  letter-spacing: 0.07em;
}

/* ── FLOATING SIDE BUTTONS */
.ab-fab {
  position: absolute; z-index: 20;
  top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 40px;
  padding: 11px 16px;
  cursor: pointer;
  display: flex; flex-direction: row;
  align-items: center; gap: 8px;
  color: rgba(255,255,255,1);
  transition: background 0.22s ease, transform 0.18s ease;
  outline: none;
  white-space: nowrap;
}
.ab-fab:hover {
  background: rgba(255,255,255,0.14);
  border-color: rgba(255,255,255,0.20);
}
.ab-fab:active { transform: translateY(-50%) scale(0.95); }
.ab-fab-left  { left: 20px; }
.ab-fab-right { right: 20px; }
.ab-fab-icon {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: 1rem; color: rgba(255,255,255,1);
  line-height: 1;
}
.ab-fab-txt {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: 0.72rem; letter-spacing: 0.06em;
  color: rgba(255,255,255,0.90);
  font-weight: 500;
}

/* ── MUSIC PLAYER */
.ab-player {
  position: relative; z-index: 20;
  display: flex; align-items: center; gap: 14px;
  background: rgba(10, 10, 16, 0.80);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 12px 16px;
  margin: 0 auto 28px;
  width: min(480px, calc(100vw - 120px));
  box-shadow: 0 16px 48px rgba(0,0,0,0.60);
  animation: ab-rise 2s cubic-bezier(.22,1,.36,1) forwards;
}
.ab-spin-tiranga {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(to bottom, 
    #FF9933 33.3%, 
    #FFFFFF 33.3%, #FFFFFF 66.6%, 
    #138808 66.6%
  );
  display: flex; align-items: center; justify-content: center;
  position: relative;
  box-shadow: 0 0 10px rgba(255, 153, 51, 0.25);
}
.ab-spinning {
  animation: ab-spin-record 4s linear infinite;
}
.ab-paused {
  animation-play-state: paused;
}
@keyframes ab-spin-record {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.ab-player-mid {
  flex: 1; min-width: 0;
}
.ab-player-song {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: 0.88rem; font-weight: 600;
  color: rgba(255,255,255,0.90);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  margin-bottom: 2px;
}
.ab-player-artist {
  font-size: 0.72rem; color: rgba(255,255,255,0.45);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ab-player-meta-row {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  margin-bottom: 8px;
}
.ab-player-pos-badge {
  font-size: 0.64rem; font-weight: 700;
  font-family: var(--font-jetbrains, monospace);
  color: rgba(255, 180, 60, 0.95);
  background: rgba(255, 140, 0, 0.14);
  border: 1px solid rgba(255, 140, 0, 0.28);
  border-radius: 999px;
  padding: 1px 6px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}
.ab-player-bar { cursor: pointer; }
.ab-player-bar-track {
  height: 3px; background: rgba(255,255,255,0.09);
  border-radius: 2px; overflow: visible; position: relative;
}
.ab-player-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(255,120,0,0.85), rgba(255,195,70,0.9));
  border-radius: 2px; transition: width 0.5s linear;
  position: relative;
}
.ab-player-bar-fill::after {
  content: ''; position: absolute; right: -4px; top: 50%;
  transform: translateY(-50%);
  width: 9px; height: 9px; border-radius: 50%;
  background: #FFB84D;
  box-shadow: 0 0 7px rgba(255,180,60,0.85);
}
.ab-player-times {
  display: flex; justify-content: space-between;
  margin-top: 6px;
  font-size: 0.63rem; color: rgba(255,255,255,0.22);
}
.ab-player-warn {
  font-size: 0.60rem; color: rgba(255,120,0,0.55);
  margin-top: 4px; font-style: italic;
}
.ab-player-ctrl {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
.ab-play-btn {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.90);
  cursor: pointer; transition: all 0.18s ease;
}
.ab-play-btn:hover { background: rgba(255,255,255,0.18); transform: scale(1.06); }
.ab-play-btn:active { transform: scale(0.94); }
.ab-prev-btn, .ab-next-btn {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  background: transparent; border: none;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.35);
  cursor: pointer; transition: color 0.18s ease;
}
.ab-prev-btn:hover, .ab-next-btn:hover { color: rgba(255,255,255,0.70); }

/* ── SLOGAN */
.ab-slogan-wrap {
  position: absolute; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
  animation: ab-slogan-fade 2.6s ease forwards;
}
@keyframes ab-slogan-fade {
  0%   { opacity: 0; transform: scale(0.90); }
  12%  { opacity: 1; transform: scale(1); }
  72%  { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.05); }
}
.ab-slogan {
  font-family: 'Noto Sans Devanagari', sans-serif;
  font-size: clamp(2.2rem, 7vw, 5rem);
  font-weight: 900;
  color: #fff;
  text-align: center;
  line-height: 1.1;
  text-shadow:
    0 0 30px rgba(255,140,0,1),
    0 0 80px rgba(255,80,0,0.5);
}

/* ── CREDIT */
.ab-credit {
  position: absolute; bottom: 10px; right: 16px; z-index: 20;
  font-size: 0.60rem; color: rgba(255,255,255,0.14);
  letter-spacing: 0.05em;
}

/* ── MOBILE */
@media (max-width: 580px) {
  .ab-cnt-label { display: none; }
  .ab-fab-txt   { display: none; }
  .ab-fab { padding: 10px 11px; }
  .ab-fab-left  { left: 10px; }
  .ab-fab-right { right: 10px; }
  .ab-player { width: calc(100vw - 100px); gap: 10px; padding: 10px 12px; margin-bottom: 16px; }
  .ab-spin-tiranga { width: 40px; height: 40px; }
  .ab-player-times { display: none; }
  .ab-main { transform: translateY(-25%); }
  .ab-credit {
    bottom: auto;
    top: 66px;
    left: 50%;
    transform: translateX(-50%);
    right: auto;
    color: rgba(255,255,255,0.22);
  }
}
`;
