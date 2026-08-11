import express from "express";
import BlogPost from "../models/BlogPost.js";
import Job from "../models/Job.js";

const router = express.Router();

/**
 * Escapes special XML characters in a URL string to ensure valid XML output.
 * Correctly handles & characters that can appear in query strings.
 */
function escapeXml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * GET /sitemap.xml
 *
 * Dynamically generates the XML sitemap from MongoDB data.
 * Includes:
 *   - Static pages (/, /blog, /careers)
 *   - All published blog posts (published: true)
 *   - All open job postings (status: "open")
 *
 * Cached for 5 minutes to balance freshness and DB load.
 * A newly published blog/job will appear in the sitemap within 5 minutes.
 */
router.get("/", async (req, res) => {
  try {
    const [blogs, jobs] = await Promise.all([
      BlogPost.find({ published: true })
        .select("slug updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .lean(),
      Job.find({ status: "open" })
        .select("slug updatedAt createdAt postedAt")
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    const SITE = "https://jugarr.in";

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // ── Static pages ────────────────────────────────────────────────────────
    xml += `  <url>\n`;
    xml += `    <loc>${SITE}/</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${SITE}/blog</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${SITE}/careers</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // ── Dynamic blog pages ───────────────────────────────────────────────────
    for (const blog of blogs) {
      const lastmod = blog.updatedAt || blog.createdAt;
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${SITE}/blog/${blog.slug}`)}</loc>\n`;
      if (lastmod) {
        xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // ── Dynamic job pages ────────────────────────────────────────────────────
    for (const job of jobs) {
      const lastmod = job.updatedAt || job.postedAt || job.createdAt;
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(`${SITE}/careers/${job.slug}`)}</loc>\n`;
      if (lastmod) {
        xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>\n`;

    // Cache for 5 minutes (300 seconds).
    // New content will appear in the sitemap within one cache cycle.
    res.set({
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
      "X-Robots-Tag": "noindex", // Don't index the sitemap file itself
    });
    res.status(200).send(xml);
  } catch (error) {
    // Log server-side but do not leak details to the client
    console.error("[Sitemap] Error generating sitemap:", error.message || error);

    // Return a valid but minimal error XML with 503 so crawlers know to retry
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- Sitemap temporarily unavailable. Please retry shortly. -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n`;
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.status(503).send(errorXml);
  }
});

export default router;
