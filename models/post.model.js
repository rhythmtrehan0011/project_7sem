const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    upvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    downvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

commentSchema.add({ replies: [commentSchema] });

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
    category: {
      type: String,
      index: true,
      default: "General",
      trim: true,
    },
    upvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    downvoters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

postSchema.index({ title: "text", body: "text", tags: "text" });

postSchema.pre("save", async function (next) {
  if (!this.isModified("title") && this.slug) return next();
  const base = this.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let candidate = base;
  let counter = 1;
  while (
    await this.constructor.findOne({ slug: candidate, _id: { $ne: this._id } })
  ) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  this.slug = candidate;
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
