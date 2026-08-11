import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Gig"],
      required: true,
    },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    postedAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

export default Job;
