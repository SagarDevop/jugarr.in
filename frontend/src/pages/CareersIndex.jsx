import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { useSEO } from "@/hooks/useSEO.js";
import { getApiBaseUrl } from "@/lib/api.js";

const departments = ["ALL", "Tech", "Marketing", "Design", "Operations", "Growth"];
const jobTypes = ["ALL", "Full-time", "Part-time", "Internship", "Gig"];

export default function CareersIndex() {
  const API_BASE = getApiBaseUrl();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  useSEO({
    title: "Careers & Internships | Jugarr – Build India's Student Marketplace",
    description:
      "We're looking for extraordinary student talent! Join Jugarr to shape campus commerce, earn perks, build proof-of-work, and lead the student hustle.",
    keywords: [
      "Jugarr careers",
      "student jobs India",
      "campus startup internships",
      "tech internships college",
      "campus ambassador roles",
    ],
    canonicalUrl: "https://jugarr.in/careers",
    robots: "index, follow",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load open positions");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.jobs)) {
          setJobs(data.jobs);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Could not fetch jobs:", err);
        setError("Unable to load open roles right now. Please check back soon.");
        setLoading(false);
      });
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesDept = selectedDept === "ALL" || job.department.toUpperCase() === selectedDept.toUpperCase();
    const matchesType = selectedType === "ALL" || job.type.toUpperCase() === selectedType.toUpperCase();
    return matchesDept && matchesType;
  });

  const culturePillars = [
    {
      icon: "💡",
      title: "Real Campus Impact",
      desc: "Solve actual student problems — from late-night food and exam cheat-sheets to affordable textbook trades across Indian colleges.",
    },
    {
      icon: "⚡",
      title: "High Velocity Execution",
      desc: "Shipped fast, tested live on campus. Your ideas turn into real code, designs, and campaigns in days — not months.",
    },
    {
      icon: "🔥",
      title: "Flexibility Around College",
      desc: "Built by students, for students. Work flexibly around your college lectures, lab schedules, and hostel life.",
    },
    {
      icon: "🏆",
      title: "Proof of Work > Degrees",
      desc: "We value curiosity, hustle, and execution over CGPA or fancy resumes. Show us what you've built and what you can do!",
    },
  ];

  return (
    <>
      <Header />
      <main style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}>
        {/* Energetic Hero Section */}
        <section
          style={{
            padding: "80px 0 60px",
            borderBottom: "1px solid var(--color-outline-variant)",
            background: "linear-gradient(180deg, var(--color-surface-low) 0%, var(--color-surface) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="container">
            <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
              {/* Hiring Live Pulse Badge */}
              <div
                className="font-mono"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "50px",
                  backgroundColor: "rgba(255, 215, 0, 0.15)",
                  border: "1px solid var(--color-yellow-accent)",
                  color: "var(--color-primary)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "24px",
                  boxShadow: "2px 2px 0px 0px var(--color-primary)",
                }}
              >
                <span className="live-pulse" style={{ width: "8px", height: "8px", backgroundColor: "#ff3b30" }}></span>
                <span>⚡ WE ARE HIRING TALENT LIKE YOU &middot; JOIN THE JUGARR SQUAD</span>
              </div>

              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(36px, 5vw, 56px)",
                  fontWeight: "900",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  marginBottom: "20px",
                }}
              >
                Don&apos;t Just Watch the Campus Hustle. <br />
                <span
                  style={{
                    backgroundColor: "var(--color-yellow-accent)",
                    color: "var(--color-primary)",
                    padding: "0 8px",
                    display: "inline-block",
                    transform: "rotate(-1deg)",
                  }}
                >
                  Lead It.
                </span>
              </h1>

              <p
                className="font-body text-muted"
                style={{
                  fontSize: "19px",
                  lineHeight: "1.6",
                  maxWidth: "680px",
                  margin: "0 auto 36px",
                }}
              >
                Jugarr is India&apos;s student-to-student campus marketplace. We are looking for ambitious coders,
                designers, marketers, and campus legends to build the ultimate student economy.
              </p>

              {/* High-Impact Stat Badges */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "24px",
                  marginTop: "32px",
                }}
              >
                <div
                  style={{
                    padding: "16px 24px",
                    border: "1px solid var(--color-primary)",
                    backgroundColor: "var(--color-surface-lowest)",
                    boxShadow: "4px 4px 0px 0px var(--color-primary)",
                  }}
                >
                  <span className="font-display" style={{ fontSize: "28px", fontWeight: "bold", color: "var(--color-primary)", display: "block" }}>
                    100%
                  </span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Student Driven
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px 24px",
                    border: "1px solid var(--color-primary)",
                    backgroundColor: "var(--color-surface-lowest)",
                    boxShadow: "4px 4px 0px 0px var(--color-primary)",
                  }}
                >
                  <span className="font-display" style={{ fontSize: "28px", fontWeight: "bold", color: "var(--color-primary)", display: "block" }}>
                    0%
                  </span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Corporate BS
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px 24px",
                    border: "1px solid var(--color-primary)",
                    backgroundColor: "var(--color-surface-lowest)",
                    boxShadow: "4px 4px 0px 0px var(--color-primary)",
                  }}
                >
                  <span className="font-display" style={{ fontSize: "28px", fontWeight: "bold", color: "var(--color-primary)", display: "block" }}>
                    ∞
                  </span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Ownership &amp; Perks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Culture & Benefits Section */}
        <section style={{ padding: "60px 0", backgroundColor: "var(--color-surface-low)", borderBottom: "1px solid var(--color-outline-variant)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <span className="font-mono text-outline" style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                WHY BUILD WITH JUGARR?
              </span>
              <h2 className="font-display" style={{ fontSize: "32px", margin: 0 }}>
                Work That Matters. Experience That Counts.
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              {culturePillars.map((pillar, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "24px",
                    border: "1px solid var(--color-outline-variant)",
                    backgroundColor: "var(--color-surface-lowest)",
                    borderRadius: "2px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>{pillar.icon}</div>
                  <h3 className="font-display" style={{ fontSize: "18px", marginBottom: "8px" }}>
                    {pillar.title}
                  </h3>
                  <p className="font-body text-muted" style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Roles Section */}
        <section style={{ padding: "80px 0", minHeight: "60vh" }}>
          <div className="container">
            {/* Section Header */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                  padding: "4px 12px",
                  border: "1px solid var(--color-primary)",
                  display: "inline-block",
                  marginBottom: "12px",
                }}
              >
                🔥 OPEN POSITIONS
              </span>
              <h2 className="font-display" style={{ fontSize: "36px", margin: 0 }}>
                Find Your Role &amp; Join the Squad
              </h2>
              <p className="font-body text-muted" style={{ fontSize: "16px", marginTop: "8px" }}>
                Filter by your domain of expertise or preferred employment style.
              </p>
            </div>

            {/* Interactive Filters */}
            <div
              style={{
                marginBottom: "40px",
                padding: "24px",
                border: "1px solid var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                boxShadow: "4px 4px 0px 0px var(--color-primary)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <span className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", width: "120px" }}>
                  Department:
                </span>
                <div className="blog-filter-tags" style={{ flexGrow: 1 }}>
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      className={`blog-filter-tag ${selectedDept === dept ? "active" : ""}`}
                      onClick={() => setSelectedDept(dept)}
                      style={{ fontSize: "12px", padding: "6px 14px" }}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                <span className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", width: "120px" }}>
                  Role Type:
                </span>
                <div className="blog-filter-tags" style={{ flexGrow: 1 }}>
                  {jobTypes.map((type) => (
                    <button
                      key={type}
                      className={`blog-filter-tag ${selectedType === type ? "active" : ""}`}
                      onClick={() => setSelectedType(type)}
                      style={{ fontSize: "12px", padding: "6px 14px" }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Listings Grid */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p className="font-mono text-outline" style={{ fontSize: "14px" }}>
                  ⚡ SEARCHING FOR OPEN POSITIONS...
                </p>
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  border: "1px dashed #ff3b30",
                  backgroundColor: "rgba(255, 59, 48, 0.05)",
                }}
              >
                <p className="font-mono" style={{ fontSize: "14px", color: "#ff3b30" }}>
                  {error}
                </p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: "24px",
                }}
              >
                {filteredJobs.map((job) => (
                  <div
                    key={job.slug}
                    style={{
                      border: "1px solid var(--color-primary)",
                      boxShadow: "4px 4px 0px 0px var(--color-primary)",
                      backgroundColor: "var(--color-surface-lowest)",
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      justifySpace: "between",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <div>
                      {/* Badges */}
                      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "11px",
                            padding: "3px 10px",
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
                            fontSize: "11px",
                            padding: "3px 10px",
                            backgroundColor: "var(--color-yellow-accent)",
                            color: "var(--color-primary)",
                            border: "1px solid var(--color-primary)",
                            fontWeight: "bold",
                          }}
                        >
                          {job.type}
                        </span>
                      </div>

                      <h3 className="font-display" style={{ fontSize: "22px", marginBottom: "10px", lineHeight: "1.3" }}>
                        {job.title}
                      </h3>

                      <div
                        className="font-mono"
                        style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "16px" }}
                      >
                        📍 {job.location} &middot; Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                      </div>

                      <p className="font-body text-muted" style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                        {job.description.length > 150
                          ? job.description.slice(0, 150) + "..."
                          : job.description}
                      </p>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1px solid var(--color-outline-variant)" }}>
                      <Link
                        to={`/careers/${job.slug}`}
                        className="btn font-mono"
                        style={{
                          width: "100%",
                          textAlign: "center",
                          display: "block",
                          textDecoration: "none",
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-on-primary)",
                          padding: "12px",
                          fontWeight: "bold",
                          fontSize: "12px",
                          border: "none",
                        }}
                      >
                        View Position &amp; Apply &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  border: "2px dashed var(--color-outline-variant)",
                  backgroundColor: "var(--color-surface-low)",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚀</div>
                <h3 className="font-display" style={{ fontSize: "20px", marginBottom: "8px" }}>
                  No Roles Match Your Selected Filters
                </h3>
                <p className="font-body text-muted" style={{ fontSize: "14px", marginBottom: "20px" }}>
                  Try switching departments or role types to explore available openings.
                </p>
                <button
                  className="btn font-mono"
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "var(--color-primary)",
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={() => {
                    setSelectedDept("ALL");
                    setSelectedType("ALL");
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pitch Us Your Own Role Callout */}
            <div
              style={{
                marginTop: "80px",
                padding: "40px",
                border: "2px solid var(--color-primary)",
                boxShadow: "8px 8px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-yellow-accent)",
                color: "var(--color-primary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <span className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                ⚡ DON&apos;T SEE YOUR SPECIFIC ROLE?
              </span>
              <h2 className="font-display" style={{ fontSize: "30px", marginTop: "8px", marginBottom: "12px" }}>
                Pitch Us Your Own Role
              </h2>
              <p className="font-body" style={{ maxWidth: "600px", fontSize: "16px", lineHeight: "1.6", marginBottom: "24px" }}>
                Are you a campus influencer, developer, video creator, or community builder with an idea to explode Jugarr&apos;s growth? Send your proposal directly to our team!
              </p>
              <a
                href="mailto:careers@jugarr.in?subject=Spontaneous Application / Pitch for Jugarr"
                className="btn font-mono"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#fff",
                  padding: "14px 32px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textDecoration: "none",
                  boxShadow: "4px 4px 0px 0px #000",
                }}
              >
                ✉️ Email Your Pitch to careers@jugarr.in &rarr;
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
