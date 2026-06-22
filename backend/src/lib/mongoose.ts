import mongoose from "mongoose";

async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  return mongoose.connect(MONGODB_URI);
}

export default connectToDatabase;
