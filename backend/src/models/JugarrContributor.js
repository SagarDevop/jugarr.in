import mongoose from "mongoose";

const JugarrContributorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full Name is required."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      trim: true,
    },
    role: {
      type: String,
      default: "Contributor",
      trim: true,
    },
    shortBio: {
      type: String,
      required: [true, "Short bio is required."],
      trim: true,
    },
    longBio: {
      type: String,
      default: "",
      trim: true,
    },
    journey: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    instagram: {
      type: String,
      default: "",
      trim: true,
    },
    github: {
      type: String,
      default: "",
      trim: true,
    },
    twitter: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "🏆 Founding Contributor",
      trim: true,
    },
    contributorNumber: {
      type: String,
      default: "",
      trim: true,
    },
    joinedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

JugarrContributorSchema.index({ name: "text", shortBio: "text", role: "text" });

export default mongoose.models.JugarrContributor ||
  mongoose.model("JugarrContributor", JugarrContributorSchema);
