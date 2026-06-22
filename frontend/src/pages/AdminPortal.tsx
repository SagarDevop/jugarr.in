import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

interface SubmissionData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  joinWhatsappCommunity: boolean;
  collegeName: string;
  passoutYear: string;
  problemFace: string;
  whyJoin: string;
  suggestions: string;
  referralCode: string;
  referredBy: string;
  referralCount: number;
  rank: number;
  createdAt: string;
}

export default function AdminPortal() {
  const [password, setPassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState(() => sessionStorage.getItem("admin_portal_pwd") || "");
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rank" | "referrals">("newest");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);

  useSEO({
    title: "Staff Portal | Jugarr Admin",
    description: "Jugarr student waitlist and referral metrics monitoring dashboard.",
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      alert("Please enter the admin password.");
      return;
    }
    sessionStorage.setItem("admin_portal_pwd", password);
    setSessionPassword(password);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_portal_pwd");
    setSessionPassword("");
    setSubmissions([]);
    setError("");
  };

  useEffect(() => {
    if (!sessionPassword) return;

    setLoading(true);
    setError("");

    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/waitlist/admin/submissions?password=${encodeURIComponent(sessionPassword)}`)
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized. Incorrect admin password.");
        }
        if (!res.ok) {
          throw new Error("Failed to load waitlist data. Server error.");
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.submissions)) {
          setSubmissions(data.submissions);
        } else {
          setError("No waitlist submissions returned.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Admin fetch error:", err);
        setError(err.message || "An error occurred while loading waitlist.");
        setLoading(false);
        // Clear stored password if it was incorrect
        if (err.message.includes("Unauthorized")) {
          sessionStorage.removeItem("admin_portal_pwd");
          setSessionPassword("");
        }
      });
  }, [sessionPassword]);

  // Dynamic statistics
  const totalWaitlistCount = submissions.length;
  const totalReferrals = submissions.reduce((sum, item) => sum + (item.referralCount || 0), 0);
  const whatsappOptInCount = submissions.filter((item) => item.joinWhatsappCommunity).length;
  const whatsappOptInRate = totalWaitlistCount > 0 
    ? Math.round((whatsappOptInCount / totalWaitlistCount) * 100) 
    : 0;

  // Filter & Sort submissions
  const filteredSubmissions = submissions
    .filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.collegeName.toLowerCase().includes(query) ||
        (item.phone && item.phone.includes(query)) ||
        (item.referralCode && item.referralCode.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "rank") {
        return a.rank - b.rank;
      }
      if (sortBy === "referrals") {
        return (b.referralCount || 0) - (a.referralCount || 0);
      }
      return 0;
    });

  // Export to CSV Function
  const exportToCSV = () => {
    if (submissions.length === 0) return;
    
    const headers = [
      "Rank", "Name", "Email", "Phone", "College", "Passout Year", 
      "WhatsApp Community", "Referral Code", "Referred By", "Referrals Count", 
      "Problems", "Why Join", "Suggestions", "Registration Date"
    ];

    const rows = submissions.map((s) => [
      s.rank,
      `"${s.name.replace(/"/g, '""')}"`,
      s.email,
      s.phone,
      `"${s.collegeName.replace(/"/g, '""')}"`,
      s.passoutYear,
      s.joinWhatsappCommunity ? "Yes" : "No",
      s.referralCode || "",
      s.referredBy || "",
      s.referralCount || 0,
      `"${(s.problemFace || "").replace(/"/g, '""')}"`,
      `"${(s.whyJoin || "").replace(/"/g, '""')}"`,
      `"${(s.suggestions || "").replace(/"/g, '""')}"`,
      new Date(s.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jugarr_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />
      <main style={{ paddingBottom: "96px" }}>
        <div className="container" style={{ paddingTop: "64px" }}>
          
          {/* Main Title Section */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span className="font-mono text-outline" style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              INTERNAL SYSTEM ACCESS
            </span>
            <h1 className="font-display" style={{ fontSize: "40px", marginTop: "12px", marginBottom: "8px" }}>
              Staff Monitoring Portal
            </h1>
            <div className="editorial-line" style={{ margin: "12px auto" }}></div>
          </div>

          {!sessionPassword ? (
            /* Login Form Gate */
            <div style={{
              maxWidth: "450px",
              margin: "0 auto 64px",
              border: "1px solid var(--color-primary)",
              boxShadow: "10px 10px 0px 0px var(--color-primary)",
              backgroundColor: "var(--color-surface-lowest)",
              padding: "40px"
            }}>
              <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "20px", textAlign: "center" }}>
                Admin Authentication
              </h3>
              <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="password"
                  placeholder="ENTER STAFF ACCESS PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "1px solid var(--color-primary)",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "12px",
                    color: "var(--color-primary)",
                    outline: "none",
                    backgroundColor: "var(--color-surface-low)",
                  }}
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary font-mono"
                  style={{ width: "100%", padding: "16px" }}
                >
                  Verify Access &rarr;
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard View */
            <div>
              {/* Toolbar Section */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "32px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--color-outline-variant)"
              }}>
                <div className="font-mono" style={{ fontSize: "12px", fontWeight: "bold" }}>
                  🔓 LOGGED IN AS STAFF
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn font-mono"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-outline)",
                    border: "1px solid var(--color-outline)",
                    padding: "8px 16px",
                    fontSize: "10px"
                  }}
                >
                  Log Out
                </button>
              </div>

              {error && (
                <div style={{
                  border: "1px solid #ff3b30",
                  backgroundColor: "rgba(255, 59, 48, 0.05)",
                  color: "#ff3b30",
                  padding: "16px",
                  marginBottom: "32px",
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: "12px",
                  textAlign: "center"
                }}>
                  ⚠️ ERROR: {error}
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: "center", padding: "64px 0" }}>
                  <div className="font-mono" style={{ fontSize: "14px", color: "var(--color-outline)", marginBottom: "16px" }}>
                    SYNCHRONIZING SECURE DATA...
                  </div>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    border: "2px solid var(--color-primary)",
                    borderTopColor: "var(--color-yellow-accent)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto"
                  }}></div>
                </div>
              ) : (
                <>
                  {/* Stats Overview */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "24px",
                    marginBottom: "40px"
                  }}>
                    {/* Stat 1 */}
                    <div style={{ border: "1px solid var(--color-primary)", padding: "24px", backgroundColor: "var(--color-surface-lowest)", textAlign: "center" }}>
                      <span className="font-mono text-outline" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>TOTAL WAITLIST SIGNUPS</span>
                      <h2 className="font-display" style={{ fontSize: "40px", marginTop: "8px" }}>{totalWaitlistCount}</h2>
                    </div>
                    {/* Stat 2 */}
                    <div style={{ border: "1px solid var(--color-primary)", padding: "24px", backgroundColor: "var(--color-surface-lowest)", textAlign: "center" }}>
                      <span className="font-mono text-outline" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>TOTAL REFERRALS COUNT</span>
                      <h2 className="font-display" style={{ fontSize: "40px", marginTop: "8px" }}>{totalReferrals}</h2>
                    </div>
                    {/* Stat 3 */}
                    <div style={{ border: "1px solid var(--color-primary)", padding: "24px", backgroundColor: "var(--color-surface-lowest)", textAlign: "center" }}>
                      <span className="font-mono text-outline" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>WHATSAPP CHANNEL OPT-IN</span>
                      <h2 className="font-display" style={{ fontSize: "40px", marginTop: "8px" }}>{whatsappOptInRate}%</h2>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "24px",
                    border: "1px solid var(--color-primary)",
                    padding: "16px",
                    backgroundColor: "var(--color-surface-low)"
                  }}>
                    {/* Search */}
                    <input
                      type="text"
                      placeholder="SEARCH BY NAME, EMAIL, COLLEGE..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        flexGrow: 1,
                        minWidth: "250px",
                        padding: "12px 16px",
                        border: "1px solid var(--color-primary)",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "11px",
                        color: "var(--color-primary)",
                        outline: "none",
                        backgroundColor: "var(--color-surface-lowest)"
                      }}
                    />

                    {/* Sorting & Export */}
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                      <div className="font-mono" style={{ fontSize: "10px", fontWeight: "bold" }}>SORT BY:</div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        style={{
                          padding: "12px",
                          border: "1px solid var(--color-primary)",
                          fontFamily: "var(--font-jetbrains), monospace",
                          fontSize: "11px",
                          backgroundColor: "var(--color-surface-lowest)",
                          outline: "none",
                          cursor: "pointer"
                        }}
                      >
                        <option value="newest">NEWEST REGISTRANTS</option>
                        <option value="oldest">OLDEST REGISTRANTS</option>
                        <option value="rank">LEADERBOARD RANK</option>
                        <option value="referrals">MOST REFERRALS</option>
                      </select>

                      <button
                        onClick={exportToCSV}
                        className="btn font-mono"
                        style={{
                          backgroundColor: "var(--color-yellow-accent)",
                          color: "var(--color-primary)",
                          padding: "12px 20px",
                          fontSize: "11px",
                          border: "1px solid var(--color-primary)"
                        }}
                      >
                        EXPORT TO CSV 📁
                      </button>
                    </div>
                  </div>

                  {/* List / Table */}
                  <div style={{ overflowX: "auto", border: "1px solid var(--color-primary)", backgroundColor: "var(--color-surface-lowest)", marginBottom: "40px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-hanken), sans-serif", fontSize: "13px", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--color-primary)", backgroundColor: "var(--color-surface-low)", fontFamily: "var(--font-jetbrains), monospace", fontSize: "10px", letterSpacing: "0.05em" }}>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>RANK</th>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>NAME</th>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>EMAIL</th>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>PHONE</th>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>COLLEGE (YEAR)</th>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>REF CODE</th>
                          <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>REFERRALS</th>
                          <th style={{ padding: "16px" }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "var(--color-outline)", fontFamily: "var(--font-jetbrains), monospace" }}>
                              NO REGISTRANTS FOUND MATCHING FILTER.
                            </td>
                          </tr>
                        ) : (
                          filteredSubmissions.map((s, idx) => (
                            <tr key={s._id} style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: idx % 2 === 0 ? "transparent" : "var(--color-surface-low)" }}>
                              <td style={{ padding: "16px", fontWeight: "bold", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace" }}>#{s.rank}</td>
                              <td style={{ padding: "16px", fontWeight: "600", borderRight: "1px solid var(--color-outline-variant)" }}>{s.name}</td>
                              <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace" }}>{s.email}</td>
                              <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace" }}>{s.phone}</td>
                              <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>
                                {s.collegeName} <span style={{ color: "var(--color-outline)", fontSize: "11px" }}>({s.passoutYear})</span>
                              </td>
                              <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace" }}>{s.referralCode || "-"}</td>
                              <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontWeight: "bold", fontFamily: "var(--font-jetbrains), monospace" }}>{s.referralCount || 0}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSubmission(s)}
                                  className="btn font-mono"
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "9px",
                                    backgroundColor: "var(--color-primary)",
                                    color: "var(--color-on-primary)",
                                    border: "none",
                                    cursor: "pointer"
                                  }}
                                >
                                  DETAILS
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Details Modal */}
          {selectedSubmission && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px"
            }}>
              <div style={{
                width: "100%",
                maxWidth: "600px",
                border: "2px solid var(--color-primary)",
                boxShadow: "10px 10px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "32px",
                maxHeight: "85vh",
                overflowY: "auto",
                position: "relative"
              }}>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "20px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "var(--color-primary)"
                  }}
                  aria-label="Close details"
                >
                  ×
                </button>

                <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "16px", borderBottom: "1px solid var(--color-primary)", paddingBottom: "12px" }}>
                  Registration Metadata
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <strong>Full Name:</strong> <br /> {selectedSubmission.name}
                    </div>
                    <div>
                      <strong>Email:</strong> <br /> {selectedSubmission.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> <br /> {selectedSubmission.phone}
                    </div>
                    <div>
                      <strong>College (Passout):</strong> <br /> {selectedSubmission.collegeName} ({selectedSubmission.passoutYear})
                    </div>
                    <div>
                      <strong>Referral Code:</strong> <br /> <span className="font-mono">{selectedSubmission.referralCode || "-"}</span>
                    </div>
                    <div>
                      <strong>Referred By Code:</strong> <br /> <span className="font-mono">{selectedSubmission.referredBy || "-"}</span>
                    </div>
                    <div>
                      <strong>Leaderboard Rank:</strong> <br /> <span className="font-mono">#{selectedSubmission.rank}</span>
                    </div>
                    <div>
                      <strong>Successful Invites:</strong> <br /> <span className="font-mono">{selectedSubmission.referralCount || 0}</span>
                    </div>
                    <div>
                      <strong>WhatsApp Opt-In:</strong> <br /> {selectedSubmission.joinWhatsappCommunity ? "Yes ✅" : "No ❌"}
                    </div>
                    <div>
                      <strong>Registration Time:</strong> <br /> {new Date(selectedSubmission.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant)", margin: "8px 0" }} />

                  {/* Survey Responses */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                    <div>
                      <strong>1. Campus Market Problems Faced:</strong>
                      <p className="font-body text-muted" style={{ padding: "8px", backgroundColor: "var(--color-surface-low)", borderLeft: "2px solid var(--color-primary)", marginTop: "4px", fontSize: "12.5px" }}>
                        {selectedSubmission.problemFace || "N/A"}
                      </p>
                    </div>
                    <div>
                      <strong>2. Why Join Jugarr:</strong>
                      <p className="font-body text-muted" style={{ padding: "8px", backgroundColor: "var(--color-surface-low)", borderLeft: "2px solid var(--color-primary)", marginTop: "4px", fontSize: "12.5px" }}>
                        {selectedSubmission.whyJoin || "N/A"}
                      </p>
                    </div>
                    <div>
                      <strong>3. Suggestions/Features Requested:</strong>
                      <p className="font-body text-muted" style={{ padding: "8px", backgroundColor: "var(--color-surface-low)", borderLeft: "2px solid var(--color-primary)", marginTop: "4px", fontSize: "12.5px" }}>
                        {selectedSubmission.suggestions || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="btn font-mono"
                  style={{
                    marginTop: "24px",
                    width: "100%",
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-primary)",
                    padding: "12px",
                    border: "none"
                  }}
                >
                  Close Details
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
      
      {/* Loading Spin animation styles inside component */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
