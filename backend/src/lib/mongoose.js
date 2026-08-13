import mongoose from "mongoose";
import dns from "dns";

// ---------------------------------------------------------------------------
// Global connection cache
// ---------------------------------------------------------------------------
// In serverless environments (Vercel, Railway, etc.) each invocation can spin
// up a new Node.js module context, calling mongoose.connect() repeatedly and
// paying a 1-3 second TCP handshake + TLS negotiation cost every time.
//
// Storing the promise on `global` means the SAME promise is reused across all
// hot-path requests in the same process/container — effectively a free
// connection pool without any extra dependencies (no Redis needed).
// ---------------------------------------------------------------------------

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  // Return already-established connection immediately (zero overhead).
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is already in-flight, wait for it rather than
  // opening a second TCP connection (handles burst / concurrent requests).
  if (!cached.promise) {
    // Set public DNS servers to resolve MongoDB Atlas SRV records correctly
    // in environments where the local DNS resolver fails (e.g., hotspots).
    if (MONGODB_URI.startsWith("mongodb+srv://")) {
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
      } catch (err) {
        console.warn("Failed to set public DNS servers, using default resolver.", err);
      }
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // Keep the connection alive between serverless invocations.
        serverSelectionTimeoutMS: 5000, // fail fast if Atlas is unreachable
        socketTimeoutMS: 45000,
      })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
