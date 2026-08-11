import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import connectToDatabase from "../lib/mongoose.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "resumes");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage & Validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === "application/pdf";
  const isPdfExt = path.extname(file.originalname).toLowerCase() === ".pdf";

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files (.pdf) are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Admin Auth Helper
function checkAdminAuth(req) {
  const password = req.headers["x-admin-password"] || req.body?.password;
  const expectedPassword = process.env.ADMIN_PASSWORD || "jugarradmin123";
  return password && password === expectedPassword;
}

// Simple IP-based Rate Limiter for Application Submission
const applicationRateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_APPLICATIONS_PER_WINDOW = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const userRecord = applicationRateLimitMap.get(ip);

  if (!userRecord) {
    applicationRateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (now - userRecord.startTime > RATE_LIMIT_WINDOW) {
    applicationRateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (userRecord.count >= MAX_APPLICATIONS_PER_WINDOW) {
    return true;
  }

  userRecord.count += 1;
  return false;
}

// Input Sanitizer
function sanitizeInput(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Slug Generator
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ==========================================================================
   PUBLIC ROUTES
   ========================================================================== */

// GET /api/jobs - List open jobs (filters: department, type)
router.get("/jobs", async (req, res) => {
  try {
    await connectToDatabase();
    const { department, type } = req.query;

    const query = { status: "open" };
    if (department && department !== "ALL") {
      query.department = department;
    }
    if (type && type !== "ALL") {
      query.type = type;
    }

    const jobs = await Job.find(query).sort({ postedAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    console.error("Error fetching open jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// GET /api/jobs/:slug - Get single job detail by slug
router.get("/jobs/:slug", async (req, res) => {
  try {
    await connectToDatabase();
    const { slug } = req.params;

    const job = await Job.findOne({ slug: slug.toLowerCase() });
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error("Error fetching job by slug:", error);
    res.status(500).json({ error: "Failed to fetch job posting." });
  }
});

// POST /api/jobs/:slug/apply - Submit application with resume PDF upload
router.post("/jobs/:slug/apply", (req, res) => {
  upload.single("resume")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File size exceeds limit (Max 5MB)." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || "Invalid file upload." });
    }

    try {
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
      if (isRateLimited(clientIp)) {
        // Clean up uploaded file if rate limited
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(429).json({
          error: "Too many applications submitted from your connection. Please wait a few minutes before trying again.",
        });
      }

      const { slug } = req.params;
      const { applicantName, applicantEmail, applicantPhone, collegeName, coverNote } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Resume PDF file is required." });
      }

      if (!applicantName || !applicantEmail) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: "Applicant name and email are required." });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(applicantEmail.trim())) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: "Please enter a valid email address." });
      }

      await connectToDatabase();
      const job = await Job.findOne({ slug: slug.toLowerCase() });

      if (!job) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: "Job posting not found." });
      }

      if (job.status !== "open") {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: "This position is no longer accepting applications." });
      }

      const newApplication = await Application.create({
        job: job._id,
        applicantName: sanitizeInput(applicantName),
        applicantEmail: applicantEmail.trim().toLowerCase(),
        applicantPhone: sanitizeInput(applicantPhone || ""),
        collegeName: sanitizeInput(collegeName || ""),
        resumeUrl: req.file.filename,
        resumeOriginalName: req.file.originalname,
        coverNote: sanitizeInput(coverNote || ""),
        status: "new",
      });

      res.status(201).json({
        success: true,
        message: "Application submitted successfully! We will review your profile and reach out if shortlisted.",
        applicationId: newApplication._id,
      });
    } catch (error) {
      console.error("Error submitting job application:", error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to submit application. Internal server error." });
    }
  });
});

/* ==========================================================================
   ADMIN ROUTES (Protected)
   ========================================================================== */

// GET /api/admin/jobs - List ALL jobs with application counts
router.get("/admin/jobs", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const jobs = await Job.find().sort({ postedAt: -1 }).lean();

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job,
          applicationCount,
        };
      })
    );

    res.json({ success: true, jobs: jobsWithCounts });
  } catch (error) {
    console.error("Error fetching admin jobs list:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// POST /api/admin/jobs - Create a new job
router.post("/admin/jobs", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const {
      title,
      slug,
      department,
      location,
      type,
      description,
      responsibilities,
      requirements,
      status,
    } = req.body;

    if (!title || !department || !location || !type || !description) {
      return res.status(400).json({ error: "Title, department, location, type, and description are required." });
    }

    const finalSlug = (slug || generateSlug(title)).toLowerCase();

    const existing = await Job.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ error: `Job slug '${finalSlug}' already exists. Choose a unique slug.` });
    }

    const responsibilitiesArray = Array.isArray(responsibilities)
      ? responsibilities
      : typeof responsibilities === "string"
      ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const requirementsArray = Array.isArray(requirements)
      ? requirements
      : typeof requirements === "string"
      ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
      : [];

    const newJob = await Job.create({
      title: title.trim(),
      slug: finalSlug,
      department: department.trim(),
      location: location.trim(),
      type,
      description: description.trim(),
      responsibilities: responsibilitiesArray,
      requirements: requirementsArray,
      status: status === "closed" ? "closed" : "open",
    });

    res.status(201).json({ success: true, job: newJob });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message || "Failed to create job." });
  }
});

// PUT /api/admin/jobs/:id - Update existing job
router.put("/admin/jobs/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    const {
      title,
      slug,
      department,
      location,
      type,
      description,
      responsibilities,
      requirements,
      status,
    } = req.body;

    if (title !== undefined) job.title = title.trim();
    if (department !== undefined) job.department = department.trim();
    if (location !== undefined) job.location = location.trim();
    if (type !== undefined) job.type = type;
    if (description !== undefined) job.description = description.trim();
    if (status !== undefined) job.status = status;

    if (responsibilities !== undefined) {
      job.responsibilities = Array.isArray(responsibilities)
        ? responsibilities
        : typeof responsibilities === "string"
        ? responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
        : [];
    }

    if (requirements !== undefined) {
      job.requirements = Array.isArray(requirements)
        ? requirements
        : typeof requirements === "string"
        ? requirements.split("\n").map((r) => r.trim()).filter(Boolean)
        : [];
    }

    if (slug !== undefined && slug.trim() !== job.slug) {
      const formattedSlug = generateSlug(slug);
      const duplicate = await Job.findOne({ slug: formattedSlug, _id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ error: `Slug '${formattedSlug}' is taken by another job posting.` });
      }
      job.slug = formattedSlug;
    }

    await job.save();
    res.json({ success: true, job });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: error.message || "Failed to update job." });
  }
});

// PATCH /api/admin/jobs/:id/status - Toggle status (open/closed)
router.patch("/admin/jobs/:id/status", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;
    const { status } = req.body;

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be 'open' or 'closed'." });
    }

    const job = await Job.findByIdAndUpdate(id, { status }, { new: true });
    if (!job) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    res.json({ success: true, job });
  } catch (error) {
    console.error("Error toggling job status:", error);
    res.status(500).json({ error: "Failed to update job status." });
  }
});

// DELETE /api/admin/jobs/:id - Delete job
router.delete("/admin/jobs/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;

    const deleted = await Job.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Job posting not found." });
    }

    // Delete related applications & resume files
    const apps = await Application.find({ job: id });
    for (const app of apps) {
      if (app.resumeUrl) {
        const filePath = path.join(UPLOAD_DIR, app.resumeUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await Application.deleteMany({ job: id });

    res.json({ success: true, message: "Job posting and associated applications deleted." });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Failed to delete job posting." });
  }
});

// GET /api/admin/applications - List ALL applications across all jobs
router.get("/admin/applications", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { jobId } = req.query;

    const query = {};
    if (jobId) {
      query.job = jobId;
    }

    const applications = await Application.find(query)
      .populate("job", "title department type location slug")
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res.status(500).json({ error: "Failed to fetch applications." });
  }
});

// GET /api/admin/jobs/:id/applications - List applications for a job
router.get("/admin/jobs/:id/applications", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;

    const applications = await Application.find({ job: id })
      .populate("job", "title department type location slug")
      .sort({ appliedAt: -1 });
    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ error: "Failed to fetch applications." });
  }
});

// GET /api/admin/applications/:id - Get single application detail
router.get("/admin/applications/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;

    const application = await Application.findById(id).populate("job", "title department type slug");
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error("Error fetching application details:", error);
    res.status(500).json({ error: "Failed to fetch application details." });
  }
});

// PATCH /api/admin/applications/:id/status - Update application status
router.patch("/admin/applications/:id/status", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["new", "reviewed", "shortlisted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid application status." });
    }

    const application = await Application.findByIdAndUpdate(id, { status }, { new: true });
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({ success: true, application });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status." });
  }
});

// GET /api/admin/applications/:id/resume - Secure resume file download (Admin only)
router.get("/admin/applications/:id/resume", async (req, res) => {
  try {
    const password = req.headers["x-admin-password"] || req.query.pwd;
    const expectedPassword = process.env.ADMIN_PASSWORD || "jugarradmin123";

    if (!password || password !== expectedPassword) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();
    const { id } = req.params;

    const application = await Application.findById(id);
    if (!application || !application.resumeUrl) {
      return res.status(404).json({ error: "Resume file not found for this application." });
    }

    const filePath = path.join(UPLOAD_DIR, application.resumeUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Resume PDF file does not exist on disk." });
    }

    const downloadName = application.resumeOriginalName || `Resume-${application.applicantName.replace(/\s+/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${downloadName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("Error serving resume file:", error);
    res.status(500).json({ error: "Failed to retrieve resume PDF." });
  }
});

export default router;
