import express from "express";
import BlogPost from "../models/BlogPost.js";
import Job from "../models/Job.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const blogs = await BlogPost.find({ published: true })
      .select("slug updatedAt")
      .lean();

    const jobs = await Job.find({ status: "open" })
      .select("slug updatedAt")
      .lean();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    xml += `  <url>\n`;
    xml += `    <loc>https://jugarr.in/</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>https://jugarr.in/blog</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>https://jugarr.in/careers</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // Dynamic blog pages
    blogs.forEach((blog) => {
      xml += `  <url>\n`;
      xml += `    <loc>https://jugarr.in/blog/${blog.slug}</loc>\n`;
      if (blog.updatedAt) {
        xml += `    <lastmod>${blog.updatedAt.toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic job pages
    jobs.forEach((job) => {
      xml += `  <url>\n`;
      xml += `    <loc>https://jugarr.in/careers/${job.slug}</loc>\n`;
      if (job.updatedAt) {
        xml += `    <lastmod>${job.updatedAt.toISOString()}</lastmod>\n`;
      }
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>\n`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
