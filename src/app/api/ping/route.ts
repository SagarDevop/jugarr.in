import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// HMR-safe global singleton declaration to prevent duplicate intervals in development
const globalForPing = globalThis as unknown as {
  pingIntervalId?: NodeJS.Timeout;
  pingTargetUrl?: string;
};

export async function GET(request: NextRequest) {
  const host = request.headers.get("host") || "localhost:3000";
  // Detect protocol (Render always provides x-forwarded-proto, fallback to http)
  const proto = request.headers.get("x-forwarded-proto") || "http";
  const selfUrl = `${proto}://${host}/api/ping`;

  // Store the target URL in case it changes
  globalForPing.pingTargetUrl = selfUrl;

  if (!globalForPing.pingIntervalId) {
    console.log(`[Keep-Alive] Starting Render Keep-Alive Daemon. Target: ${selfUrl}`);
    
    globalForPing.pingIntervalId = setInterval(() => {
      const target = globalForPing.pingTargetUrl || selfUrl;
      console.log(`[Keep-Alive] Triggering self-ping to ${target}`);
      
      fetch(target)
        .then((res) => {
          console.log(`[Keep-Alive] Self-ping returned status: ${res.status}`);
        })
        .catch((err) => {
          console.error(`[Keep-Alive] Self-ping error:`, err);
        });
    }, 840000); // 14 minutes
  }

  return Response.json({
    status: "alive",
    timestamp: new Date().toISOString(),
    daemonActive: !!globalForPing.pingIntervalId,
    targetUrl: selfUrl,
  });
}
