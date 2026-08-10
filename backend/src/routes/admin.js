import { Router } from "express";

const router = Router();

// POST /api/admin/verify
// Verify the admin password
router.post("/verify", (req, res) => {
  try {
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!password || password !== expectedPassword) {
      return res.status(401).json({ success: false, error: "Unauthorized. Invalid admin password." });
    }

    res.json({ success: true, message: "Authentication successful." });
  } catch (error) {
    console.error("Error during admin verification:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});

export default router;
