import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, required: true, lowercase: true, trim: true },
    applicantPhone: { type: String, trim: true, default: "" },
    collegeName: { type: String, trim: true, default: "" },
    resumeUrl: { type: String, required: true },
    resumeOriginalName: { type: String, default: "resume.pdf" },
    coverNote: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewed", "shortlisted", "rejected"],
      default: "new",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Application =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);

export default Application;
