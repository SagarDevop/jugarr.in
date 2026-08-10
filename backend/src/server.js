import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToDatabase from "./lib/mongoose.js";
import waitlistRoutes from "./routes/waitlist.js";
import pingRoutes from "./routes/ping.js";
import blogRoutes from "./routes/blog.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
const defaultAllowedOrigins = [
  "https://jugarr.in",
  "https://www.jugarr.in",
  "https://jugarr-in.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const parseEnvOrigins = (envVar) => {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((url) => url.trim().replace(/\/$/, "").toLowerCase())
    .filter(Boolean);
};

const allowedOrigins = Array.from(
  new Set([
    ...defaultAllowedOrigins.map((u) => u.toLowerCase()),
    ...parseEnvOrigins(process.env.FRONTEND_URL),
    ...parseEnvOrigins(process.env.ALLOWED_ORIGINS),
  ])
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server, mobile apps, or postman)
      if (!origin) return callback(null, true);

      // Normalize origin by stripping trailing slash
      const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1).toLowerCase() : origin.toLowerCase();
      const isAllowed =
        allowedOrigins.some((allowed) => allowed === normalizedOrigin) ||
        normalizedOrigin.endsWith(".jugarr.in") ||
        normalizedOrigin.endsWith(".vercel.app");

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API endpoints
app.use("/api/ping", pingRoutes);
app.use("/api/waitlist", waitlistRoutes);
app.use("/api/blogs", blogRoutes);

// Root test route
app.get("/", (req, res) => {
  res.json({ message: "Jugarr API is up and running" });
});

// Database connection & start server
connectToDatabase()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed. Exiting...", err);
    process.exit(1);
  });
