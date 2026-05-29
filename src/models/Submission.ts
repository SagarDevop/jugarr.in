import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Check if the model already exists to prevent OverwriteModelError in Next.js
export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
