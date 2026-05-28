import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const FILE_PATH = path.join(process.cwd(), "waitlist.json");

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
}

function getSubmissions(): Submission[] {
  try {
    if (!fs.existsSync(FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(data) || [];
  } catch (error) {
    console.error("Error reading waitlist database:", error);
    return [];
  }
}

function saveSubmissions(submissions: Submission[]): boolean {
  try {
    // Ensure containing directory exists (just in case)
    const dir = path.dirname(FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(submissions, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing waitlist database:", error);
    return false;
  }
}

export async function GET() {
  const submissions = getSubmissions();
  const count = 60 + submissions.length;
  return Response.json({ count });
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

    const submissions = getSubmissions();
    
    // Create new submission entry
    const newSubmission: Submission = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: (message || "").trim(),
      timestamp: new Date().toISOString(),
    };

    submissions.push(newSubmission);
    const success = saveSubmissions(submissions);

    if (!success) {
      return Response.json(
        { error: "Could not save to waitlist database." },
        { status: 500 }
      );
    }

    const count = 60 + submissions.length;
    return Response.json({ success: true, count });
  } catch (error) {
    console.error("Waitlist API handler error:", error);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
