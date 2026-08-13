import { Router } from "express";
import connectToDatabase from "../lib/mongoose.js";

const router = Router();

let pingIntervalId = undefined;
let pingTargetUrl = undefined;

// ---------------------------------------------------------------------------
// GET /api/ping
// ---------------------------------------------------------------------------
// Dual purpose:
//   1. HTTP keep-alive  — prevents serverless platform from spinning down the
//      Node process (self-ping every 4 min keeps the process warm).
//   2. DB keep-alive    — touches MongoDB so Atlas M0 free clusters don't
//      auto-pause after ~5 min of inactivity. Returns DB status in response.
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  const host = req.headers.host || "localhost:5000";
  const proto = req.headers["x-forwarded-proto"] || "http";
  const selfUrl = `${proto}://${host}/api/ping`;

  pingTargetUrl = selfUrl;

  // Kick off the self-ping daemon on the first hit (process stays warm).
  if (!pingIntervalId) {
    console.log(`[Keep-Alive] Starting Keep-Alive Daemon. Target: ${selfUrl}`);
    // 4 min interval — safely below the ~5 min Atlas M0 inactivity threshold.
    pingIntervalId = setInterval(() => {
      const target = pingTargetUrl || selfUrl;
      console.log(`[Keep-Alive] Triggering self-ping to ${target}`);
      fetch(target)
        .then((r) => console.log(`[Keep-Alive] Self-ping status: ${r.status}`))
        .catch((err) => console.error(`[Keep-Alive] Self-ping error:`, err));
    }, 4 * 60 * 1000); // ← 4 minutes (was 14 — too long for Atlas M0)
  }

  // Touch the DB so the connection stays alive in both directions.
  let dbStatus = "ok";
  try {
    await connectToDatabase();
  } catch (err) {
    dbStatus = "error";
    console.error("[Keep-Alive] DB ping failed:", err.message);
  }

  res.json({
    status: "alive",
    db: dbStatus,
    timestamp: new Date().toISOString(),
    daemonActive: !!pingIntervalId,
    targetUrl: selfUrl,
  });
});

export default router;
