"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiBaseUrl } from "@/lib/api.js";
import { useWaitlist } from "@/context/WaitlistContext.jsx";

export default function FinalCTA() {
  const navigate = useNavigate();
  const { isJoined, user, saveUser, logout } = useWaitlist();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joinWhatsappCommunity, setJoinWhatsappCommunity] = useState(true);
  const [collegeName, setCollegeName] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [problemFace, setProblemFace] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [referredBy, setReferredBy] = useState(() => localStorage.getItem("jugarr_referred_by") || "");
  const [referrerName, setReferrerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [waitlistCount, setWaitlistCount] = useState(70);

  // Fetch referrer name dynamically if referral code exists
  useEffect(() => {
    if (!referredBy.trim()) {
      setReferrerName("");
      return;
    }
    const controller = new AbortController();
    fetch(`${getApiBaseUrl()}/api/waitlist/referrer?code=${encodeURIComponent(referredBy.trim().toUpperCase())}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Referrer not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setReferrerName(data.name);
        } else {
          setReferrerName("");
        }
      })
      .catch(() => {
        setReferrerName("");
      });
    return () => controller.abort();
  }, [referredBy]);

  // Initialize the count from server (with localStorage as fallback)
  useEffect(() => {
    const saved = localStorage.getItem("jugarr_waitlist_count");
    if (saved) {
      setWaitlistCount(parseInt(saved, 10));
    }
    
    fetch(`${getApiBaseUrl()}/api/waitlist`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setWaitlistCount(data.count);
          localStorage.setItem("jugarr_waitlist_count", data.count.toString());
        }
      })
      .catch((err) => console.error("Error fetching waitlist count:", err));
  }, []);

  const handleCopyLink = () => {
    if (user?.referralCode) {
      const link = `${window.location.origin}?ref=${user.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [quickLookupEmail, setQuickLookupEmail] = useState("");
  const [quickLookupLoading, setQuickLookupLoading] = useState(false);
  const [quickLookupError, setQuickLookupError] = useState("");
  const [showQuickLookup, setShowQuickLookup] = useState(false);

  // Check if an email already exists in backend database
  const checkExistingUser = async (emailToCheck) => {
    if (!emailToCheck || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToCheck.trim())) return false;
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/waitlist/status?email=${encodeURIComponent(emailToCheck.trim().toLowerCase())}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.referralCode) {
          saveUser(data);
          return true;
        }
      }
    } catch (e) {
      console.warn("User lookup check error:", e);
    }
    return false;
  };

  const handleEmailBlur = async () => {
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      await checkExistingUser(email);
    }
  };

  const handleQuickLookup = async (e) => {
    e.preventDefault();
    if (!quickLookupEmail.trim()) return;

    setQuickLookupLoading(true);
    setQuickLookupError("");

    try {
      const res = await fetch(
        `${getApiBaseUrl()}/api/waitlist/status?email=${encodeURIComponent(quickLookupEmail.trim().toLowerCase())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setQuickLookupError(data.error || "No waitlist account found for this email.");
        setQuickLookupLoading(false);
        return;
      }

      saveUser(data);
      setQuickLookupLoading(false);
    } catch (err) {
      console.error("Quick lookup error:", err);
      setQuickLookupError("Network error. Please try again.");
      setQuickLookupLoading(false);
    }
  };

  const handleNext = async () => {
    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }
    if (!collegeName.trim()) {
      alert("Please enter your college name.");
      return;
    }
    if (!passoutYear.trim()) {
      alert("Please enter your graduation passout year.");
      return;
    }

    // Instant check: If old user already joined, immediately log them in!
    const alreadyExists = await checkExistingUser(email);
    if (alreadyExists) {
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final check for step 1 fields
    if (!name.trim() || !email.trim() || !phone.trim() || !collegeName.trim() || !passoutYear.trim()) {
      alert("Please fill out all required fields in Step 1.");
      setStep(1);
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          joinWhatsappCommunity,
          collegeName,
          passoutYear,
          problemFace,
          whyJoin,
          suggestions,
          referredBy: referredBy.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const nextCount = data.count || (waitlistCount + 1);
      setWaitlistCount(nextCount);
      localStorage.setItem("jugarr_waitlist_count", nextCount.toString());
      localStorage.removeItem("jugarr_referred_by");

      // Save user identity in global context & cache
      saveUser({
        name: data.name || name.trim(),
        email: data.email || email.trim().toLowerCase(),
        referralCode: data.referralCode,
      });
      
      // Reset form states
      setName("");
      setEmail("");
      setPhone("");
      setJoinWhatsappCommunity(true);
      setCollegeName("");
      setPassoutYear("");
      setProblemFace("");
      setWhyJoin("");
      setSuggestions("");
      setReferredBy("");
      setReferrerName("");
      setStep(1);

      // Redirect user to the referral dashboard with their email
      navigate(`/success?email=${encodeURIComponent(data.email || email)}`);
    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      alert("Failed to connect to the server. Please check your network and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const userReferralLink = user?.referralCode ? `${window.location.origin}?ref=${user.referralCode}` : "";

  return (
    <section id="cta" className="cta-section">
      <div className="cta-container">
        {isJoined && user ? (
          /* PERSISTENT JOINED STATE VIEW */
          <div style={{ maxWidth: "620px", margin: "0 auto", textAlign: "center" }}>
            <div className="font-mono text-outline" style={{ fontSize: "11px", letterSpacing: "0.2em", marginBottom: "12px", textTransform: "uppercase" }}>
              ✓ WAITLIST STATUS: CONFIRMED
            </div>
            <h2 className="cta-title" style={{ marginBottom: "16px" }}>
              You&apos;re in the Queue, {user.name ? user.name.split(" ")[0] : "Hustler"}!
            </h2>
            <p className="cta-desc" style={{ marginBottom: "32px" }}>
              Your spot is secured. Share your personal invite link to move up ranks and claim limited edition college merch.
            </p>

            <div style={{
              border: "1px solid var(--color-primary)",
              boxShadow: "8px 8px 0px 0px var(--color-yellow-accent)",
              backgroundColor: "var(--color-surface-lowest)",
              padding: "32px 24px",
              marginBottom: "32px",
              textAlign: "left",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div style={{ border: "1px solid var(--color-primary)", padding: "16px", backgroundColor: "var(--color-surface-low)", textAlign: "center" }}>
                  <span className="font-mono" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-outline)", display: "block" }}>
                    YOUR RANK
                  </span>
                  <div className="font-display" style={{ fontSize: "32px", marginTop: "4px" }}>
                    #{user.rank || "—"}
                  </div>
                </div>
                <div style={{ border: "1px solid var(--color-primary)", padding: "16px", backgroundColor: "var(--color-surface-low)", textAlign: "center" }}>
                  <span className="font-mono" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-outline)", display: "block" }}>
                    REFERRALS
                  </span>
                  <div className="font-display" style={{ fontSize: "32px", marginTop: "4px" }}>
                    {user.referralCount || 0}
                  </div>
                </div>
              </div>

              {userReferralLink && (
                <div style={{ marginBottom: "24px" }}>
                  <label className="font-mono" style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--color-outline)", display: "block", marginBottom: "6px" }}>
                    YOUR EXCLUSIVE REFERRAL LINK:
                  </label>
                  <div style={{ display: "flex", border: "1px solid var(--color-primary)", backgroundColor: "var(--color-surface-low)" }}>
                    <input
                      type="text"
                      readOnly
                      value={userReferralLink}
                      style={{
                        flexGrow: 1,
                        padding: "12px 14px",
                        border: "none",
                        background: "transparent",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "12px",
                        color: "var(--color-primary)",
                        outline: "none",
                        textOverflow: "ellipsis",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="font-mono"
                      style={{
                        backgroundColor: copied ? "var(--color-yellow-accent)" : "var(--color-primary)",
                        color: copied ? "var(--color-primary)" : "var(--color-on-primary)",
                        border: "none",
                        borderLeft: "1px solid var(--color-primary)",
                        padding: "0 18px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: "bold",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {copied ? "COPIED!" : "COPY"}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate(`/success?email=${encodeURIComponent(user.email)}`)}
                className="btn btn-primary font-mono"
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: "1px solid var(--color-primary)",
                  boxShadow: "4px 4px 0px 0px var(--color-primary)",
                }}
              >
                See Your Referrals & Leaderboard &rarr;
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={logout}
                className="font-mono"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "11px",
                  color: "var(--color-outline)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Not {user.email}? Register a different email &rarr;
              </button>
            </div>
          </div>
        ) : (
          /* GUEST REGISTRATION FORM */
          <>
            <h2 className="cta-title">Join India&apos;s Student Campus Marketplace — Free</h2>
            <p className="cta-desc">
              {referrerName ? (
                <>
                  ✨ You were invited by <strong>{referrerName}</strong>! Join them and {waitlistCount}+ students from colleges across India.
                </>
              ) : (
                `${waitlistCount}+ students from colleges across India have already joined. Be among the first to buy, sell, and earn on your campus.`
              )}
            </p>

            {/* Quick Check for Old / Existing Waitlist Members */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "24px",
              gap: "8px",
            }}>
              <span className="font-mono" style={{ fontSize: "12px", color: "var(--color-outline)" }}>
                Already joined the waitlist?
              </span>
              <button
                type="button"
                onClick={() => setShowQuickLookup(!showQuickLookup)}
                className="font-mono"
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--color-primary)",
                  color: "var(--color-primary)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  padding: "0 2px",
                }}
              >
                {showQuickLookup ? "✕ Close Quick Check" : "Check Your Rank & Referrals \u2192"}
              </button>
            </div>

            {showQuickLookup && (
              <div style={{
                border: "1px solid var(--color-primary)",
                boxShadow: "6px 6px 0px 0px var(--color-yellow-accent)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "24px",
                maxWidth: "520px",
                margin: "0 auto 32px",
                textAlign: "left",
              }}>
                <span className="font-mono text-outline" style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  WAITLIST MEMBER ACCESS
                </span>
                <h3 className="font-display" style={{ fontSize: "20px", marginBottom: "8px" }}>
                  Retrieve Your Referral Dashboard
                </h3>
                <p className="font-body text-muted" style={{ fontSize: "13px", marginBottom: "16px" }}>
                  Enter your registered email below to instantly view your queue rank, rewards, and custom referral link.
                </p>
                <form onSubmit={handleQuickLookup} style={{ display: "flex", border: "1px solid var(--color-primary)", backgroundColor: "var(--color-surface-low)" }}>
                  <input
                    type="email"
                    placeholder="ENTER YOUR REGISTERED EMAIL"
                    value={quickLookupEmail}
                    onChange={(e) => setQuickLookupEmail(e.target.value)}
                    style={{
                      flexGrow: 1,
                      padding: "12px 14px",
                      border: "none",
                      background: "transparent",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: "12px",
                      outline: "none",
                      color: "var(--color-primary)",
                    }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={quickLookupLoading}
                    className="font-mono"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      border: "none",
                      padding: "0 18px",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {quickLookupLoading ? "CHECKING..." : "ACCESS \u2192"}
                  </button>
                </form>
                {quickLookupError && (
                  <p className="font-mono" style={{ color: "#ff3b30", fontSize: "11px", marginTop: "8px" }}>
                    {quickLookupError}
                  </p>
                )}
              </div>
            )}
            
            <form className="cta-form-stacked" onSubmit={handleSubmit}>
              {/* Progress / Step indicator header */}
              <div className="cta-step-indicator">
                <span>STEP {step === 1 ? "01 / 02" : "02 / 02"}</span>
                <span className="cta-step-title">
                  {step === 1 ? "PERSONAL & CAMPUS DETAILS" : "TELL US MORE ABOUT YOUR HUSTLE"}
                </span>
              </div>

              {step === 1 ? (
                /* Step 1 Fields */
                <>
                  <input
                    className="cta-input-stacked"
                    placeholder="YOUR FULL NAME"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    className="cta-input-stacked"
                    placeholder="YOUR EMAIL"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    required
                  />
                  <input
                    className="cta-input-stacked"
                    placeholder="YOUR PHONE NUMBER"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <input
                    className="cta-input-stacked"
                    placeholder="YOUR COLLEGE NAME"
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                  />
                  <input
                    className="cta-input-stacked"
                    placeholder="GRADUATION PASSOUT YEAR (E.G. 2027)"
                    type="text"
                    value={passoutYear}
                    onChange={(e) => setPassoutYear(e.target.value)}
                    required
                  />
                  <div style={{ width: "100%", textAlign: "left" }}>
                    <input
                      className="cta-input-stacked"
                      placeholder="REFERRAL CODE (OPTIONAL)"
                      type="text"
                      value={referredBy}
                      onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
                      style={{ marginBottom: referrerName ? "8px" : "16px" }}
                    />
                    {referrerName && (
                      <div className="font-mono" style={{ fontSize: "12px", color: "var(--color-yellow-accent)", fontWeight: "bold", paddingLeft: "4px", marginBottom: "16px" }}>
                        ✨ Invited by: {referrerName}
                      </div>
                    )}
                  </div>
                  <div 
                    className="cta-checkbox-container" 
                    onClick={() => setJoinWhatsappCommunity(!joinWhatsappCommunity)}
                  >
                    <input
                      type="checkbox"
                      className="cta-checkbox"
                      checked={joinWhatsappCommunity}
                      onChange={() => {}} // Managed by container click
                    />
                    <span className="cta-checkbox-label">
                      Yes, I want to join my campus WhatsApp community channel
                    </span>
                  </div>
                  <button 
                    className="cta-btn-stacked" 
                    type="button" 
                    onClick={handleNext}
                  >
                    Next Step &rarr;
                  </button>
                </>
              ) : (
                /* Step 2 Fields */
                <>
                  <textarea
                    className="cta-textarea-stacked"
                    placeholder="WHAT PROBLEMS DO YOU FACE IN BUYING/SELLING/EARNING ON CAMPUS? (E.G., SCATTERED WHATSAPP GROUPS, COMMISSION CHARGES)"
                    value={problemFace}
                    onChange={(e) => setProblemFace(e.target.value)}
                    rows={3}
                  />
                  <textarea
                    className="cta-textarea-stacked"
                    placeholder="WHY DO YOU WANT TO JOIN JUGARR?"
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    rows={3}
                  />
                  <textarea
                    className="cta-textarea-stacked"
                    placeholder="ANY SUGGESTIONS OR FEATURES YOU WOULD LIKE TO SEE ON JUGARR?"
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    rows={3}
                  />
                  <div className="cta-btn-group">
                    <button 
                      className="cta-btn-secondary-stacked" 
                      type="button" 
                      onClick={() => setStep(1)}
                      disabled={submitting}
                    >
                      &larr; Back
                    </button>
                    <button 
                      className="cta-btn-primary-stacked" 
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Waitlist \u2192"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </section>
  );
}

