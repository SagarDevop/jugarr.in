import { Router } from "express";

const router = Router();

// Store active visitors in memory: sessionToken -> timestamp
const activeVisitors = new Map();

// ---------------------------------------------------------------------------
// POST /api/visitors/heartbeat
// ---------------------------------------------------------------------------
// Heartbeat endpoint to track active visitors.
// Clients send their unique session token every 8-10 seconds.
// Returns the current count of active visitors (last 18 seconds).
// ---------------------------------------------------------------------------
router.post("/heartbeat", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Session token required" });
  }

  const now = Date.now();
  
  // Register or update active user timestamp
  activeVisitors.set(token, now);

  // Clean up stale sessions (older than 18 seconds)
  const threshold = 18000;
  for (const [key, timestamp] of activeVisitors.entries()) {
    if (now - timestamp > threshold) {
      activeVisitors.delete(key);
    }
  }

  // Return active visitors count starting at 40 baseline
  res.json({
    count: activeVisitors.size + 40,
  });
});

export default router;
