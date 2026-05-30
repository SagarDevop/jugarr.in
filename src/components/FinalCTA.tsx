"use client";

import React, { useEffect, useState } from "react";

export default function FinalCTA() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [waitlistCount, setWaitlistCount] = useState(60);

  // Initialize the count from server (with localStorage as fallback)
  useEffect(() => {
    const saved = localStorage.getItem("jugarr_waitlist_count");
    if (saved) {
      setWaitlistCount(parseInt(saved, 10));
    }
    
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setWaitlistCount(data.count);
          localStorage.setItem("jugarr_waitlist_count", data.count.toString());
        }
      })
      .catch((err) => console.error("Error fetching waitlist count:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong. Please try again.");
        return;
      }

      const nextCount = data.count || (waitlistCount + 1);
      setWaitlistCount(nextCount);
      localStorage.setItem("jugarr_waitlist_count", nextCount.toString());

      alert(`Thank you, ${name.trim()}!\n\nYou have successfully joined the waitlist.\nYou are member #${nextCount} in our network!`);
      
      setName("");
      setEmail("");
      setMessage("");
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
          <textarea
            className="cta-textarea-stacked"
            placeholder="WHAT WOULD YOU LIKE TO BUY, SELL, OR EARN? (OPTIONAL)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
          <button className="cta-btn-stacked" type="submit">
            Reserve My Spot — It&apos;s Free
          </button>
        </form>
      </div>
    </section>
  );
}
