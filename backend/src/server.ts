import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectToDatabase from "./lib/mongoose";
import waitlistRoutes from "./routes/waitlist";
import pingRoutes from "./routes/ping";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
const allowedOrigins = [
  "https://jugarr-in.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like server-to-server or postman)
      if (!origin) return callback(null, true);

      // Normalize origin by stripping trailing slash
      const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
      const isAllowed = allowedOrigins.some((allowed) => {
        const normalizedAllowed = allowed.endsWith("/") ? allowed.slice(0, -1) : allowed;
        return normalizedAllowed.toLowerCase() === normalizedOrigin.toLowerCase();
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// API endpoints
app.use("/api/ping", pingRoutes);
app.use("/api/waitlist", waitlistRoutes);

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
