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
      ctx.drawImage(mascotImg, marginX + 32 * S, headerY - 14 * S, 32 * S, 32 * S);
    }
  } catch (err) {
    console.warn("Mascot image load warning:", err.message);
  }

  // Header Brand Name "JUGARR"
  ctx.fillStyle = "#0F172A";
  ctx.font = `900 ${20 * S}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("JUGARR", marginX + 72 * S, headerY + 2 * S);

  // Header Role "Founder / Contributor"
  const roleText = contributor.role || "Contributor";
  ctx.fillStyle = "#F97316";
  ctx.font = `800 ${18 * S}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(roleText, marginX + cardW - 32 * S, headerY + 2 * S);

  // 4. Center Circular Avatar
  const avatarCenterX = canvasWidth / 2;
  const avatarCenterY = marginY + 185 * S;
  const avatarRadius = 88 * S;

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
    ctx.fillStyle = "#E2E8F0";
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
  const nameY = marginY + 320 * S;
  ctx.fillStyle = "#0F172A";
  ctx.font = `800 ${28 * S}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(contributor.name || "Contributor", avatarCenterX, nameY);

  // 6. Short Bio (FULL description text wrapped smoothly across lines)
  const rawBio = contributor.shortBio || "Building India's student-driven ecosystem.";
  const maxLineWidth = cardW - 65 * S;
  ctx.font = `400 ${13.5 * S}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = "#64748B";
  ctx.textAlign = "center";

  const words = rawBio.split(" ");
  const bioLines = [];
  let currentLineText = "";

  for (let word of words) {
    const testLine = currentLineText ? `${currentLineText} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxLineWidth) {
      currentLineText = testLine;
    } else {
      bioLines.push(currentLineText);
      currentLineText = word;
    }
  }
  if (currentLineText) {
    bioLines.push(currentLineText);
  }

  // Draw ALL wrapped lines of the description completely
  let lastBioY = nameY + 24 * S;
  const bioLineHeight = 19.5 * S;
  bioLines.forEach((lineText, idx) => {
    lastBioY = nameY + 24 * S + idx * bioLineHeight;
    ctx.fillText(lineText, avatarCenterX, lastBioY);
  });

  // 7. GOLDEN ACHIEVEMENT BADGE CARD SECTION (Matching Reference Image)
  const badgeBoxY = lastBioY + 36 * S;
  const badgeBoxW = cardW - 60 * S;
  const badgeBoxH = 135 * S;
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
  const sealRadius = 26 * S;
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

  // Crown Symbol inside Seal
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `900 ${18 * S}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("👑", avatarCenterX, sealY + 1 * S);

  // Left & Right Laurel Leaf / Wheat Wreaths
  ctx.fillStyle = "#EAB308";
  ctx.font = `${26 * S}px system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("🌾", badgeBoxX + 16 * S, badgeBoxY + badgeBoxH / 2);
  ctx.textAlign = "right";
  ctx.fillText("🌾", badgeBoxX + badgeBoxW - 16 * S, badgeBoxY + badgeBoxH / 2);

  // Subtitle "── ACHIEVEMENT ──"
  ctx.fillStyle = "#D97706";
  ctx.font = `700 ${12 * S}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("── ACHIEVEMENT ──", avatarCenterX, badgeBoxY + 42 * S);

  // Main Badge Title ("Founding Contributor")
  const badgeText = contributor.badge || "Founding Contributor";
  ctx.fillStyle = "#0F172A";
  ctx.font = `800 ${22 * S}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(badgeText.replace(/[🏆🚀⭐]\s*/g, ""), avatarCenterX, badgeBoxY + 72 * S);

  // Tagline ("Building the future of student opportunities")
  ctx.fillStyle = "#64748B";
  ctx.font = `400 ${12.5 * S}px system-ui, -apple-system, sans-serif`;
  ctx.fillText("Building the future of student opportunities", avatarCenterX, badgeBoxY + 95 * S);

  // 5 Golden Stars
  ctx.fillStyle = "#EAB308";
  ctx.font = `${14 * S}px system-ui, sans-serif`;
  ctx.fillText("★ ★ ★ ★ ★", avatarCenterX, badgeBoxY + 118 * S);

  // 8. Middle Info Section (Joined Date & QR Code Scanner - STUCK TO THE BOTTOM)
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

  // Calendar Icon
  ctx.fillStyle = "#0F172A";
  ctx.font = `${20 * S}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("📅", calBoxX + calBoxSize / 2, calBoxY + calBoxSize / 2);

  // Joined Label & Value
  ctx.fillStyle = "#94A3B8";
  ctx.font = `500 ${13 * S}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Joined", calBoxX + calBoxSize + 12 * S, middleY + 25 * S);

  ctx.fillStyle = "#0F172A";
  ctx.font = `800 ${19 * S}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(contributor.joinedDate || "May 2026", calBoxX + calBoxSize + 12 * S, middleY + 48 * S);

  // Right Column: Scan Profile & QR Code
  ctx.fillStyle = "#64748B";
  ctx.font = `500 ${13 * S}px system-ui, -apple-system, sans-serif`;
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
  ctx.font = `400 ${13 * S}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("Building India's Student-Driven Ecosystem", avatarCenterX, footerY1);

  const footerY2 = footerY1 + 22 * S;
  ctx.fillStyle = "#F97316";
  ctx.font = `700 ${14.5 * S}px system-ui, -apple-system, sans-serif`;
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
