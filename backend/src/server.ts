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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
