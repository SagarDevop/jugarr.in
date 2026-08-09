import mongoose from "mongoose";
import dns from "dns";

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  // Set public DNS servers to resolve MongoDB Atlas SRV records correctly in environments
  // where the local DNS resolver fails to handle SRV queries (e.g., local developer hotspots).
  if (MONGODB_URI.startsWith("mongodb+srv://")) {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (err) {
      console.warn("Failed to set public DNS servers, connecting with default resolver...", err);
    }
  }

  return mongoose.connect(MONGODB_URI);
}

export default connectToDatabase;
