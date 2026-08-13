import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import connectToDatabase from "../lib/mongoose.js";
import JugarrContributor from "../models/JugarrContributor.js";
import { invalidateOgCache } from "./og.js";

const router = Router();

// Ensure profiles upload directory exists
const PROFILES_UPLOAD_DIR = path.join(process.cwd(), "uploads", "profiles");
if (!fs.existsSync(PROFILES_UPLOAD_DIR)) {
  fs.mkdirSync(PROFILES_UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration for Profile Photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROFILES_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg/;
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WEBP, GIF, SVG) are allowed."), false);
    }
  },
});

// Admin auth middleware helper
function checkAdminAuth(req) {
  const password = req.headers["x-admin-password"] || req.body?.password;
  const expectedPassword = process.env.ADMIN_PASSWORD || "jugarradmin123";
  return password && password === expectedPassword;
}

// Helper to auto-generate clean URL slug
function generateSlug(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * POST /api/jugarris/upload-image - Admin: Upload contributor profile photo from computer
 */
router.post("/upload-image", (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
  }

  profileUpload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Image size too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || "Failed to upload image." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const relativeUrl = `/uploads/profiles/${req.file.filename}`;
    res.json({
      success: true,
      url: relativeUrl,
      filename: req.file.filename,
    });
  });
});

/**
 * GET /api/jugarris - Public list of active contributors
 * Query params: search, featured, includeInactive (admin only), page, limit
 */
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();

    const { search, featured, includeInactive, page = 1, limit = 100 } = req.query;
    const isAdmin = checkAdminAuth(req);

    let query = {};

    if (!isAdmin || includeInactive !== "true") {
      query.active = true;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { shortBio: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 100, 200);
    const skip = (pageNum - 1) * limitNum;

    const [contributors, total] = await Promise.all([
      JugarrContributor.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      JugarrContributor.countDocuments(query),
    ]);

    res.set({
      "Cache-Control": "public, s-maxage=300, max-age=60, stale-while-revalidate=60",
    });

    res.json({
      success: true,
      count: contributors.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      contributors,
    });
  } catch (error) {
    console.error("Error fetching Jugarris:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * GET /api/jugarris/:slug - Public lookup single contributor by slug
 */
router.get("/:slug", async (req, res) => {
  try {
    await connectToDatabase();

    const { slug } = req.params;
    const contributor = await JugarrContributor.findOne({ slug: slug.toLowerCase() }).lean();

    if (!contributor) {
      return res.status(404).json({ error: "Contributor profile not found." });
    }

    res.set({
      "Cache-Control": "public, s-maxage=3600, max-age=300, stale-while-revalidate=60",
      ETag: `"${contributor._id}-${new Date(contributor.updatedAt || contributor.createdAt).getTime()}"`,
    });

    res.json({ success: true, contributor });
  } catch (error) {
    console.error("Error fetching contributor by slug:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * POST /api/jugarris - Admin: Create a new contributor
 */
router.post("/", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const {
      name,
      slug,
      profileImage,
      role,
      shortBio,
      longBio,
      journey,
      linkedin,
      instagram,
      github,
      twitter,
      website,
      joinedDate,
      featured,
      active,
    } = req.body;

    if (!name || !shortBio) {
      return res.status(400).json({ error: "Full Name and Short Bio are required." });
    }

    const finalSlug = generateSlug(slug || name);

    if (!finalSlug) {
      return res.status(400).json({ error: "Invalid slug generated from name." });
    }

    const existing = await JugarrContributor.findOne({ slug: finalSlug }).lean();
    if (existing) {
      return res.status(400).json({ error: `Contributor with slug '${finalSlug}' already exists.` });
    }

    const newContributor = await JugarrContributor.create({
      name: name.trim(),
      slug: finalSlug,
      profileImage: (profileImage || "").trim(),
      role: (role || "Contributor").trim(),
      shortBio: shortBio.trim(),
      longBio: (longBio || "").trim(),
      journey: (journey || "").trim(),
      linkedin: (linkedin || "").trim(),
      instagram: (instagram || "").trim(),
      github: (github || "").trim(),
      twitter: (twitter || "").trim(),
      website: (website || "").trim(),
      joinedDate: joinedDate || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      featured: !!featured,
      active: active !== undefined ? !!active : true,
    });

    res.status(201).json({ success: true, contributor: newContributor });
  } catch (error) {
    console.error("Error creating contributor:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

/**
 * PUT /api/jugarris/:id - Admin: Update an existing contributor
 */
router.put("/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const { id } = req.params;
    const contributor = await JugarrContributor.findById(id);

    if (!contributor) {
      return res.status(404).json({ error: "Contributor not found." });
    }

    const {
      name,
      slug,
      profileImage,
      role,
      shortBio,
      longBio,
      journey,
      linkedin,
      instagram,
      github,
      twitter,
      website,
      joinedDate,
      featured,
      active,
    } = req.body;

    if (name !== undefined) contributor.name = name.trim();
    if (profileImage !== undefined) contributor.profileImage = profileImage.trim();
    if (role !== undefined) contributor.role = role.trim();
    if (shortBio !== undefined) contributor.shortBio = shortBio.trim();
    if (longBio !== undefined) contributor.longBio = longBio.trim();
    if (journey !== undefined) contributor.journey = journey.trim();
    if (linkedin !== undefined) contributor.linkedin = linkedin.trim();
    if (instagram !== undefined) contributor.instagram = instagram.trim();
    if (github !== undefined) contributor.github = github.trim();
    if (twitter !== undefined) contributor.twitter = twitter.trim();
    if (website !== undefined) contributor.website = website.trim();
    if (joinedDate !== undefined) contributor.joinedDate = joinedDate.trim();
    if (featured !== undefined) contributor.featured = !!featured;
    if (active !== undefined) contributor.active = !!active;

    if (slug !== undefined && slug.trim() !== contributor.slug) {
      const formattedSlug = generateSlug(slug);
      const duplicate = await JugarrContributor.findOne({ slug: formattedSlug, _id: { $ne: id } }).lean();
      if (duplicate) {
        return res.status(400).json({ error: `Slug '${formattedSlug}' is already taken.` });
      }
      contributor.slug = formattedSlug;
    }

    await contributor.save();
    invalidateOgCache(contributor.slug);
    res.json({ success: true, contributor });
  } catch (error) {
    console.error("Error updating contributor:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

/**
 * PATCH /api/jugarris/:id/toggle-active - Admin: Quick toggle active status
 */
router.patch("/:id/toggle-active", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const { id } = req.params;
    const contributor = await JugarrContributor.findById(id);

    if (!contributor) {
      return res.status(404).json({ error: "Contributor not found." });
    }

    contributor.active = !contributor.active;
    await contributor.save();
    invalidateOgCache(contributor.slug);

    res.json({ success: true, active: contributor.active, contributor });
  } catch (error) {
    console.error("Error toggling contributor status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * DELETE /api/jugarris/:id - Admin: Delete a contributor
 */
router.delete("/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const { id } = req.params;
    const deleted = await JugarrContributor.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Contributor not found." });
    }
    invalidateOgCache(deleted.slug);

    res.json({ success: true, message: "Contributor profile deleted successfully." });
  } catch (error) {
    console.error("Error deleting contributor:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
