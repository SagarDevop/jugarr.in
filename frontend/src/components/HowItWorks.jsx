export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          {/* Step 1: Post */}
          <div className="step-card">
            <div className="step-number">01</div>
            <div>
              <h3 className="step-title">Post what you need.</h3>
              <p className="step-desc">
                Whether it's semester project help or a second-hand cycle, just put it out there.
              </p>
            </div>
            <div className="step-visual-container">
              <svg viewBox="0 0 100 100" className="step-svg">
                {/* Note Board */}
                <rect
                  x="20"
                  y="20"
                  width="44"
                  height="44"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  className="svg-note"
                />
                <line x1="28" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <line x1="28" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                <line x1="28" y1="48" x2="48" y2="48" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                {/* Writing Hand */}
                <g className="svg-hand-write">
                  {/* Sleeve */}
                  <path d="M72 82 L58 56 L64 51 L78 72 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  {/* Pencil line and pointer finger */}
                  <path d="M46 36 L58 48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  {/* Pencil */}
                  <line x1="41" y1="31" x2="56" y2="46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  <polygon points="41,31 38,28 42,27" fill="currentColor" />
                </g>
              </svg>
            </div>
          </div>

          {/* Step 2: Respond */}
          <div className="step-card featured">
            <div className="step-number">02</div>
            <div>
              <h3 className="step-title">Students nearby respond.</h3>
              <p className="step-desc">
                The app notifies relevant students on your campus who can fulfill the request.
              </p>
            </div>
            <div className="step-visual-container" style={{ color: "var(--color-primary)" }}>
              <svg viewBox="0 0 100 100" className="step-svg">
                {/* Radar Waves */}
                <circle cx="50" cy="45" r="10" stroke="currentColor" strokeWidth="1" fill="none" className="radar-ring ring-1" />
                <circle cx="50" cy="45" r="22" stroke="currentColor" strokeWidth="1" fill="none" className="radar-ring ring-2" />
                <circle cx="50" cy="45" r="34" stroke="currentColor" strokeWidth="1" fill="none" className="radar-ring ring-3" />
                {/* Location Pin */}
                <g className="svg-pin">
                  <path
                    d="M50 20 C40 20 34 28 34 40 C34 53 50 72 50 72 C50 72 66 53 66 40 C66 28 60 20 50 20 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="50" cy="40" r="5" fill="currentColor" />
                </g>
              </svg>
            </div>
          </div>

          {/* Step 3: Solve */}
          <div className="step-card">
            <div className="step-number">03</div>
            <div>
              <h3 className="step-title">Collaborate. Earn. Solve.</h3>
              <p className="step-desc">
                Meet up, get the work done or exchange the item, and build your campus reputation.
              </p>
            </div>
            <div className="step-visual-container">
              <svg viewBox="0 0 100 100" className="step-svg">
                {/* Left hand */}
                <path d="M12 50 L32 50 L38 44 L44 50 L38 56 L32 53 L12 53 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-left" />
                {/* Right hand */}
                <path d="M88 47 L68 47 L62 41 L56 47 L62 53 L68 50 L88 50 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="hand-right" />
                {/* Shake sparkles indicator */}
                <path d="M47 28 L51 33 M51 28 L47 33" stroke="var(--color-yellow-accent)" strokeWidth="1.5" className="shake-indicator" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
