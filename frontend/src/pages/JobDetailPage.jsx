import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { useSEO } from "@/hooks/useSEO.js";
import { getApiBaseUrl } from "@/lib/api.js";

export default function JobDetailPage() {
  const API_BASE = getApiBaseUrl();
  const { slug } = useParams();
  const formRef = useRef(null);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Application form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [coverNote, setCoverNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs/${slug}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Job posting not found.");
        if (!res.ok) throw new Error("Failed to load job details.");
        return res.json();
      })
      .then((data) => {
        if (data && data.job) {
          setJob(data.job);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Error fetching job detail:", err);
        setError(err.message || "Failed to load job posting.");
        setLoading(false);
      });
  }, [slug]);

  useSEO({
    title: job ? `${job.title} (${job.location}) | Jugarr Careers` : "Job Posting | Jugarr Careers",
    description: job
      ? `Apply for ${job.title} (${job.type}) at Jugarr in ${job.location}. Shape the future of campus commerce in India.`
      : "Apply for careers and internships at Jugarr.",
    canonicalUrl: `https://jugarr.in/careers/${slug}`,
    ogType: "website",
    robots: "index, follow",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormError("");

    if (!file) {
      setResumeFile(null);
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFormError("Only PDF files (.pdf) are allowed.");
      setResumeFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("File size exceeds 5MB limit. Please upload a smaller PDF file.");
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleScrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!resumeFile) {
      setFormError("Please select a PDF resume file to upload.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("applicantName", name.trim());
      formData.append("applicantEmail", email.trim());
      formData.append("applicantPhone", phone.trim());
      formData.append("collegeName", collegeName.trim());
      formData.append("coverNote", coverNote.trim());
      formData.append("resume", resumeFile);

      const res = await fetch(`${API_BASE}/api/jobs/${slug}/apply`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application.");
      }

      setSubmitSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setCollegeName("");
      setResumeFile(null);
      setCoverNote("");
      setSubmitting(false);
    } catch (err) {
      console.error("Application error:", err);
      setFormError(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main>
          <section className="blog-post-section" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="container" style={{ textAlign: "center" }}>
              <p className="font-mono text-outline" style={{ fontSize: "14px" }}>
                ⚡ LOADING POSITION DETAILS...
              </p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !job) {
    return (
      <>
        <Header />
        <main>
          <section className="blog-post-section" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="container" style={{ textAlign: "center" }}>
              <h1 className="blog-post-title" style={{ marginBottom: "24px" }}>Position Not Found</h1>
              <p className="font-body text-muted" style={{ marginBottom: "32px" }}>
                {error || "The requested position could not be found or has been removed."}
              </p>
              <Link to="/careers" className="btn btn-primary" style={{ textDecoration: "none" }}>
                &larr; Back to All Open Positions
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // JSON-LD Schema for Google for Jobs (JobPosting)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "url": `https://jugarr.in/careers/${job.slug}`,
    "identifier": {
      "@type": "PropertyValue",
      "name": "Jugarr",
      "value": job._id || job.slug,
    },
    "datePosted": new Date(job.postedAt || job.createdAt).toISOString(),
    "employmentType":
      job.type === "Full-time"
        ? "FULL_TIME"
        : job.type === "Part-time"
        ? "PART_TIME"
        : job.type === "Internship"
        ? "INTERN"
        : "OTHER",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Jugarr",
      "sameAs": "https://jugarr.in",
      "logo": "https://jugarr.in/icon.png",
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN",
      },
    },
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "India",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}>
        <section className="blog-post-section" style={{ padding: "60px 0 100px" }}>
          <div className="container">
            {/* Back Link */}
            <Link to="/careers" className="blog-post-back" style={{ textDecoration: "none", marginBottom: "24px", display: "inline-block" }}>
              <span>&larr; BACK TO OPEN POSITIONS</span>
            </Link>

            {/* Closed Notice Banner */}
            {job.status === "closed" && (
              <div
                style={{
                  padding: "16px 24px",
                  marginBottom: "32px",
                  backgroundColor: "rgba(255, 59, 48, 0.1)",
                  border: "2px solid #ff3b30",
                  color: "#ff3b30",
                  fontWeight: "bold",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: "14px",
                }}
              >
                ⚠️ THIS POSITION IS CURRENTLY CLOSED AND NO LONGER ACCEPTING APPLICATIONS.
              </div>
            )}

            {/* Post Header Card */}
            <div
              style={{
                border: "2px solid var(--color-primary)",
                boxShadow: "6px 6px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "36px",
                marginBottom: "40px",
              }}
            >
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "12px",
                    padding: "4px 12px",
                    backgroundColor: "var(--color-primary)",
                    color: "#fff",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {job.department}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "12px",
                    padding: "4px 12px",
                    backgroundColor: "var(--color-yellow-accent)",
                    color: "var(--color-primary)",
                    border: "1px solid var(--color-primary)",
                    fontWeight: "bold",
                  }}
                >
                  {job.type}
                </span>
              </div>

              <h1 className="font-display" style={{ fontSize: "clamp(28px, 4vw, 42px)", margin: "0 0 16px" }}>
                {job.title}
              </h1>

              <div
                className="font-mono"
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  gap: "24px",
                  flexWrap: "wrap",
                }}
              >
                <span>📍 Location: <strong>{job.location}</strong></span>
                <span>📅 Posted: <strong>{new Date(job.postedAt || job.createdAt).toLocaleDateString()}</strong></span>
              </div>

              {job.status === "open" && (
                <div style={{ marginTop: "28px" }}>
                  <button
                    className="btn font-mono"
                    onClick={handleScrollToForm}
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      padding: "14px 28px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      border: "none",
                      boxShadow: "3px 3px 0px 0px var(--color-yellow-accent)",
                      cursor: "pointer",
                    }}
                  >
                    Apply for this Role &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Quick Benefits Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "48px",
              }}
            >
              <div style={{ padding: "16px", border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                <span style={{ fontSize: "20px" }}>🎓</span>
                <h4 className="font-display" style={{ fontSize: "14px", margin: "4px 0" }}>Student-First Culture</h4>
                <p className="font-body text-muted" style={{ fontSize: "12px", margin: 0 }}>Flexible work around exams and labs</p>
              </div>

              <div style={{ padding: "16px", border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                <span style={{ fontSize: "20px" }}>⚡</span>
                <h4 className="font-display" style={{ fontSize: "14px", margin: "4px 0" }}>Direct Leadership</h4>
                <p className="font-body text-muted" style={{ fontSize: "12px", margin: 0 }}>Work directly with founders and core team</p>
              </div>

              <div style={{ padding: "16px", border: "1px solid var(--color-outline-variant)", backgroundColor: "var(--color-surface-low)" }}>
                <span style={{ fontSize: "20px" }}>👕</span>
                <h4 className="font-display" style={{ fontSize: "14px", margin: "4px 0" }}>Free Merch &amp; Perks</h4>
                <p className="font-body text-muted" style={{ fontSize: "12px", margin: 0 }}>Jugarr T-shirts, stickers &amp; certificate</p>
              </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
              {/* Description */}
              <div>
                <h3
                  className="font-mono text-outline"
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.1em",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    color: "var(--color-primary)",
                  }}
                >
                  ⚡ ABOUT THE ROLE
                </h3>
                <div
                  className="font-body text-muted"
                  style={{ fontSize: "16px", lineHeight: "1.8", whiteSpace: "pre-line" }}
                >
                  {job.description}
                </div>
              </div>

              {/* Responsibilities */}
              {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
                <div>
                  <h3
                    className="font-mono text-outline"
                    style={{
                      fontSize: "12px",
                      letterSpacing: "0.1em",
                      marginBottom: "16px",
                      textTransform: "uppercase",
                      color: "var(--color-primary)",
                    }}
                  >
                    🛠️ WHAT YOU WILL DO
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {job.responsibilities.map((resp, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                          padding: "12px 16px",
                          backgroundColor: "var(--color-surface-low)",
                          borderLeft: "3px solid var(--color-primary)",
                        }}
                      >
                        <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>✓</span>
                        <span className="font-body" style={{ fontSize: "15px", lineHeight: "1.6" }}>
                          {resp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                <div>
                  <h3
                    className="font-mono text-outline"
                    style={{
                      fontSize: "12px",
                      letterSpacing: "0.1em",
                      marginBottom: "16px",
                      textTransform: "uppercase",
                      color: "var(--color-primary)",
                    }}
                  >
                    🎯 WHAT WE ARE LOOKING FOR
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {job.requirements.map((req, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                          padding: "12px 16px",
                          backgroundColor: "var(--color-surface-low)",
                          borderLeft: "3px solid var(--color-yellow-accent)",
                        }}
                      >
                        <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>★</span>
                        <span className="font-body" style={{ fontSize: "15px", lineHeight: "1.6" }}>
                          {req}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inline Application Form */}
              <div
                ref={formRef}
                style={{
                  marginTop: "32px",
                  border: "2px solid var(--color-primary)",
                  boxShadow: "8px 8px 0px 0px var(--color-primary)",
                  backgroundColor: "var(--color-surface-lowest)",
                  padding: "36px",
                }}
              >
                <div className="font-mono" style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: "bold", textTransform: "uppercase", marginBottom: "8px" }}>
                  SUBMIT YOUR PROFILE
                </div>
                <h3 className="font-display" style={{ fontSize: "28px", marginBottom: "8px", marginTop: 0 }}>
                  Apply for {job.title}
                </h3>
                <p className="font-body text-muted" style={{ marginBottom: "28px", fontSize: "15px" }}>
                  {job.status === "open"
                    ? "Fill in your details and upload your PDF resume. We review every application carefully!"
                    : "This position is currently closed to new applications."}
                </p>

                {submitSuccess ? (
                  <div
                    style={{
                      padding: "28px",
                      backgroundColor: "rgba(46, 125, 50, 0.1)",
                      border: "2px solid #2e7d32",
                      color: "#2e7d32",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
                    <h4 className="font-display" style={{ fontSize: "22px", margin: "0 0 8px" }}>Application Submitted Successfully!</h4>
                    <p className="font-body" style={{ margin: 0, fontSize: "15px", lineHeight: "1.6" }}>
                      Thank you for applying for the <strong>{job.title}</strong> role at Jugarr. Our team will review your application and contact you if shortlisted!
                    </p>
                  </div>
                ) : job.status === "open" ? (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {formError && (
                      <div
                        style={{
                          padding: "14px 18px",
                          backgroundColor: "rgba(255, 59, 48, 0.1)",
                          border: "1px solid #ff3b30",
                          color: "#ff3b30",
                          fontSize: "14px",
                          fontWeight: "bold",
                          fontFamily: "var(--font-jetbrains), monospace",
                        }}
                      >
                        ⚠️ {formError}
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                          FULL NAME *
                        </label>
                        <input
                          type="text"
                          required
                          className="cta-input-stacked"
                          placeholder="e.g. Rahul Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                          EMAIL ADDRESS *
                        </label>
                        <input
                          type="email"
                          required
                          className="cta-input-stacked"
                          placeholder="rahul@college.edu"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                          PHONE NUMBER
                        </label>
                        <input
                          type="tel"
                          className="cta-input-stacked"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                          COLLEGE / UNIVERSITY NAME
                        </label>
                        <input
                          type="text"
                          className="cta-input-stacked"
                          placeholder="e.g. IIT Kanpur / DU"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                        UPLOAD RESUME (PDF ONLY, MAX 5MB) *
                      </label>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        required
                        onChange={handleFileChange}
                        style={{
                          width: "100%",
                          padding: "14px",
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-outline-variant)",
                          color: "var(--color-text)",
                          fontFamily: "var(--font-jetbrains), monospace",
                          fontSize: "12px",
                        }}
                      />
                      {resumeFile && (
                        <div className="font-mono" style={{ fontSize: "12px", color: "var(--color-primary)", marginTop: "6px", fontWeight: "bold" }}>
                          ✓ Selected file: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                        SHORT COVER NOTE / WHY JUGARR? (OPTIONAL)
                      </label>
                      <textarea
                        rows={4}
                        className="cta-textarea-stacked"
                        placeholder="Tell us briefly about your experience, past projects, or why you want to build Jugarr..."
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn font-mono"
                      style={{
                        marginTop: "8px",
                        padding: "16px 32px",
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-on-primary)",
                        fontSize: "14px",
                        fontWeight: "bold",
                        border: "none",
                        boxShadow: "4px 4px 0px 0px var(--color-yellow-accent)",
                        cursor: "pointer",
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? "Submitting Application..." : "Submit Application →"}
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
