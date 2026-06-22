import { Router } from "express";

const router = Router();

let pingIntervalId: NodeJS.Timeout | undefined = undefined;
let pingTargetUrl: string | undefined = undefined;

router.get("/", (req, res) => {
  const host = req.headers.host || "localhost:5000";
  const proto = req.headers["x-forwarded-proto"] || "http";
  const selfUrl = `${proto}://${host}/api/ping`;

  pingTargetUrl = selfUrl;

  if (!pingIntervalId) {
    console.log(`[Keep-Alive] Starting Keep-Alive Daemon. Target: ${selfUrl}`);
    pingIntervalId = setInterval(() => {
      const target = pingTargetUrl || selfUrl;
      console.log(`[Keep-Alive] Triggering self-ping to ${target}`);
      
      fetch(target)
        .then((response) => {
          console.log(`[Keep-Alive] Self-ping returned status: ${response.status}`);
        })
        .catch((err) => {
          console.error(`[Keep-Alive] Self-ping error:`, err);
        });
    }, 840000); // 14 minutes
  }

  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    daemonActive: !!pingIntervalId,
    targetUrl: selfUrl,
  });
});

export default router;
