import express from "express";
import path from "path";
import fs from "fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import QRCode from "qrcode";
import connectToDatabase from "../lib/mongoose.js";
import JugarrContributor from "../models/JugarrContributor.js";

const router = express.Router();

// In-memory cache for generated OG image buffers
const ogCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Clears cached OG card for a given slug or all slugs
 */
export function invalidateOgCache(slug) {
  if (slug) {
    ogCache.delete(slug.toLowerCase());
  } else {
    ogCache.clear();
  }
}

/**
 * Helper to wrap text into multiple lines for Canvas
 */
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Helper to draw a rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Renders high-quality initials avatar when photo is missing or fails
 */
function renderInitialsAvatar(ctx, name, cx, cy, radius) {
  const initials = (name || "J")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  ctx.save();
  const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  grad.addColorStop(0, "#10B981");
  grad.addColorStop(1, "#059669");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "bold 42px sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, cx, cy);
  ctx.restore();
}

/**
 * GET /api/og/:slug
 * Dynamically generates 1200 x 630 Open Graph preview image for contributor profile.
 */
router.get("/:slug", async (req, res) => {
  const startTime = Date.now();
  const rawSlug = (req.params.slug || "").toLowerCase().trim();

  // Strip file extension if passed (e.g., /api/og/sagar-singh.png)
  const slug = rawSlug.replace(/\.(png|jpg|jpeg|webp)$/i, "");

  if (!slug) {
    return res.status(400).json({ error: "Invalid slug parameter" });
  }

  // Check in-memory cache
  const cached = ogCache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "X-Cache": "HIT",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    });
    return res.send(cached.buffer);
  }

  try {
    await connectToDatabase();
    const contributor = await JugarrContributor.findOne({ slug }).lean();

    const name = contributor?.name || "Jugarr Contributor";
    const role = contributor?.role || "Founding Contributor";
    const shortBio = contributor?.shortBio || "Building India's Student-Driven Campus Ecosystem";
    const profileUrl = `https://jugarr.in/meet-the-jugarris/${slug}`;

    // Create 1200x630 canvas
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext("2d");

    // 1. Background Base Fill (#0A0E1A)
    ctx.fillStyle = "#0A0E1A";
    ctx.fillRect(0, 0, 1200, 630);

    // Ambient radial glow top-left (Emerald #10B981)
    const gTopLeft = ctx.createRadialGradient(200, 120, 10, 200, 120, 450);
    gTopLeft.addColorStop(0, "rgba(16, 185, 129, 0.28)");
    gTopLeft.addColorStop(0.5, "rgba(16, 185, 129, 0.08)");
    gTopLeft.addColorStop(1, "rgba(10, 14, 26, 0)");
    ctx.fillStyle = gTopLeft;
    ctx.fillRect(0, 0, 1200, 630);

    // Ambient radial glow bottom-right (Cyan #06B6D4)
    const gBottomRight = ctx.createRadialGradient(1000, 500, 10, 1000, 500, 500);
    gBottomRight.addColorStop(0, "rgba(6, 182, 212, 0.22)");
    gBottomRight.addColorStop(0.6, "rgba(6, 182, 212, 0.05)");
    gBottomRight.addColorStop(1, "rgba(10, 14, 26, 0)");
    ctx.fillStyle = gBottomRight;
    ctx.fillRect(0, 0, 1200, 630);

    // 2. Central Glassmorphism Card Frame (60, 40, 1080, 550)
    ctx.save();
    drawRoundedRect(ctx, 50, 35, 1100, 560, 24);
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.stroke();
    ctx.restore();

    // Subtle inner accent top line
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(90, 35);
    ctx.lineTo(1110, 35);
    const lineGrad = ctx.createLinearGradient(90, 0, 1110, 0);
    lineGrad.addColorStop(0, "rgba(16, 185, 129, 0.6)");
    lineGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.6)");
    lineGrad.addColorStop(1, "rgba(16, 185, 129, 0.1)");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 3. Top Header: Jugarr Logo (Left) & Role Badge (Right)
    // Logo Text: JUGARR
    ctx.save();
    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("JUGARR", 90, 70);

    // Logo Accent Dot
    ctx.beginPath();
    ctx.arc(245, 78, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#10B981";
    ctx.fill();

    // Tagline next to logo
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("DIGITAL IDENTITY CARD", 90, 110);
    ctx.restore();

    // Role Badge (Right)
    ctx.save();
    const badgeText = (role || "FOUNDING CONTRIBUTOR").toUpperCase();
    ctx.font = "bold 13px sans-serif";
    const badgeWidth = ctx.measureText(badgeText).width + 28;
    const badgeHeight = 34;
    const badgeX = 1110 - badgeWidth - 40;
    const badgeY = 72;

    drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 17);
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#10B981";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
    ctx.restore();

    // 4. Center Section: Profile Photo
    const avatarCx = 600;
    const avatarCy = 230;
    const avatarRadius = 70;

    // Avatar Glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarRadius + 12, 0, Math.PI * 2);
    const glowGrad = ctx.createRadialGradient(avatarCx, avatarCy, avatarRadius, avatarCx, avatarCy, avatarRadius + 20);
    glowGrad.addColorStop(0, "rgba(16, 185, 129, 0.4)");
    glowGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = glowGrad;
    ctx.fill();
    ctx.restore();

    // Try loading avatar image
    let loadedImage = null;
    if (contributor?.profileImage) {
      try {
        const imgPathOrUrl = contributor.profileImage;
        if (imgPathOrUrl.startsWith("/uploads/")) {
          const localPath = path.join(process.cwd(), imgPathOrUrl);
          if (fs.existsSync(localPath)) {
            loadedImage = await loadImage(localPath);
          }
        } else if (imgPathOrUrl.startsWith("http")) {
          // Fetch remote image with timeout
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
          const response = await fetch(imgPathOrUrl, { signal: controller.signal });
          clearTimeout(timer);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            loadedImage = await loadImage(Buffer.from(arrayBuffer));
          }
        }
      } catch (imgErr) {
        console.warn(`[OG Card] Could not load profile image for ${slug}:`, imgErr.message);
      }
    }

    if (loadedImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCx, avatarCy, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        loadedImage,
        avatarCx - avatarRadius,
        avatarCy - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.restore();
    } else {
      renderInitialsAvatar(ctx, name, avatarCx, avatarCy, avatarRadius);
    }

    // Avatar Border Ring (Gradient)
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarRadius, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(
      avatarCx - avatarRadius,
      avatarCy - avatarRadius,
      avatarCx + avatarRadius,
      avatarCy + avatarRadius
    );
    ringGrad.addColorStop(0, "#10B981");
    ringGrad.addColorStop(1, "#06B6D4");
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // 5. Contributor Name & Bio
    // Name
    ctx.save();
    ctx.font = "bold 44px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(name, 600, 335);
    ctx.restore();

    // Bio
    ctx.save();
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const bioLines = wrapText(ctx, shortBio, 820);
    const maxBioLines = bioLines.slice(0, 2);
    if (bioLines.length > 2) {
      maxBioLines[1] = maxBioLines[1].replace(/\s+\S*$/, "") + "...";
    }

    maxBioLines.forEach((line, index) => {
      ctx.fillText(line, 600, 395 + index * 30);
    });
    ctx.restore();

    // 6. Bottom Section: Website URL + QR Code
    // Divider line above footer
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(90, 480);
    ctx.lineTo(1110, 480);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Footer Left: jugarr.in & Tagline
    ctx.save();
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#10B981";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("jugarr.in", 90, 505);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#64748B";
    ctx.fillText("Building India's Student-Driven Ecosystem", 90, 540);
    ctx.restore();

    // Footer Right: Dynamic QR Code
    try {
      const qrBuffer = await QRCode.toBuffer(profileUrl, {
        margin: 1,
        width: 80,
        color: {
          dark: "#0A0E1A",
          light: "#FFFFFF",
        },
      });
      const qrImage = await loadImage(qrBuffer);

      const qrContainerX = 1110 - 92 - 10;
      const qrContainerY = 492;

      // Draw white container for QR
      ctx.save();
      drawRoundedRect(ctx, qrContainerX, qrContainerY, 92, 92, 10);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.restore();

      // Draw QR image
      ctx.drawImage(qrImage, qrContainerX + 6, qrContainerY + 6, 80, 80);

      // Label above QR
      ctx.save();
      ctx.font = "bold 10px sans-serif";
      ctx.fillStyle = "#94A3B8";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("SCAN PROFILE", qrContainerX + 46, qrContainerY - 4);
      ctx.restore();
    } catch (qrErr) {
      console.warn(`[OG Card] Error generating QR code for ${slug}:`, qrErr.message);
    }

    // Export to PNG Buffer
    const imageBuffer = canvas.toBuffer("image/png");

    // Cache in memory
    ogCache.set(slug, {
      buffer: imageBuffer,
      timestamp: Date.now(),
    });

    res.set({
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      "X-Cache": "MISS",
      "X-Response-Time": `${Date.now() - startTime}ms`,
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error(`[OG Card] Error generating OG card for ${slug}:`, error);
    res.status(500).json({ error: "Failed to generate OG image." });
  }
});

export default router;
