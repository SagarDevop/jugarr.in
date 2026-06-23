import { Router } from "express";
import connectToDatabase from "../lib/mongoose";
import Submission from "../models/Submission";
import { sendReferralEmail } from "../lib/email";

const router = Router();

// GET /api/waitlist/referrer
router.get("/referrer", async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Referral code is required." });
    }
    await connectToDatabase();
    const referrer = await Submission.findOne({ referralCode: code.trim().toUpperCase() });
    if (!referrer) {
      return res.status(404).json({ error: "Referrer not found." });
    }
    res.json({ name: referrer.name });
  } catch (error) {
    console.error("Error fetching referrer:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/waitlist
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();
    const submissionsCount = await Submission.countDocuments();
    const count = 70 + submissionsCount;
    res.json({ count });
  } catch (error) {
    console.error("Error connecting to database:", error);
    res.status(500).json({ error: "Failed to fetch count" });
  }
});

// Helper to generate a unique 6-character uppercase referral code
async function generateUniqueReferralCode(): Promise<string> {
  let code = "";
  let isUnique = false;
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await Submission.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
}

// GET /api/waitlist/status
router.get("/status", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email parameter is required." });
    }

    await connectToDatabase();

    const user = await Submission.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found on the waitlist." });
    }

    // Dynamic leaderboard sorting: referralCount (descending), then createdAt (ascending)
    const allSubmissions = await Submission.find().sort({ referralCount: -1, createdAt: 1 });
    const index = allSubmissions.findIndex((s) => s.email === email.trim().toLowerCase());
    const rank = index === -1 ? 70 + allSubmissions.length : 70 + index;

    res.json({
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referredBy: user.referredBy || "",
      rank,
      totalCount: 70 + allSubmissions.length,
    });
  } catch (error) {
    console.error("Error fetching waitlist status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/waitlist
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      joinWhatsappCommunity,
      collegeName,
      passoutYear,
      problemFace,
      whyJoin,
      suggestions,
      message,
      referredBy, // optional inviter code
    } = req.body;

    if (!name || !email || !phone || !collegeName || !passoutYear) {
      return res.status(400).json({
        error: "Name, Email, Phone number, College name, and Passout year are required.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    await connectToDatabase();

    const existingSubmission = await Submission.findOne({ email: email.trim().toLowerCase() });
    if (existingSubmission) {
      return res.status(400).json({ error: "This email is already on the waitlist." });
    }

    // Generate unique referral code for this user
    const referralCode = await generateUniqueReferralCode();

    // Check if inviter code is valid
    let verifiedReferredBy = "";
    if (referredBy && typeof referredBy === "string" && referredBy.trim().length > 0) {
      const inviterCode = referredBy.trim().toUpperCase();
      const inviter = await Submission.findOne({ referralCode: inviterCode });
      if (inviter) {
        verifiedReferredBy = inviterCode;
        // Increment referrer count to improve their rank
        await Submission.updateOne(
          { referralCode: inviterCode },
          { $inc: { referralCount: 1 } }
        );
        // Send notification email to the referrer asynchronously
        sendReferralEmail(inviter.email, inviter.name, name.trim()).catch((err) =>
          console.error("Failed to send referral email:", err)
        );
      }
    }

    const newSubmission = await Submission.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      joinWhatsappCommunity: !!joinWhatsappCommunity,
      collegeName: collegeName.trim(),
      passoutYear: passoutYear.trim(),
      problemFace: (problemFace || "").trim(),
      whyJoin: (whyJoin || "").trim(),
      suggestions: (suggestions || "").trim(),
      message: (message || "").trim(),
      referralCode,
      referredBy: verifiedReferredBy,
    });

    const submissionsCount = await Submission.countDocuments();
    const count = 70 + submissionsCount;

    res.json({
      success: true,
      count,
      referralCode,
      email: newSubmission.email,
    });
  } catch (error) {
    console.error("Waitlist API handler error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /api/waitlist/admin/submissions
router.get("/admin/submissions", async (req, res) => {
  try {
    const password = req.query.password || req.headers["x-admin-password"];
    const expectedPassword = process.env.ADMIN_PASSWORD || "jugarradmin123";

    if (!password || password !== expectedPassword) {
      return res.status(401).json({ error: "Unauthorized. Invalid admin password." });
    }

    await connectToDatabase();

    // Retrieve all waitlist entries, sorted by signup date descending
    const submissions = await Submission.find().sort({ createdAt: -1 });

    // Calculate leaderboard ranks for each user based on referrals sorting
    const leaderboard = await Submission.find().sort({ referralCount: -1, createdAt: 1 });
    
    const submissionsWithRanks = submissions.map((sub) => {
      const index = leaderboard.findIndex((s) => s.email === sub.email);
      const rank = index === -1 ? 70 + leaderboard.length : 70 + index;
      return {
        ...sub.toObject(),
        rank,
      };
    });

    res.json({
      success: true,
      submissions: submissionsWithRanks,
    });
  } catch (error) {
    console.error("Error retrieving admin waitlist submissions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
