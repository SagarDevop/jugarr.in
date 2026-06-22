"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FinalCTA() {
  const navigate = useNavigate();
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
  
  const [waitlistCount, setWaitlistCount] = useState(70);

  // Initialize the count from server (with localStorage as fallback)
  useEffect(() => {
    const saved = localStorage.getItem("jugarr_waitlist_count");
    if (saved) {
      setWaitlistCount(parseInt(saved, 10));
    }
    
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/waitlist`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setWaitlistCount(data.count);
          localStorage.setItem("jugarr_waitlist_count", data.count.toString());
        }
      })
      .catch((err) => console.error("Error fetching waitlist count:", err));
  }, []);

  const handleNext = () => {
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
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final check for step 1 fields
    if (!name.trim() || !email.trim() || !phone.trim() || !collegeName.trim() || !passoutYear.trim()) {
      alert("Please fill out all required fields in Step 1.");
      setStep(1);
      return;
    }
    
    try {
      const referredBy = localStorage.getItem("jugarr_referred_by") || "";

      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/waitlist`, {
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
          referredBy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong. Please try again.");
        return;
      }

      const nextCount = data.count || (waitlistCount + 1);
      setWaitlistCount(nextCount);
      localStorage.setItem("jugarr_waitlist_count", nextCount.toString());
      localStorage.removeItem("jugarr_referred_by");
      
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
      setStep(1);

      // Redirect user to the success page with their email
      navigate(`/success?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      alert("Failed to connect to the server. Please check your network and try again.");
    }
  };

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Join India&apos;s Student Campus Marketplace — Free</h2>
        <p className="cta-desc">
          {waitlistCount}+ students from colleges across India have already joined. Be among the first to buy, sell, and earn on your campus.
        </p>
        
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
                >
                  &larr; Back
                </button>
                <button 
                  className="cta-btn-primary-stacked" 
                  type="submit"
                >
                  Submit Waitlist &rarr;
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
