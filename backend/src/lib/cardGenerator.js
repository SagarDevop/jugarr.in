import { createCanvas, loadImage } from "@napi-rs/canvas";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";

/**
 * Helper to draw a rounded rectangle
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Helper to draw crisp vector 5-pointed star
 */
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

/**
 * Helper to wrap text safely within maxWidth and maxLines
 */
function wrapText(ctx, text, maxWidth, maxLines = 3) {
  // Normalize whitespace: remove line breaks, carriage returns, tabs, and collapse spaces
  const clean = (text || "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const words = clean.split(" ");
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        // Last line: truncate with ellipsis if remaining text exceeds maxWidth
        const remaining = words.slice(i).join(" ");
        let lastLine = remaining;
        while (ctx.measureText(`${lastLine}...`).width > maxWidth && lastLine.length > 0) {
          lastLine = lastLine.slice(0, -1).trim();
        }
        lines.push(`${lastLine}...`);
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
}

// Vector SVG assets (ensures 100% crisp rendering across Windows/Linux/Mac servers with no missing emoji glyphs)
const crownSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="#FFFFFF">
  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z"/>
</svg>`;

const calendarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="3" ry="3"/>
  <line x1="16" y1="2" x2="16" y2="6"/>
  <line x1="8" y1="2" x2="8" y2="6"/>
  <line x1="3" y1="10" x2="21" y2="10"/>
  <circle cx="8" cy="14" r="1" fill="#0F172A"/>
  <circle cx="12" cy="14" r="1" fill="#0F172A"/>
  <circle cx="16" cy="14" r="1" fill="#0F172A"/>
  <circle cx="8" cy="18" r="1" fill="#0F172A"/>
  <circle cx="12" cy="18" r="1" fill="#0F172A"/>
  <circle cx="16" cy="18" r="1" fill="#0F172A"/>
</svg>`;

const wreathLeftSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64" width="24" height="64" fill="#EAB308">
  <path d="M19 6C14 9 11 14 11 20C11 25 14 29 19 32C13 31 8 26 8 20C8 13 13 8 19 6Z"/>
  <path d="M17 22C11 25 8 30 8 36C8 42 11 46 17 49C10 48 5 43 5 36C5 29 10 23 17 22Z"/>
  <path d="M15 38C10 41 7 46 7 51C7 56 10 60 15 62C9 61 4 56 4 51C4 45 9 40 15 38Z"/>
</svg>`;

const wreathRightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 64" width="24" height="64" fill="#EAB308">
  <g transform="scale(-1, 1) translate(-24, 0)">
    <path d="M19 6C14 9 11 14 11 20C11 25 14 29 19 32C13 31 8 26 8 20C8 13 13 8 19 6Z"/>
    <path d="M17 22C11 25 8 30 8 36C8 42 11 46 17 49C10 48 5 43 5 36C5 29 10 23 17 22Z"/>
    <path d="M15 38C10 41 7 46 7 51C7 56 10 60 15 62C9 61 4 56 4 51C4 45 9 40 15 38Z"/>
  </g>
</svg>`;

const FONT_SANS = `"Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif`;

/**
 * Generate a high-resolution PNG buffer for a Jugarr Contributor Identity Card
 * @param {Object} contributor - JugarrContributor document
 * @returns {Promise<Buffer>} PNG Buffer
 */
export async function generateContributorCard(contributor) {
  // Canvas Dimensions (600x930 @ 2x Scale = 1200x1860)
  const S = 2; // Scale factor for retina/high-DPI export
  const canvasWidth = 600 * S;
  const canvasHeight = 930 * S;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Enable high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Page Background
  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Main Outer Card Container
  const marginX = 28 * S;
  const marginY = 28 * S;
  const cardW = canvasWidth - marginX * 2;
  const cardH = canvasHeight - marginY * 2;
  const cardRadius = 32 * S;

  // Card Shadow
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
  ctx.shadowBlur = 30 * S;
  ctx.shadowOffsetY = 12 * S;

  // Card White Fill
  drawRoundedRect(ctx, marginX, marginY, cardW, cardH, cardRadius);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  // Card Border Stroke
  ctx.save();
  drawRoundedRect(ctx, marginX, marginY, cardW, cardH, cardRadius);
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1.5 * S;
  ctx.stroke();
  ctx.restore();

  // 3. Header: Mascot + JUGARR (Left), Role (Right)
  const headerY = marginY + 42 * S;

  // Load mascot image (jugguu.png or juggu.png)
  try {
    const mascotPath1 = path.join(process.cwd(), "..", "frontend", "src", "assets", "jugguu.png");
    const mascotPath2 = path.join(process.cwd(), "..", "frontend", "src", "assets", "juggu.png");
    let mascotImg;
    if (fs.existsSync(mascotPath1)) {
      mascotImg = await loadImage(mascotPath1);
    } else if (fs.existsSync(mascotPath2)) {
      mascotImg = await loadImage(mascotPath2);
    }

    if (mascotImg) {
      ctx.drawImage(mascotImg, marginX + 32 * S, headerY - 16 * S, 32 * S, 32 * S);
    }
  } catch (err) {
    console.warn("Mascot image load warning:", err.message);
  }

  // Header Brand Name "JUGARR"
  ctx.fillStyle = "#0F172A";
  ctx.font = `900 ${20 * S}px ${FONT_SANS}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("JUGARR", marginX + 72 * S, headerY);

  // Header Role
  const roleText = contributor.role || "Contributor";
  ctx.fillStyle = "#F97316";
  ctx.font = `800 ${18 * S}px ${FONT_SANS}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(roleText, marginX + cardW - 32 * S, headerY);

  // 4. Center Circular Avatar
  const avatarCenterX = canvasWidth / 2;
  const avatarCenterY = marginY + 180 * S;
  const avatarRadius = 86 * S;

  // Avatar Soft Outer Shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 4 * S, 0, Math.PI * 2);
  ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
  ctx.shadowBlur = 24 * S;
  ctx.shadowOffsetY = 8 * S;
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  // Draw Avatar Image
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  try {
    let profileImgUrl = contributor.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
    if (profileImgUrl.startsWith("/uploads")) {
      const localPath = path.join(process.cwd(), profileImgUrl);
      if (fs.existsSync(localPath)) {
        profileImgUrl = localPath;
      }
    }
    const avatarImg = await loadImage(profileImgUrl);

    // Draw with aspect ratio cover
    const imgRatio = avatarImg.width / avatarImg.height;
    let drawW = avatarRadius * 2;
    let drawH = avatarRadius * 2;
    let drawX = avatarCenterX - avatarRadius;
    let drawY = avatarCenterY - avatarRadius;

    if (imgRatio > 1) {
      drawW = drawH * imgRatio;
      drawX = avatarCenterX - drawW / 2;
    } else {
      drawH = drawW / imgRatio;
      drawY = avatarCenterY - drawH / 2;
    }

    ctx.drawImage(avatarImg, drawX, drawY, drawW, drawH);
  } catch (err) {
    console.warn("Avatar load failed, using fallback color:", err.message);
    ctx.fillStyle = "#1E293B";
    ctx.fill();
  }
  ctx.restore();

  // White Border around Avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 6 * S;
  ctx.stroke();
  ctx.restore();

  // 5. Name Heading
  const nameY = marginY + 310 * S;
  ctx.fillStyle = "#0F172A";
  ctx.font = `800 ${27 * S}px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(contributor.name || "Contributor", avatarCenterX, nameY);

  // 6. Short Bio (Strictly wrapped and clamped to 3 lines maximum within card margins)
  const rawBio = contributor.shortBio || "Building India's student-driven ecosystem.";
  const bioMaxWidth = cardW - 60 * S;
  ctx.font = `400 ${13.5 * S}px ${FONT_SANS}`;
  ctx.fillStyle = "#64748B";
  ctx.textAlign = "center";

  const bioLines = wrapText(ctx, rawBio, bioMaxWidth, 3);
  const bioLineHeight = 19 * S;
  const bioStartY = nameY + 24 * S;

  bioLines.forEach((lineText, idx) => {
    ctx.fillText(lineText, avatarCenterX, bioStartY + idx * bioLineHeight);
  });

  const bioBottomY = bioStartY + (bioLines.length > 0 ? (bioLines.length - 1) * bioLineHeight : 0);

  // 7. GOLDEN ACHIEVEMENT BADGE CARD SECTION
  const badgeBoxY = Math.max(bioBottomY + 28 * S, marginY + 412 * S);
  const badgeBoxW = cardW - 56 * S;
  const badgeBoxH = 132 * S;
  const badgeBoxX = avatarCenterX - badgeBoxW / 2;

  // Badge Container Card Fill & Stroke
  ctx.save();
  drawRoundedRect(ctx, badgeBoxX, badgeBoxY, badgeBoxW, badgeBoxH, 16 * S);
  ctx.fillStyle = "#FFFDF0"; // Warm golden cream fill
  ctx.fill();
  ctx.strokeStyle = "#FDE68A"; // Soft golden border
  ctx.lineWidth = 1.5 * S;
  ctx.stroke();
  ctx.restore();

  // Top Center Golden Crown Seal Icon
  const sealRadius = 24 * S;
  const sealY = badgeBoxY;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, sealY, sealRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#EAB308"; // Golden yellow seal background
  ctx.fill();
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 4 * S;
  ctx.stroke();
  ctx.restore();

  // Crown SVG Vector
  try {
    const crownImg = await loadImage(`data:image/svg+xml;base64,${Buffer.from(crownSvg).toString("base64")}`);
    const crownSize = 24 * S;
    ctx.drawImage(crownImg, avatarCenterX - crownSize / 2, sealY - crownSize / 2, crownSize, crownSize);
  } catch (crownErr) {
    console.error("Crown SVG load error:", crownErr);
  }

  // Left & Right Laurel Leaf / Wheat Wreaths
  try {
    const wreathL = await loadImage(`data:image/svg+xml;base64,${Buffer.from(wreathLeftSvg).toString("base64")}`);
    const wreathR = await loadImage(`data:image/svg+xml;base64,${Buffer.from(wreathRightSvg).toString("base64")}`);
    const wreathW = 20 * S;
    const wreathH = 54 * S;
    ctx.drawImage(wreathL, badgeBoxX + 16 * S, badgeBoxY + badgeBoxH / 2 - wreathH / 2, wreathW, wreathH);
    ctx.drawImage(wreathR, badgeBoxX + badgeBoxW - 16 * S - wreathW, badgeBoxY + badgeBoxH / 2 - wreathH / 2, wreathW, wreathH);
  } catch (wreathErr) {
    console.error("Wreath SVG load error:", wreathErr);
  }

  // Subtitle "── ACHIEVEMENT ──"
  ctx.fillStyle = "#D97706";
  ctx.font = `700 ${11.5 * S}px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("── ACHIEVEMENT ──", avatarCenterX, badgeBoxY + 40 * S);

  // Main Badge Title ("Founding Contributor")
  const rawBadgeText = contributor.badge || "Founding Contributor";
  const badgeText = rawBadgeText.replace(/[🏆🚀⭐]\s*/g, "");
  ctx.fillStyle = "#0F172A";
  ctx.font = `800 ${22 * S}px ${FONT_SANS}`;
  ctx.fillText(badgeText, avatarCenterX, badgeBoxY + 70 * S);

  // Tagline ("Building the future of student opportunities")
  ctx.fillStyle = "#64748B";
  ctx.font = `400 ${12.5 * S}px ${FONT_SANS}`;
  ctx.fillText("Building the future of student opportunities", avatarCenterX, badgeBoxY + 92 * S);

  // 5 Canvas Vector Golden Stars
  const starSpacing = 16 * S;
  const starStartX = avatarCenterX - (2 * starSpacing);
  const starY = badgeBoxY + 114 * S;
  for (let s = 0; s < 5; s++) {
    drawStar(ctx, starStartX + s * starSpacing, starY, 5, 6.5 * S, 3.2 * S, "#EAB308");
  }

  // 8. Middle Info Section (Joined Date & QR Code Scanner - FIXED AT BOTTOM)
  const middleY = marginY + cardH - 240 * S;
  const gridW = cardW - 72 * S;
  const colLeftX = marginX + 36 * S + gridW * 0.25;
  const colRightX = marginX + 36 * S + gridW * 0.75;
  const dividerX = avatarCenterX;

  // Vertical Center Separator Line
  ctx.strokeStyle = "#F1F5F9";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(dividerX, middleY + 10 * S);
  ctx.lineTo(dividerX, middleY + 105 * S);
  ctx.stroke();

  // Left Column: Calendar Icon Box + Joined Date
  const calBoxX = colLeftX - 75 * S;
  const calBoxY = middleY + 24 * S;
  const calBoxSize = 44 * S;

  // Calendar Icon Container
  ctx.save();
  drawRoundedRect(ctx, calBoxX, calBoxY, calBoxSize, calBoxSize, 10 * S);
  ctx.fillStyle = "#F1F5F9";
  ctx.fill();
  ctx.restore();

  // Calendar Vector SVG Icon
  try {
    const calImg = await loadImage(`data:image/svg+xml;base64,${Buffer.from(calendarSvg).toString("base64")}`);
    const calIconSize = 24 * S;
    ctx.drawImage(calImg, calBoxX + (calBoxSize - calIconSize) / 2, calBoxY + (calBoxSize - calIconSize) / 2, calIconSize, calIconSize);
  } catch (calErr) {
    console.error("Calendar SVG load error:", calErr);
  }

  // Joined Label & Value
  ctx.fillStyle = "#94A3B8";
  ctx.font = `500 ${13 * S}px ${FONT_SANS}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Joined", calBoxX + calBoxSize + 12 * S, middleY + 25 * S);

  ctx.fillStyle = "#0F172A";
  ctx.font = `800 ${19 * S}px ${FONT_SANS}`;
  ctx.fillText(contributor.joinedDate || "May 2026", calBoxX + calBoxSize + 12 * S, middleY + 48 * S);

  // Right Column: Scan Profile & QR Code
  ctx.fillStyle = "#64748B";
  ctx.font = `500 ${13 * S}px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("Scan Profile", colRightX, middleY + 4 * S);

  // Generate QR Code Buffer
  const qrTargetUrl = `https://jugarr.in/meet-the-jugarris/${contributor.slug}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      margin: 1,
      width: 100 * S,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    const qrImg = await loadImage(qrDataUrl);
    const qrSize = 84 * S;
    const qrX = colRightX - qrSize / 2;
    const qrY = middleY + 26 * S;

    // Draw QR Container Box
    ctx.save();
    drawRoundedRect(ctx, qrX - 4 * S, qrY - 4 * S, qrSize + 8 * S, qrSize + 8 * S, 12 * S);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 1 * S;
    ctx.stroke();
    ctx.restore();

    // Draw QR Image
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch (qrErr) {
    console.error("QR Code generation error:", qrErr);
  }

  // 9. Horizontal Divider Line (Near Bottom)
  const lineY = marginY + cardH - 85 * S;
  ctx.strokeStyle = "#F1F5F9";
  ctx.lineWidth = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(marginX + 36 * S, lineY);
  ctx.lineTo(marginX + cardW - 36 * S, lineY);
  ctx.stroke();

  // 10. Footer Subtext & Domain
  const footerY1 = lineY + 26 * S;
  ctx.fillStyle = "#64748B";
  ctx.font = `400 ${13 * S}px ${FONT_SANS}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Building India's Student-Driven Ecosystem", avatarCenterX, footerY1);

  const footerY2 = footerY1 + 22 * S;
  ctx.fillStyle = "#F97316";
  ctx.font = `700 ${14.5 * S}px ${FONT_SANS}`;
  ctx.fillText("jugarr.in", avatarCenterX, footerY2);

  // Convert canvas to PNG buffer (Realtime generation)
  const pngBuffer = await canvas.encode("png");
  return pngBuffer;
}

/**
 * Invalidate card cache helper
 */
export function invalidateCardCache() {
  // Realtime generation enabled
}
