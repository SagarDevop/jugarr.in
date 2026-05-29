import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Submission from "@/models/Submission";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    // Count total submissions in the database
    const submissionsCount = await Submission.countDocuments();
    // Adding 60 as base count, same as before
    const count = 60 + submissionsCount;
    return Response.json({ count });
  } catch (error) {
    console.error("Error connecting to database:", error);
    return Response.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email) {
      return Response.json(
        { error: "Name and Email are required." },
        { status: 400 }
      );
    }

    // Simple email validation pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email already exists
    const existingSubmission = await Submission.findOne({ email: email.trim().toLowerCase() });
    if (existingSubmission) {
      return Response.json(
        { error: "This email is already on the waitlist." },
        { status: 400 }
      );
    }

    // Create new submission entry in MongoDB
    const newSubmission = await Submission.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: (message || "").trim(),
    });

    const submissionsCount = await Submission.countDocuments();
    const count = 60 + submissionsCount;
    
    return Response.json({ success: true, count });
  } catch (error) {
    console.error("Waitlist API handler error:", error);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
