import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, "Slug is required."],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required."],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required."],
    },
    author: {
      type: String,
      default: "Team Jugarr",
      trim: true,
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    readTime: {
      type: String,
      default: "5 min read",
      trim: true,
    },
    category: {
      type: String,
      default: "EARN",
      uppercase: true,
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    seoTitle: {
      type: String,
      trim: true,
      default: "",
    },
    seoDescription: {
      type: String,
      trim: true,
      default: "",
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.BlogPost ||
  mongoose.model("BlogPost", BlogPostSchema);
