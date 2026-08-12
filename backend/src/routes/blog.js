import { Router } from "express";
import connectToDatabase from "../lib/mongoose.js";
import BlogPost from "../models/BlogPost.js";

const router = Router();


// Admin auth middleware helper
function checkAdminAuth(req) {
  const password = req.headers["x-admin-password"] || req.body?.password;
  const expectedPassword = process.env.ADMIN_PASSWORD || "jugarradmin123";
  return password && password === expectedPassword;
}


// GET /api/blogs - Public list of blogs
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();

    // `exclude` is used by the related-posts fetch on the blog post page
    // to avoid returning the currently-viewed article in the related list.
    const { category, search, includeDrafts, exclude, page = 1, limit = 10 } = req.query;

    let query = {};
    const isAdmin = checkAdminAuth(req);

    if (!isAdmin || includeDrafts !== "true") {
      query.published = true;
    }

    if (category && category !== "ALL") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search.trim() };
    }

    // Exclude a specific slug (used for related-posts sidebar).
    if (exclude) {
      query.slug = { $ne: exclude.toLowerCase() };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50); // hard cap at 50
    const skip = (pageNum - 1) * limitNum;

    // .lean() returns plain JS objects instead of Mongoose documents,
    // skipping hydration and reducing memory allocation by ~60%.
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .select("-content")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    // Cache: CDN holds for 5 min, browser holds for 1 min.
    // stale-while-revalidate lets Vercel serve stale while fetching fresh.
    res.set({
      "Cache-Control": "public, s-maxage=300, max-age=60, stale-while-revalidate=60",
    });
    res.json({ success: true, count: posts.length, total, page: pageNum, totalPages: Math.ceil(total / limitNum), posts });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/blogs/:slug - Public single post lookup by slug
router.get("/:slug", async (req, res) => {
  try {
    await connectToDatabase();

    const { slug } = req.params;

    // .lean() returns a plain JS object — no Mongoose overhead on a read-only route.
    const post = await BlogPost.findOne({ slug: slug.toLowerCase() }).lean();

    if (!post) {
      return res.status(404).json({ error: "Article not found." });
    }

    // Cache: Vercel/CDN holds for 1 hour, browser holds for 5 min.
    // stale-while-revalidate=60 lets CDN serve stale while fetching fresh in background.
    // ETag enables conditional GET (304 Not Modified) for unchanged content.
    res.set({
      "Cache-Control": "public, s-maxage=3600, max-age=300, stale-while-revalidate=60",
      "ETag": `"${post._id}-${new Date(post.updatedAt || post.createdAt).getTime()}"`,
    });
    res.json({ success: true, post });
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/blogs - Admin: Create new blog post
router.post("/", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const {
      title,
      slug,
      excerpt,
      content,
      author,
      date,
      readTime,
      category,
      keywords,
      seoTitle,
      seoDescription,
      published,
    } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({ error: "Title, excerpt, and content are required." });
    }

    // Auto-generate slug if not provided
    const finalSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // .lean() is safe here — we only need to check existence, not mutate the document.
    const existing = await BlogPost.findOne({ slug: finalSlug }).lean();
    if (existing) {
      return res.status(400).json({ error: `Article slug '${finalSlug}' already exists. Please choose a unique slug or title.` });
    }

    const keywordsArray = Array.isArray(keywords)
      ? keywords
      : typeof keywords === "string"
      ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [];

    const newPost = await BlogPost.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      author: (author || "Team Jugarr").trim(),
      date: date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: readTime || "5 min read",
      category: (category || "EARN").toUpperCase().trim(),
      keywords: keywordsArray,
      seoTitle: (seoTitle || title).trim(),
      seoDescription: (seoDescription || excerpt).trim(),
      published: published !== undefined ? !!published : true,
    });

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

// PUT /api/blogs/:id - Admin: Update existing blog post
router.put("/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const { id } = req.params;
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ error: "Article not found." });
    }

    const {
      title,
      slug,
      excerpt,
      content,
      author,
      date,
      readTime,
      category,
      keywords,
      seoTitle,
      seoDescription,
      published,
    } = req.body;

    if (title !== undefined) post.title = title.trim();
    if (excerpt !== undefined) post.excerpt = excerpt.trim();
    if (content !== undefined) post.content = content.trim();
    if (author !== undefined) post.author = author.trim();
    if (date !== undefined) post.date = date;
    if (readTime !== undefined) post.readTime = readTime.trim();
    if (category !== undefined) post.category = category.toUpperCase().trim();
    if (seoTitle !== undefined) post.seoTitle = seoTitle.trim();
    if (seoDescription !== undefined) post.seoDescription = seoDescription.trim();
    if (published !== undefined) post.published = !!published;

    if (keywords !== undefined) {
      post.keywords = Array.isArray(keywords)
        ? keywords
        : typeof keywords === "string"
        ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];
    }

    if (slug !== undefined && slug.trim() !== post.slug) {
      const formattedSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // .lean() — only checking existence, no document mutation needed.
      const duplicate = await BlogPost.findOne({ slug: formattedSlug, _id: { $ne: id } }).lean();
      if (duplicate) {
        return res.status(400).json({ error: `Slug '${formattedSlug}' is already taken by another article.` });
      }
      post.slug = formattedSlug;
    }

    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  }
});

// DELETE /api/blogs/:id - Admin: Delete blog post
router.delete("/:id", async (req, res) => {
  try {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    const { id } = req.params;
    const deleted = await BlogPost.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Article not found." });
    }

    res.json({ success: true, message: "Blog post deleted successfully." });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
