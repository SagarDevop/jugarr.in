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
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
    },
    joinWhatsappCommunity: {
      type: Boolean,
      default: false,
    },
    collegeName: {
      type: String,
      required: [true, "College name is required."],
      trim: true,
    },
    passoutYear: {
      type: String,
      required: [true, "Passout year is required."],
      trim: true,
    },
    problemFace: {
      type: String,
      trim: true,
      default: "",
    },
    whyJoin: {
      type: String,
      trim: true,
      default: "",
    },
    suggestions: {
      type: String,
      trim: true,
      default: "",
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
      trim: true,
      default: "",
    },
    referralCount: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Fallback to existing model if registered (prevents hot reload issues in ts-node-dev)
export default mongoose.models.Submission ||
  mongoose.model("Submission", SubmissionSchema);
