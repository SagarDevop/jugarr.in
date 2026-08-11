import React, { useEffect, useState } from "react";
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { useSEO } from "@/hooks/useSEO.js";
import { getApiBaseUrl } from "@/lib/api.js";

export default function AdminPortal() {
  const API_BASE = getApiBaseUrl();
  const [password, setPassword] = useState("");
  const [sessionPassword, setSessionPassword] = useState(() => sessionStorage.getItem("admin_portal_pwd") || "");
  const [activeTab, setActiveTab] = useState("blogs"); // "blogs" | "waitlist"

  // Waitlist State
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Blog Management State
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogError, setBlogError] = useState("");
  const [blogSearch, setBlogSearch] = useState("");
  const [blogCategoryFilter, setBlogCategoryFilter] = useState("ALL");
  
  // Blog Modal/Editor State
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editorTab, setEditorTab] = useState("write"); // "write" | "preview"
  const [savingBlog, setSavingBlog] = useState(false);

  const initialFormState = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "EARN",
    author: "Team Jugarr",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    readTime: "5 min read",
    keywords: "",
    seoTitle: "",
    seoDescription: "",
    published: true,
  };

  const [blogFormData, setBlogFormData] = useState(initialFormState);

  useSEO({
    title: "Staff & Blog Portal | Jugarr Admin",
    description: "Jugarr student waitlist and blog post publishing dashboard.",
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      alert("Please enter the admin password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Invalid password");
      }

      sessionStorage.setItem("admin_portal_pwd", password);
      setSessionPassword(password);
    } catch (err) {
      alert("Unauthorized. Incorrect admin password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_portal_pwd");
    setSessionPassword("");
    setSubmissions([]);
    setBlogs([]);
    setAdminJobs([]);
    setAdminApplications([]);
    setError("");
    setBlogError("");
    setJobsError("");
    setAppsError("");
  };

  // Careers & Jobs Management State
  const [adminJobs, setAdminJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [jobSubTab, setJobSubTab] = useState("jobs"); // "jobs" | "applications"
  const [selectedJobIdForApps, setSelectedJobIdForApps] = useState("ALL");

  // Applications State
  const [adminApplications, setAdminApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);

  // Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [savingJob, setSavingJob] = useState(false);

  const initialJobFormState = {
    title: "",
    slug: "",
    department: "Tech",
    location: "Remote",
    type: "Full-time",
    description: "",
    responsibilities: "",
    requirements: "",
    status: "open",
  };
  const [jobFormData, setJobFormData] = useState(initialJobFormState);

  // Fetch Careers Jobs
  const fetchAdminJobs = () => {
    if (!sessionPassword) return;
    setJobsLoading(true);
    setJobsError("");

    fetch(`${API_BASE}/api/admin/jobs`, {
      headers: { "x-admin-password": sessionPassword },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load jobs.");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.jobs)) {
          setAdminJobs(data.jobs);
        }
        setJobsLoading(false);
      })
      .catch((err) => {
        console.error("Jobs fetch error:", err);
        setJobsError(err.message || "Could not load jobs.");
        setJobsLoading(false);
      });
  };

  // Fetch Applications
  const fetchAdminApplications = (jobId = "ALL") => {
    if (!sessionPassword) return;
    setAppsLoading(true);
    setAppsError("");

    const url =
      jobId && jobId !== "ALL"
        ? `${API_BASE}/api/admin/jobs/${jobId}/applications`
        : `${API_BASE}/api/admin/applications`;

    fetch(url, {
      headers: { "x-admin-password": sessionPassword },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load applications.");
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.applications)) {
          setAdminApplications(data.applications);
        }
        setAppsLoading(false);
      })
      .catch((err) => {
        console.error("Applications fetch error:", err);
        setAppsError(err.message || "Could not load applications.");
        setAppsLoading(false);
      });
  };

  useEffect(() => {
    if (sessionPassword && activeTab === "careers") {
      fetchAdminJobs();
      fetchAdminApplications(selectedJobIdForApps);
    }
  }, [sessionPassword, activeTab, selectedJobIdForApps]);

  const handleOpenCreateJobModal = () => {
    setEditingJobId(null);
    setJobFormData(initialJobFormState);
    setIsJobModalOpen(true);
  };

  const handleOpenEditJobModal = (job) => {
    setEditingJobId(job._id);
    setJobFormData({
      title: job.title || "",
      slug: job.slug || "",
      department: job.department || "Tech",
      location: job.location || "Remote",
      type: job.type || "Full-time",
      description: job.description || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join("\n")
        : job.responsibilities || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : job.requirements || "",
      status: job.status || "open",
    });
    setIsJobModalOpen(true);
  };

  const handleSaveJob = (e) => {
    e.preventDefault();
    if (!jobFormData.title.trim() || !jobFormData.description.trim() || !jobFormData.department.trim()) {
      alert("Title, Department, and Description are required.");
      return;
    }

    setSavingJob(true);

    const url = editingJobId
      ? `${API_BASE}/api/admin/jobs/${editingJobId}`
      : `${API_BASE}/api/admin/jobs`;
    const method = editingJobId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword,
      },
      body: JSON.stringify(jobFormData),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.error || "Failed to save job posting.");
          });
        }
        return res.json();
      })
      .then(() => {
        setSavingJob(false);
        setIsJobModalOpen(false);
        fetchAdminJobs();
      })
      .catch((err) => {
        alert(err.message);
        setSavingJob(false);
      });
  };

  const handleToggleJobStatus = (jobId, currentStatus) => {
    const nextStatus = currentStatus === "open" ? "closed" : "open";
    fetch(`${API_BASE}/api/admin/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword,
      },
      body: JSON.stringify({ status: nextStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to toggle status.");
        return res.json();
      })
      .then(() => {
        fetchAdminJobs();
      })
      .catch((err) => alert(err.message));
  };

  const handleDeleteJob = (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}" and all its submitted applications?`)) {
      return;
    }

    fetch(`${API_BASE}/api/admin/jobs/${jobId}`, {
      method: "DELETE",
      headers: { "x-admin-password": sessionPassword },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete job.");
        return res.json();
      })
      .then(() => {
        fetchAdminJobs();
        fetchAdminApplications(selectedJobIdForApps);
      })
      .catch((err) => alert(err.message));
  };

  const handleUpdateAppStatus = (appId, newStatus) => {
    fetch(`${API_BASE}/api/admin/applications/${appId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update status.");
        return res.json();
      })
      .then(() => {
        fetchAdminApplications(selectedJobIdForApps);
        if (selectedAppDetail && selectedAppDetail._id === appId) {
          setSelectedAppDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      })
      .catch((err) => alert(err.message));
  };

  const handleDownloadResume = async (appId, applicantName) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${appId}/resume`, {
        headers: { "x-admin-password": sessionPassword },
      });
      if (!res.ok) {
        alert("Failed to download resume.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume_${applicantName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading resume:", err);
      alert("Error downloading resume.");
    }
  };

  // Fetch Waitlist Submissions
  useEffect(() => {
    if (!sessionPassword || activeTab !== "waitlist") return;

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/api/waitlist/admin/submissions`, {
      headers: { "x-admin-password": sessionPassword }
    })
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
        if (err.message && err.message.includes("Unauthorized")) {
          sessionStorage.removeItem("admin_portal_pwd");
          setSessionPassword("");
        }
      });
  }, [sessionPassword, activeTab]);

  // Fetch Blog Posts
  const fetchBlogs = () => {
    if (!sessionPassword) return;

    setBlogsLoading(true);
    setBlogError("");

    fetch(`${API_BASE}/api/blogs?includeDrafts=true`, {
      headers: { "x-admin-password": sessionPassword }
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized. Incorrect admin password.");
        }
        if (!res.ok) {
          throw new Error("Failed to fetch blog posts from backend.");
        }
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.posts)) {
          setBlogs(data.posts);
        }
        setBlogsLoading(false);
      })
      .catch((err) => {
        console.error("Blog fetch error:", err);
        setBlogError(err.message || "Could not load blog posts.");
        setBlogsLoading(false);
        if (err.message && err.message.includes("Unauthorized")) {
          sessionStorage.removeItem("admin_portal_pwd");
          setSessionPassword("");
        }
      });
  };

  useEffect(() => {
    if (sessionPassword && activeTab === "blogs") {
      fetchBlogs();
    }
  }, [sessionPassword, activeTab]);

  // Auto-generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setBlogFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingBlogId ? prev.slug : generateSlug(val),
      seoTitle: prev.seoTitle === prev.title ? val : prev.seoTitle,
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingBlogId(null);
    setBlogFormData(initialFormState);
    setEditorTab("write");
    setIsBlogModalOpen(true);
  };

  const handleOpenEditModal = (blog) => {
    setEditingBlogId(blog._id);
    setBlogFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category || "EARN",
      author: blog.author || "Team Jugarr",
      date: blog.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: blog.readTime || "5 min read",
      keywords: Array.isArray(blog.keywords) ? blog.keywords.join(", ") : blog.keywords || "",
      seoTitle: blog.seoTitle || blog.title || "",
      seoDescription: blog.seoDescription || blog.excerpt || "",
      published: blog.published !== undefined ? blog.published : true,
    });
    setEditorTab("write");
    setIsBlogModalOpen(true);
  };

  // Submit Create or Edit Blog Form
  const handleSaveBlog = (e) => {
    e.preventDefault();
    if (!blogFormData.title.trim() || !blogFormData.content.trim() || !blogFormData.excerpt.trim()) {
      alert("Title, Excerpt, and Article Content are required.");
      return;
    }

    setSavingBlog(true);

    const url = editingBlogId
      ? `${API_BASE}/api/blogs/${editingBlogId}`
      : `${API_BASE}/api/blogs`;

    const method = editingBlogId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword,
      },
      body: JSON.stringify({
        ...blogFormData,
        slug: blogFormData.slug || generateSlug(blogFormData.title),
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((d) => {
            throw new Error(d.error || "Failed to save blog post.");
          });
        }
        return res.json();
      })
      .then(() => {
        setSavingBlog(false);
        setIsBlogModalOpen(false);
        fetchBlogs();
      })
      .catch((err) => {
        console.error("Save blog error:", err);
        alert(err.message || "An error occurred while saving the post.");
        setSavingBlog(false);
      });
  };

  // Toggle Published State
  const handleTogglePublish = (blog) => {
    fetch(`${API_BASE}/api/blogs/${blog._id}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-password": sessionPassword,
      },
      body: JSON.stringify({ published: !blog.published }),
    })
      .then((res) => res.json())
      .then(() => fetchBlogs())
      .catch((err) => console.error("Toggle publish error:", err));
  };

  // Delete Blog
  const handleDeleteBlog = (blog) => {
    if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) return;

    fetch(`${API_BASE}/api/blogs/${blog._id}`, {
      method: "DELETE",
      headers: { "x-admin-password": sessionPassword },
    })
      .then((res) => res.json())
      .then(() => fetchBlogs())
      .catch((err) => alert(err.message || "Could not delete blog post."));
  };

  // Dynamic statistics
  const totalWaitlistCount = submissions.length;
  const totalReferrals = submissions.reduce((sum, item) => sum + (item.referralCount || 0), 0);
  const whatsappOptInCount = submissions.filter((item) => item.joinWhatsappCommunity).length;
  const whatsappOptInRate = totalWaitlistCount > 0 
    ? Math.round((whatsappOptInCount / totalWaitlistCount) * 100) 
    : 0;

  // Filter & Sort waitlist
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

  // Filter Blogs
  const filteredBlogs = blogs.filter((b) => {
    const q = blogSearch.toLowerCase().trim();
    const matchesSearch = !q || b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q) || b.slug.includes(q);
    const matchesCat = blogCategoryFilter === "ALL" || b.category.toUpperCase() === blogCategoryFilter.toUpperCase();
    return matchesSearch && matchesCat;
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
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span className="font-mono text-outline" style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              INTERNAL MANAGEMENT PORTAL
            </span>
            <h1 className="font-display" style={{ fontSize: "40px", marginTop: "12px", marginBottom: "8px" }}>
              Staff &amp; Content Portal
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
            /* Authenticated Portal View */
            <div>
              {/* Top Navigation Bar & Logged In Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--color-outline-variant)"
              }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span className="font-mono" style={{ fontSize: "12px", fontWeight: "bold" }}>
                    🔓 STAFF ACCESS
                  </span>
                  
                  {/* Tab Navigation */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab("blogs")}
                      className="btn font-mono"
                      style={{
                        padding: "8px 16px",
                        fontSize: "11px",
                        backgroundColor: activeTab === "blogs" ? "var(--color-primary)" : "var(--color-surface-low)",
                        color: activeTab === "blogs" ? "var(--color-on-primary)" : "var(--color-primary)",
                        border: "1px solid var(--color-primary)",
                        cursor: "pointer",
                      }}
                    >
                      📝 Blog Manager &amp; Poster
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("waitlist")}
                      className="btn font-mono"
                      style={{
                        padding: "8px 16px",
                        fontSize: "11px",
                        backgroundColor: activeTab === "waitlist" ? "var(--color-primary)" : "var(--color-surface-low)",
                        color: activeTab === "waitlist" ? "var(--color-on-primary)" : "var(--color-primary)",
                        border: "1px solid var(--color-primary)",
                        cursor: "pointer",
                      }}
                    >
                      👥 Waitlist Submissions
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("careers")}
                      className="btn font-mono"
                      style={{
                        padding: "8px 16px",
                        fontSize: "11px",
                        backgroundColor: activeTab === "careers" ? "var(--color-primary)" : "var(--color-surface-low)",
                        color: activeTab === "careers" ? "var(--color-on-primary)" : "var(--color-primary)",
                        border: "1px solid var(--color-primary)",
                        cursor: "pointer",
                      }}
                    >
                      💼 Careers &amp; Jobs
                    </button>
                  </div>
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

              {/* TAB 1: BLOG MANAGER */}
              {activeTab === "blogs" && (
                <div>
                  {/* Action Header */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "24px",
                    padding: "20px",
                    border: "1px solid var(--color-primary)",
                    backgroundColor: "var(--color-surface-low)",
                  }}>
                    <div>
                      <h2 className="font-display" style={{ fontSize: "24px" }}>Blog Articles Manager</h2>
                      <p className="font-body text-muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                        Create, write, edit, and publish blogs directly to the website without code changes.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenCreateModal}
                      className="btn font-mono"
                      style={{
                        backgroundColor: "var(--color-yellow-accent)",
                        color: "var(--color-primary)",
                        padding: "12px 24px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "1px solid var(--color-primary)",
                        boxShadow: "4px 4px 0px 0px var(--color-primary)",
                        cursor: "pointer",
                      }}
                    >
                      ✍️ + Create &amp; Post New Article
                    </button>
                  </div>

                  {blogError && (
                    <div style={{
                      border: "1px solid #ff3b30",
                      backgroundColor: "rgba(255, 59, 48, 0.05)",
                      color: "#ff3b30",
                      padding: "16px",
                      marginBottom: "24px",
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: "12px",
                    }}>
                      ⚠️ ERROR: {blogError}
                    </div>
                  )}

                  {/* Filter & Search Bar */}
                  <div style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}>
                    <input
                      type="text"
                      placeholder="Search articles by title, excerpt, slug..."
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      style={{
                        flexGrow: 1,
                        minWidth: "250px",
                        padding: "12px 16px",
                        border: "1px solid var(--color-primary)",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "12px",
                        outline: "none",
                        backgroundColor: "var(--color-surface-lowest)",
                      }}
                    />

                    <select
                      value={blogCategoryFilter}
                      onChange={(e) => setBlogCategoryFilter(e.target.value)}
                      style={{
                        padding: "12px 16px",
                        border: "1px solid var(--color-primary)",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "12px",
                        backgroundColor: "var(--color-surface-lowest)",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="ALL">ALL CATEGORIES </option>
                      <option value="EARN">EARN </option>
                      <option value="SELL">SELL</option>
                      <option value="CAMPUS LIFE">CAMPUS LIFE</option>
                      <option value="CAREER">CAREER</option>
                    </select>

                    <button
                      type="button"
                      onClick={fetchBlogs}
                      className="btn font-mono"
                      style={{
                        padding: "12px 16px",
                        fontSize: "11px",
                        backgroundColor: "var(--color-surface-low)",
                        border: "1px solid var(--color-primary)",
                        cursor: "pointer",
                      }}
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  {/* Articles Table */}
                  {blogsLoading ? (
                    <div style={{ textAlign: "center", padding: "64px 0" }}>
                      <div className="font-mono" style={{ fontSize: "14px", color: "var(--color-outline)" }}>
                        LOADING BLOG ARTICLES...
                      </div>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto", border: "1px solid var(--color-primary)", backgroundColor: "var(--color-surface-lowest)", marginBottom: "40px" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-hanken), sans-serif", fontSize: "13px", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--color-primary)", backgroundColor: "var(--color-surface-low)", fontFamily: "var(--font-jetbrains), monospace", fontSize: "10px", letterSpacing: "0.05em" }}>
                            <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>CATEGORY</th>
                            <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>ARTICLE TITLE</th>
                            <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>SLUG</th>
                            <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>DATE</th>
                            <th style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)" }}>STATUS</th>
                            <th style={{ padding: "16px" }}>ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBlogs.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "var(--color-outline)", fontFamily: "var(--font-jetbrains), monospace" }}>
                                NO ARTICLES FOUND. CLICK "+ CREATE &amp; POST NEW ARTICLE" TO ADD ONE.
                              </td>
                            </tr>
                          ) : (
                            filteredBlogs.map((b, idx) => (
                              <tr key={b._id || b.slug} style={{ borderBottom: "1px solid var(--color-outline-variant)", backgroundColor: idx % 2 === 0 ? "transparent" : "var(--color-surface-low)" }}>
                                <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace", fontWeight: "bold" }}>
                                  <span style={{ padding: "4px 8px", backgroundColor: "var(--color-surface-low)", border: "1px solid var(--color-outline-variant)", fontSize: "10px" }}>
                                    {b.category}
                                  </span>
                                </td>
                                <td style={{ padding: "16px", fontWeight: "600", borderRight: "1px solid var(--color-outline-variant)", minWidth: "220px" }}>
                                  {b.title}
                                </td>
                                <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace", fontSize: "11px", color: "var(--color-outline)" }}>
                                  /blog/{b.slug}
                                </td>
                                <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace", fontSize: "11px" }}>
                                  {b.date}
                                </td>
                                <td style={{ padding: "16px", borderRight: "1px solid var(--color-outline-variant)", fontFamily: "var(--font-jetbrains), monospace" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePublish(b)}
                                    style={{
                                      padding: "4px 10px",
                                      fontSize: "10px",
                                      fontWeight: "bold",
                                      border: "none",
                                      cursor: "pointer",
                                      backgroundColor: b.published ? "rgba(46, 125, 50, 0.15)" : "rgba(255, 152, 0, 0.15)",
                                      color: b.published ? "#2e7d32" : "#e65100",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    {b.published ? "PUBLISHED ✅" : "DRAFT ⏸️"}
                                  </button>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <a
                                      href={`/blog/${b.slug}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="btn font-mono"
                                      style={{
                                        padding: "6px 10px",
                                        fontSize: "9px",
                                        backgroundColor: "var(--color-surface-low)",
                                        color: "var(--color-primary)",
                                        border: "1px solid var(--color-primary)",
                                        textDecoration: "none",
                                      }}
                                    >
                                      VIEW 👁️
                                    </a>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(b)}
                                      className="btn font-mono"
                                      style={{
                                        padding: "6px 10px",
                                        fontSize: "9px",
                                        backgroundColor: "var(--color-primary)",
                                        color: "var(--color-on-primary)",
                                        border: "none",
                                        cursor: "pointer",
                                      }}
                                    >
                                      EDIT ✏️
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBlog(b)}
                                      className="btn font-mono"
                                      style={{
                                        padding: "6px 10px",
                                        fontSize: "9px",
                                        backgroundColor: "rgba(255, 59, 48, 0.1)",
                                        color: "#ff3b30",
                                        border: "1px solid #ff3b30",
                                        cursor: "pointer",
                                      }}
                                    >
                                      DELETE 🗑️
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: WAITLIST MANAGEMENT */}
              {activeTab === "waitlist" && (
                <div>
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
                        SYNCHRONIZING WAITLIST DATA...
                      </div>
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
                        <div style={{ border: "1px solid var(--color-primary)", padding: "24px", backgroundColor: "var(--color-surface-lowest)", textAlign: "center" }}>
                          <span className="font-mono text-outline" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>TOTAL WAITLIST SIGNUPS</span>
                          <h2 className="font-display" style={{ fontSize: "40px", marginTop: "8px" }}>{totalWaitlistCount}</h2>
                        </div>
                        <div style={{ border: "1px solid var(--color-primary)", padding: "24px", backgroundColor: "var(--color-surface-lowest)", textAlign: "center" }}>
                          <span className="font-mono text-outline" style={{ fontSize: "9px", letterSpacing: "0.1em" }}>TOTAL REFERRALS COUNT</span>
                          <h2 className="font-display" style={{ fontSize: "40px", marginTop: "8px" }}>{totalReferrals}</h2>
                        </div>
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

                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                          <div className="font-mono" style={{ fontSize: "10px", fontWeight: "bold" }}>SORT BY:</div>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
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

                      {/* List Table */}
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

              {/* TAB 3: CAREERS & JOBS MANAGER */}
              {activeTab === "careers" && (
                <div>
                  {/* Action Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginBottom: "24px",
                      padding: "20px",
                      border: "1px solid var(--color-primary)",
                      backgroundColor: "var(--color-surface-low)",
                    }}
                  >
                    <div>
                      <h2 className="font-display" style={{ fontSize: "24px" }}>
                        Careers &amp; Applications Portal
                      </h2>
                      <p className="font-body text-muted" style={{ fontSize: "13px", marginTop: "4px" }}>
                        Post open job roles, toggle status, and review candidate resume applications.
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setJobSubTab("jobs")}
                        className="btn font-mono"
                        style={{
                          padding: "10px 16px",
                          fontSize: "11px",
                          backgroundColor:
                            jobSubTab === "jobs" ? "var(--color-primary)" : "var(--color-surface-low)",
                          color:
                            jobSubTab === "jobs" ? "var(--color-on-primary)" : "var(--color-primary)",
                          border: "1px solid var(--color-primary)",
                          cursor: "pointer",
                        }}
                      >
                        📋 Job Postings ({adminJobs.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setJobSubTab("applications")}
                        className="btn font-mono"
                        style={{
                          padding: "10px 16px",
                          fontSize: "11px",
                          backgroundColor:
                            jobSubTab === "applications" ? "var(--color-primary)" : "var(--color-surface-low)",
                          color:
                            jobSubTab === "applications" ? "var(--color-on-primary)" : "var(--color-primary)",
                          border: "1px solid var(--color-primary)",
                          cursor: "pointer",
                        }}
                      >
                        📥 Candidates ({adminApplications.length})
                      </button>

                      {jobSubTab === "jobs" && (
                        <button
                          type="button"
                          onClick={handleOpenCreateJobModal}
                          className="btn font-mono"
                          style={{
                            backgroundColor: "var(--color-yellow-accent)",
                            color: "var(--color-primary)",
                            padding: "10px 20px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            border: "1px solid var(--color-primary)",
                            boxShadow: "3px 3px 0px 0px var(--color-primary)",
                            cursor: "pointer",
                          }}
                        >
                          💼 + Post New Job
                        </button>
                      )}
                    </div>
                  </div>

                  {jobsError && (
                    <div
                      style={{
                        border: "1px solid #ff3b30",
                        backgroundColor: "rgba(255, 59, 48, 0.05)",
                        color: "#ff3b30",
                        padding: "16px",
                        marginBottom: "24px",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "12px",
                      }}
                    >
                      ⚠️ ERROR: {jobsError}
                    </div>
                  )}

                  {/* SUB-TAB 1: JOBS LIST */}
                  {jobSubTab === "jobs" && (
                    <>
                      {jobsLoading ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <p className="font-mono text-outline" style={{ fontSize: "12px" }}>
                            LOADING JOB POSTINGS...
                          </p>
                        </div>
                      ) : adminJobs.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            border: "1px dashed var(--color-outline-variant)",
                            backgroundColor: "var(--color-surface-low)",
                          }}
                        >
                          <p className="font-mono text-outline" style={{ fontSize: "12px" }}>
                            NO JOB POSTINGS FOUND. CLICK &quot;+ POST NEW JOB&quot; TO ADD ONE.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            overflowX: "auto",
                            border: "1px solid var(--color-primary)",
                            boxShadow: "4px 4px 0px 0px var(--color-primary)",
                          }}
                        >
                          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                            <thead>
                              <tr
                                style={{
                                  backgroundColor: "var(--color-primary)",
                                  color: "var(--color-on-primary)",
                                  fontFamily: "var(--font-jetbrains), monospace",
                                  fontSize: "10px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                <th style={{ padding: "14px 16px" }}>Title &amp; Slug</th>
                                <th style={{ padding: "14px 16px" }}>Dept / Type</th>
                                <th style={{ padding: "14px 16px" }}>Location</th>
                                <th style={{ padding: "14px 16px" }}>Status</th>
                                <th style={{ padding: "14px 16px" }}>Posted Date</th>
                                <th style={{ padding: "14px 16px" }}>Applications</th>
                                <th style={{ padding: "14px 16px" }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminJobs.map((job, idx) => (
                                <tr
                                  key={job._id}
                                  style={{
                                    borderBottom: "1px solid var(--color-outline-variant)",
                                    backgroundColor: idx % 2 === 0 ? "transparent" : "var(--color-surface-low)",
                                  }}
                                >
                                  <td style={{ padding: "14px 16px" }}>
                                    <strong style={{ display: "block" }}>{job.title}</strong>
                                    <span className="font-mono" style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                                      /careers/{job.slug}
                                    </span>
                                  </td>
                                  <td style={{ padding: "14px 16px" }}>
                                    <span className="font-mono" style={{ fontSize: "11px", fontWeight: "bold" }}>
                                      {job.department}
                                    </span>{" "}
                                    ({job.type})
                                  </td>
                                  <td style={{ padding: "14px 16px" }}>📍 {job.location}</td>
                                  <td style={{ padding: "14px 16px" }}>
                                    <span
                                      className="font-mono"
                                      style={{
                                        fontSize: "10px",
                                        padding: "2px 8px",
                                        fontWeight: "bold",
                                        backgroundColor:
                                          job.status === "open"
                                            ? "rgba(46, 125, 50, 0.15)"
                                            : "rgba(255, 59, 48, 0.15)",
                                        color: job.status === "open" ? "#2e7d32" : "#ff3b30",
                                        border: `1px solid ${job.status === "open" ? "#2e7d32" : "#ff3b30"}`,
                                      }}
                                    >
                                      {job.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="font-mono" style={{ padding: "14px 16px", fontSize: "11px" }}>
                                    {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="font-mono" style={{ padding: "14px 16px", fontWeight: "bold" }}>
                                    {job.applicationCount || 0} candidates
                                  </td>
                                  <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditJobModal(job)}
                                        className="btn font-mono"
                                        style={{ padding: "4px 8px", fontSize: "9px", border: "1px solid var(--color-primary)" }}
                                      >
                                        EDIT
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleJobStatus(job._id, job.status)}
                                        className="btn font-mono"
                                        style={{
                                          padding: "4px 8px",
                                          fontSize: "9px",
                                          backgroundColor: job.status === "open" ? "#fff" : "#2e7d32",
                                          color: job.status === "open" ? "#333" : "#fff",
                                          border: "1px solid #333",
                                        }}
                                      >
                                        {job.status === "open" ? "CLOSE" : "REOPEN"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedJobIdForApps(job._id);
                                          setJobSubTab("applications");
                                        }}
                                        className="btn font-mono"
                                        style={{ padding: "4px 8px", fontSize: "9px", backgroundColor: "var(--color-primary)", color: "#fff" }}
                                      >
                                        APPS ({job.applicationCount || 0})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteJob(job._id, job.title)}
                                        className="btn font-mono"
                                        style={{ padding: "4px 8px", fontSize: "9px", color: "#ff3b30", border: "1px solid #ff3b30" }}
                                      >
                                        DELETE
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                  {/* SUB-TAB 2: APPLICATIONS LIST */}
                  {jobSubTab === "applications" && (
                    <>
                      {/* Filter Bar */}
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          marginBottom: "24px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className="font-mono" style={{ fontSize: "11px" }}>Filter Job:</span>
                          <select
                            value={selectedJobIdForApps}
                            onChange={(e) => setSelectedJobIdForApps(e.target.value)}
                            style={{
                              padding: "8px 12px",
                              border: "1px solid var(--color-primary)",
                              fontFamily: "var(--font-jetbrains), monospace",
                              fontSize: "11px",
                              backgroundColor: "var(--color-surface-lowest)",
                            }}
                          >
                            <option value="ALL">ALL JOBS ({adminJobs.length})</option>
                            {adminJobs.map((j) => (
                              <option key={j._id} value={j._id}>
                                {j.title} ({j.department})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span className="font-mono" style={{ fontSize: "11px" }}>Status:</span>
                          <select
                            value={appStatusFilter}
                            onChange={(e) => setAppStatusFilter(e.target.value)}
                            style={{
                              padding: "8px 12px",
                              border: "1px solid var(--color-primary)",
                              fontFamily: "var(--font-jetbrains), monospace",
                              fontSize: "11px",
                              backgroundColor: "var(--color-surface-lowest)",
                            }}
                          >
                            <option value="ALL">ALL STATUSES</option>
                            <option value="new">NEW</option>
                            <option value="reviewed">REVIEWED</option>
                            <option value="shortlisted">SHORTLISTED</option>
                            <option value="rejected">REJECTED</option>
                          </select>
                        </div>
                      </div>

                      {appsLoading ? (
                        <div style={{ textAlign: "center", padding: "40px 0" }}>
                          <p className="font-mono text-outline" style={{ fontSize: "12px" }}>
                            LOADING CANDIDATE APPLICATIONS...
                          </p>
                        </div>
                      ) : adminApplications.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            border: "1px dashed var(--color-outline-variant)",
                            backgroundColor: "var(--color-surface-low)",
                          }}
                        >
                          <p className="font-mono text-outline" style={{ fontSize: "12px" }}>
                            NO CANDIDATE APPLICATIONS FOUND FOR THIS FILTER.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            overflowX: "auto",
                            border: "1px solid var(--color-primary)",
                            boxShadow: "4px 4px 0px 0px var(--color-primary)",
                          }}
                        >
                          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                            <thead>
                              <tr
                                style={{
                                  backgroundColor: "var(--color-primary)",
                                  color: "var(--color-on-primary)",
                                  fontFamily: "var(--font-jetbrains), monospace",
                                  fontSize: "10px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                <th style={{ padding: "14px 16px" }}>Candidate Name</th>
                                <th style={{ padding: "14px 16px" }}>Email / Phone</th>
                                <th style={{ padding: "14px 16px" }}>College</th>
                                <th style={{ padding: "14px 16px" }}>Applied Job</th>
                                <th style={{ padding: "14px 16px" }}>Applied Date</th>
                                <th style={{ padding: "14px 16px" }}>Status</th>
                                <th style={{ padding: "14px 16px" }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {adminApplications
                                .filter((app) => appStatusFilter === "ALL" || app.status === appStatusFilter)
                                .map((app, idx) => (
                                  <tr
                                    key={app._id}
                                    style={{
                                      borderBottom: "1px solid var(--color-outline-variant)",
                                      backgroundColor: idx % 2 === 0 ? "transparent" : "var(--color-surface-low)",
                                    }}
                                  >
                                    <td style={{ padding: "14px 16px", fontWeight: "bold" }}>
                                      {app.applicantName}
                                    </td>
                                    <td className="font-mono" style={{ padding: "14px 16px", fontSize: "11px" }}>
                                      {app.applicantEmail} <br />
                                      <span style={{ color: "var(--color-text-muted)" }}>{app.applicantPhone || "-"}</span>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>{app.collegeName || "-"}</td>
                                    <td style={{ padding: "14px 16px" }}>
                                      <strong>{app.job?.title || "Unknown Job"}</strong> <br />
                                      <span className="font-mono" style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                                        {app.job?.department}
                                      </span>
                                    </td>
                                    <td className="font-mono" style={{ padding: "14px 16px", fontSize: "11px" }}>
                                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                      <select
                                        value={app.status}
                                        onChange={(e) => handleUpdateAppStatus(app._id, e.target.value)}
                                        className="font-mono"
                                        style={{
                                          padding: "4px 8px",
                                          fontSize: "10px",
                                          fontWeight: "bold",
                                          backgroundColor:
                                            app.status === "shortlisted"
                                              ? "rgba(46, 125, 50, 0.15)"
                                              : app.status === "rejected"
                                              ? "rgba(255, 59, 48, 0.15)"
                                              : app.status === "reviewed"
                                              ? "rgba(255, 149, 0, 0.15)"
                                              : "rgba(0, 122, 255, 0.15)",
                                          color:
                                            app.status === "shortlisted"
                                              ? "#2e7d32"
                                              : app.status === "rejected"
                                              ? "#ff3b30"
                                              : app.status === "reviewed"
                                              ? "#e65100"
                                              : "#007aff",
                                          border: "1px solid var(--color-outline-variant)",
                                        }}
                                      >
                                        <option value="new">NEW</option>
                                        <option value="reviewed">REVIEWED</option>
                                        <option value="shortlisted">SHORTLISTED</option>
                                        <option value="rejected">REJECTED</option>
                                      </select>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                      <div style={{ display: "flex", gap: "6px" }}>
                                        <button
                                          type="button"
                                          onClick={() => setSelectedAppDetail(app)}
                                          className="btn font-mono"
                                          style={{ padding: "4px 8px", fontSize: "9px", backgroundColor: "var(--color-primary)", color: "#fff" }}
                                        >
                                          VIEW
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDownloadResume(app._id, app.applicantName)}
                                          className="btn font-mono"
                                          style={{ padding: "4px 8px", fontSize: "9px", backgroundColor: "var(--color-yellow-accent)", color: "var(--color-primary)", border: "1px solid var(--color-primary)" }}
                                        >
                                          📄 RESUME
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

          {/* JOB EDITOR MODAL */}
          {isJobModalOpen && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}>
              <div style={{
                width: "100%",
                maxWidth: "800px",
                border: "2px solid var(--color-primary)",
                boxShadow: "10px 10px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "32px",
                maxHeight: "90vh",
                overflowY: "auto",
                position: "relative",
              }}>
                <button
                  onClick={() => setIsJobModalOpen(false)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>

                <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "20px" }}>
                  {editingJobId ? "Edit Job Posting" : "Post New Job Role"}
                </h3>

                <form onSubmit={handleSaveJob} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        JOB TITLE *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Frontend Developer Intern"
                        value={jobFormData.title}
                        onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid var(--color-primary)",
                          fontFamily: "var(--font-hanken), sans-serif",
                        }}
                      />
                    </div>
                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        DEPARTMENT *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tech, Marketing, Design, Operations"
                        value={jobFormData.department}
                        onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid var(--color-primary)",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        LOCATION *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Remote, On-campus - Kanpur"
                        value={jobFormData.location}
                        onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid var(--color-primary)",
                        }}
                      />
                    </div>

                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        EMPLOYMENT TYPE *
                      </label>
                      <select
                        value={jobFormData.type}
                        onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid var(--color-primary)",
                          backgroundColor: "#fff",
                        }}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Gig">Gig</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        STATUS *
                      </label>
                      <select
                        value={jobFormData.status}
                        onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "1px solid var(--color-primary)",
                          backgroundColor: "#fff",
                        }}
                      >
                        <option value="open">OPEN</option>
                        <option value="closed">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                      URL SLUG (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if left blank (e.g. frontend-developer-intern)"
                      value={jobFormData.slug}
                      onChange={(e) => setJobFormData({ ...jobFormData, slug: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid var(--color-primary)",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: "12px",
                      }}
                    />
                  </div>

                  <div>
                    <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                      JOB DESCRIPTION *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Detailed overview of the role..."
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid var(--color-primary)",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                      RESPONSIBILITIES (ONE PER LINE)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Build responsive React UI components&#10;Integrate REST APIs with backend&#10;Collaborate with design team"
                      value={jobFormData.responsibilities}
                      onChange={(e) => setJobFormData({ ...jobFormData, responsibilities: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid var(--color-primary)",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div>
                    <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                      REQUIREMENTS (ONE PER LINE)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Proficiency in React.js and JavaScript (ES6+)&#10;Familiarity with Git and REST APIs&#10;Strong communication skills"
                      value={jobFormData.requirements}
                      onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid var(--color-primary)",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
                    <button
                      type="button"
                      onClick={() => setIsJobModalOpen(false)}
                      className="btn font-mono"
                      style={{ padding: "10px 20px", border: "1px solid var(--color-outline)" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingJob}
                      className="btn font-mono"
                      style={{
                        padding: "10px 24px",
                        backgroundColor: "var(--color-primary)",
                        color: "#fff",
                        border: "none",
                        fontWeight: "bold",
                      }}
                    >
                      {savingJob ? "Saving..." : editingJobId ? "Update Job Role" : "Publish Job Role"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* APPLICATION DETAILS MODAL */}
          {selectedAppDetail && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}>
              <div style={{
                width: "100%",
                maxWidth: "650px",
                border: "2px solid var(--color-primary)",
                boxShadow: "10px 10px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "32px",
                maxHeight: "90vh",
                overflowY: "auto",
                position: "relative",
              }}>
                <button
                  onClick={() => setSelectedAppDetail(null)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>

                <h3 className="font-display" style={{ fontSize: "24px", marginBottom: "16px", borderBottom: "1px solid var(--color-primary)", paddingBottom: "12px" }}>
                  Candidate Application Detail
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "13px" }}>
                    <div>
                      <strong>Applicant Name:</strong> <br /> {selectedAppDetail.applicantName}
                    </div>
                    <div>
                      <strong>Email:</strong> <br /> {selectedAppDetail.applicantEmail}
                    </div>
                    <div>
                      <strong>Phone:</strong> <br /> {selectedAppDetail.applicantPhone || "N/A"}
                    </div>
                    <div>
                      <strong>College:</strong> <br /> {selectedAppDetail.collegeName || "N/A"}
                    </div>
                    <div>
                      <strong>Applied Position:</strong> <br /> {selectedAppDetail.job?.title || "N/A"} ({selectedAppDetail.job?.department})
                    </div>
                    <div>
                      <strong>Applied Date:</strong> <br /> {new Date(selectedAppDetail.appliedAt || selectedAppDetail.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <strong>Application Status:</strong> <br />
                    <select
                      value={selectedAppDetail.status}
                      onChange={(e) => handleUpdateAppStatus(selectedAppDetail._id, e.target.value)}
                      className="font-mono"
                      style={{
                        marginTop: "6px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        border: "1px solid var(--color-primary)",
                      }}
                    >
                      <option value="new">NEW</option>
                      <option value="reviewed">REVIEWED</option>
                      <option value="shortlisted">SHORTLISTED</option>
                      <option value="rejected">REJECTED</option>
                    </select>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant)", margin: "8px 0" }} />

                  <div>
                    <strong>Cover Note / Intro:</strong>
                    <p
                      className="font-body"
                      style={{
                        padding: "12px",
                        backgroundColor: "var(--color-surface-low)",
                        borderLeft: "3px solid var(--color-primary)",
                        marginTop: "6px",
                        fontSize: "13px",
                        lineHeight: "1.6",
                      }}
                    >
                      {selectedAppDetail.coverNote || "No cover note provided by candidate."}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                    <button
                      type="button"
                      onClick={() => handleDownloadResume(selectedAppDetail._id, selectedAppDetail.applicantName)}
                      className="btn font-mono"
                      style={{
                        flexGrow: 1,
                        backgroundColor: "var(--color-yellow-accent)",
                        color: "var(--color-primary)",
                        padding: "12px",
                        fontWeight: "bold",
                        border: "1px solid var(--color-primary)",
                        boxShadow: "3px 3px 0px 0px var(--color-primary)",
                      }}
                    >
                      📄 Download PDF Resume
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAppDetail(null)}
                      className="btn font-mono"
                      style={{
                        padding: "12px 24px",
                        backgroundColor: "var(--color-primary)",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          )}

          {/* BLOG EDITOR MODAL */}
          {isBlogModalOpen && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "16px",
            }}>
              <div style={{
                width: "100%",
                maxWidth: "900px",
                border: "2px solid var(--color-primary)",
                boxShadow: "10px 10px 0px 0px var(--color-primary)",
                backgroundColor: "var(--color-surface-lowest)",
                padding: "32px",
                maxHeight: "90vh",
                overflowY: "auto",
                position: "relative",
              }}>
                <button
                  onClick={() => setIsBlogModalOpen(false)}
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: "24px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    color: "var(--color-primary)",
                  }}
                  aria-label="Close modal"
                >
                  ×
                </button>

                <h3 className="font-display" style={{ fontSize: "26px", marginBottom: "8px" }}>
                  {editingBlogId ? "✏️ Edit Blog Article" : "✍️ Post New Blog Article"}
                </h3>
                <p className="font-body text-muted" style={{ fontSize: "13px", marginBottom: "24px" }}>
                  Fill in the article details below to publish directly to the website.
                </p>

                <form onSubmit={handleSaveBlog}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Title & Category Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                          ARTICLE TITLE *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5 Smart Campus Side Hustles for Students"
                          value={blogFormData.title}
                          onChange={handleTitleChange}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid var(--color-primary)",
                            fontFamily: "var(--font-hanken), sans-serif",
                            fontSize: "14px",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                          CATEGORY *
                        </label>
                        <select
                          value={blogFormData.category}
                          onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid var(--color-primary)",
                            fontFamily: "var(--font-jetbrains), monospace",
                            fontSize: "12px",
                            backgroundColor: "var(--color-surface-lowest)",
                            outline: "none",
                          }}
                        >
                          <option value="EARN">EARN</option>
                          <option value="SELL">SELL</option>
                          <option value="CAMPUS LIFE">CAMPUS LIFE</option>
                          <option value="CAREER">CAREER</option>
                        </select>
                      </div>
                    </div>

                    {/* Slug & Author Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "16px" }}>
                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                          URL SLUG (AUTO-GENERATED) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 5-smart-campus-side-hustles"
                          value={blogFormData.slug}
                          onChange={(e) => setBlogFormData({ ...blogFormData, slug: generateSlug(e.target.value) })}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid var(--color-primary)",
                            fontFamily: "var(--font-jetbrains), monospace",
                            fontSize: "12px",
                            outline: "none",
                            backgroundColor: "var(--color-surface-low)",
                          }}
                        />
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                          AUTHOR
                        </label>
                        <input
                          type="text"
                          value={blogFormData.author}
                          onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid var(--color-primary)",
                            fontFamily: "var(--font-hanken), sans-serif",
                            fontSize: "13px",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                          READ TIME
                        </label>
                        <input
                          type="text"
                          value={blogFormData.readTime}
                          onChange={(e) => setBlogFormData({ ...blogFormData, readTime: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "12px",
                            border: "1px solid var(--color-primary)",
                            fontFamily: "var(--font-jetbrains), monospace",
                            fontSize: "12px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
                        EXCERPT / SUMMARY (Displayed on cards &amp; search previews) *
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Brief 1-2 sentence overview of the article..."
                        value={blogFormData.excerpt}
                        onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value, seoDescription: blogFormData.seoDescription || e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          border: "1px solid var(--color-primary)",
                          fontFamily: "var(--font-hanken), sans-serif",
                          fontSize: "13px",
                          outline: "none",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Content Section with Write vs Live Preview Tabs */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label className="font-mono" style={{ fontSize: "11px", fontWeight: "bold" }}>
                          ARTICLE BODY (HTML &amp; Formatting Supported) *
                        </label>
                        
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            type="button"
                            onClick={() => setEditorTab("write")}
                            style={{
                              padding: "4px 12px",
                              fontSize: "11px",
                              fontFamily: "var(--font-jetbrains), monospace",
                              backgroundColor: editorTab === "write" ? "var(--color-primary)" : "var(--color-surface-low)",
                              color: editorTab === "write" ? "var(--color-on-primary)" : "var(--color-primary)",
                              border: "1px solid var(--color-primary)",
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Edit HTML Content
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorTab("preview")}
                            style={{
                              padding: "4px 12px",
                              fontSize: "11px",
                              fontFamily: "var(--font-jetbrains), monospace",
                              backgroundColor: editorTab === "preview" ? "var(--color-primary)" : "var(--color-surface-low)",
                              color: editorTab === "preview" ? "var(--color-on-primary)" : "var(--color-primary)",
                              border: "1px solid var(--color-primary)",
                              cursor: "pointer",
                            }}
                          >
                            👁️ Live Article Preview
                          </button>
                        </div>
                      </div>

                      {editorTab === "write" ? (
                        <textarea
                          required
                          rows={12}
                          placeholder="<p>Write your blog post here using HTML tags like <h2>, <p>, <ul>, <li>, <strong>...</p>"
                          value={blogFormData.content}
                          onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "16px",
                            border: "1px solid var(--color-primary)",
                            fontFamily: "var(--font-jetbrains), monospace",
                            fontSize: "12px",
                            lineHeight: "1.6",
                            outline: "none",
                            backgroundColor: "var(--color-surface-low)",
                          }}
                        />
                      ) : (
                        <div
                          className="article-body"
                          style={{
                            minHeight: "250px",
                            maxHeight: "350px",
                            overflowY: "auto",
                            padding: "20px",
                            border: "1px solid var(--color-primary)",
                            backgroundColor: "var(--color-surface-lowest)",
                          }}
                          dangerouslySetInnerHTML={{ __html: blogFormData.content || "<p style='color:#999;'>No content written yet.</p>" }}
                        />
                      )}
                    </div>

                    {/* SEO Metadata & Keywords */}
                    <div style={{ borderTop: "1px dashed var(--color-outline-variant)", paddingTop: "16px" }}>
                      <span className="font-mono" style={{ fontSize: "11px", fontWeight: "bold", color: "var(--color-outline)", display: "block", marginBottom: "12px" }}>
                        🔍 SEO &amp; METADATA OPTIMIZATION (OPTIONAL)
                      </span>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "12px" }}>
                        <div>
                          <label className="font-mono" style={{ fontSize: "10px", display: "block", marginBottom: "4px" }}>
                            SEO TITLE (Search engine title)
                          </label>
                          <input
                            type="text"
                            placeholder="Defaults to article title"
                            value={blogFormData.seoTitle}
                            onChange={(e) => setBlogFormData({ ...blogFormData, seoTitle: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px",
                              border: "1px solid var(--color-outline-variant)",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        </div>
                        <div>
                          <label className="font-mono" style={{ fontSize: "10px", display: "block", marginBottom: "4px" }}>
                            KEYWORDS (Comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. side hustles, earn money, student jobs"
                            value={blogFormData.keywords}
                            onChange={(e) => setBlogFormData({ ...blogFormData, keywords: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "10px",
                              border: "1px solid var(--color-outline-variant)",
                              fontSize: "12px",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-mono" style={{ fontSize: "10px", display: "block", marginBottom: "4px" }}>
                          SEO META DESCRIPTION
                        </label>
                        <input
                          type="text"
                          placeholder="Defaults to excerpt"
                          value={blogFormData.seoDescription}
                          onChange={(e) => setBlogFormData({ ...blogFormData, seoDescription: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid var(--color-outline-variant)",
                            fontSize: "12px",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Publish Status Toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", backgroundColor: "var(--color-surface-low)", border: "1px solid var(--color-outline-variant)" }}>
                      <input
                        type="checkbox"
                        id="publishedToggle"
                        checked={blogFormData.published}
                        onChange={(e) => setBlogFormData({ ...blogFormData, published: e.target.checked })}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <label htmlFor="publishedToggle" className="font-mono" style={{ fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
                        {blogFormData.published ? "✅ PUBLISH IMMEDIATELY (Visible on website)" : "⏸️ SAVE AS DRAFT (Hidden from website)"}
                      </label>
                    </div>

                    {/* Submit Actions */}
                    <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => setIsBlogModalOpen(false)}
                        className="btn font-mono"
                        style={{
                          padding: "14px 24px",
                          fontSize: "12px",
                          backgroundColor: "transparent",
                          color: "var(--color-outline)",
                          border: "1px solid var(--color-outline)",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={savingBlog}
                        className="btn font-mono"
                        style={{
                          padding: "14px 28px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor: "var(--color-primary)",
                          color: "var(--color-on-primary)",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {savingBlog ? "SAVING ARTICLE..." : editingBlogId ? "💾 SAVE CHANGES" : "🚀 POST BLOG ARTICLE"}
                      </button>
                    </div>

                  </div>
                </form>
              </div>
            </div>
          )}

          {/* WAITLIST DETAILS MODAL */}
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
    </>
  );
}
