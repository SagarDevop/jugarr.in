import dotenv from "dotenv";
import connectToDatabase from "./lib/mongoose.js";
import JugarrContributor from "./models/JugarrContributor.js";

dotenv.config();

const initialContributors = [
  {
    name: "Sagar Singh",
    slug: "sagar-singh",
    role: "Founding Jugarr Contributor & Lead Developer",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    shortBio: "Building full-stack architecture and student marketplace technology to empower campus micro-economies across India.",
    longBio: "Sagar Singh is a tech enthusiast and product architect passionate about solving real-world challenges for college students. At Jugarr, he spearheads platform engineering, backend scalability, and seamless user experiences.",
    journey: "Sagar joined Jugarr on day one, recognizing that students across colleges were trading books, services, and gadgets through fragmented messaging apps. He helped architect Jugarr's core student marketplace engine.",
    linkedin: "https://linkedin.com/in/sagarsingh",
    github: "https://github.com/sagarsingh",
    twitter: "https://x.com/sagarsingh",
    website: "https://jugarr.in",
    joinedDate: "Aug 2024",
    featured: true,
    active: true,
  },
  {
    name: "Prince Kumar",
    slug: "prince-kumar",
    role: "Founding Contributor & Community Strategist",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    shortBio: "Fostering campus relationships, ambassador networks, and student engagement programs across partner universities.",
    longBio: "Prince Kumar focuses on community growth and outreach strategy. He works closely with campus leaders to launch peer-to-peer trading hubs and student skill showcases.",
    journey: "Prince spearheaded the initial campus outreach initiative for Jugarr, establishing founding student groups and gathering feedback that shaped the platform's core identity.",
    linkedin: "https://linkedin.com/in/princekumar",
    instagram: "https://instagram.com/princekumar",
    twitter: "https://x.com/princekumar",
    joinedDate: "Sep 2024",
    featured: true,
    active: true,
  },
];

async function seedJugarris() {
  try {
    console.log("Connecting to MongoDB...");
    await connectToDatabase();

    console.log("Seeding Jugarris contributors...");
    for (const data of initialContributors) {
      await JugarrContributor.findOneAndUpdate(
        { slug: data.slug },
        { $set: data },
        { upsert: true, new: true }
      );
      console.log(`- Upserted contributor: ${data.name} (${data.slug})`);
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedJugarris();
