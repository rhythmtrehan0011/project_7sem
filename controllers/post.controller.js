const Post = require("../models/post.model");

const findCommentById = (comments, targetId) => {
  if (!comments) return null;
  for (const comment of comments) {
    if (String(comment._id) === String(targetId)) return comment;
    const inChild = findCommentById(comment.replies, targetId);
    if (inChild) return inChild;
  }
  return null;
};

const applyVote = (doc, userId, direction) => {
  const userIdStr = String(userId);
  doc.upvoters = (doc.upvoters || []).filter((u) => String(u) !== userIdStr);
  doc.downvoters = (doc.downvoters || []).filter(
    (u) => String(u) !== userIdStr
  );
  if (direction === "up") {
    doc.upvoters.push(userId);
  } else if (direction === "down") {
    doc.downvoters.push(userId);
  }
};

const getPosts = async (req, res) => {
  try {
    const {
      search,
      author,
      tag,
      category,
      sort,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (author) filter.author = author;
    if (tag) filter.tags = tag;
    if (category) filter.category = category;
    const match = search ? { ...filter, $text: { $search: search } } : filter;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(Math.min(parseInt(limit, 10) || 10, 100), 1);
    const sortStage =
      sort === "most_upvoted"
        ? { score: -1, createdAt: -1 }
        : { createdAt: -1 };
    const pipeline = [
      { $match: match },
      {
        $addFields: {
          score: {
            $subtract: [
              { $size: { $ifNull: ["$upvoters", []] } },
              { $size: { $ifNull: ["$downvoters", []] } },
            ],
          },
        },
      },
      { $sort: sortStage },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ];
    const [items, totalCount] = await Promise.all([
      Post.aggregate(pipeline),
      Post.countDocuments(match),
    ]);
    const ids = items.map((i) => i._id);
    let posts = await Post.find({ _id: { $in: ids } })
      .populate("author", "firstname lastname email")
      .populate("comments.user", "firstname lastname email")
      .populate("comments.replies.user", "firstname lastname email");
    const idToPost = new Map(posts.map((p) => [String(p._id), p]));
    posts = ids.map((id) => idToPost.get(String(id))).filter(Boolean);
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Cannot fetch posts",
    });
  }
};

const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug })
      .populate("author", "firstname lastname email")
      .populate("comments.user", "firstname lastname email")
      .populate("comments.replies.user", "firstname lastname email");
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch post by slug" });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, body, tags, category } = req.body;
    if (!title || !body) {
      return res.status(400).json({
        message: "Title and body are required",
        success: false,
      });
    }
    const post = new Post({
      author: req.user._id,
      title,
      body,
      tags: Array.isArray(tags) ? tags : [],
      category: category || "General",
    });
    await post.save();
    res.status(201).json({
      message: "Post created",
      success: true,
      data: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to create post",
      success: false,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, tags, category } = req.body;
    const post = await Post.findOne({ _id: id, author: req.user._id });
    if (!post)
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    if (title !== undefined) post.title = title;
    if (body !== undefined) post.body = body;
    if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : [];
    if (category !== undefined) post.category = category;
    await post.save();
    res.status(200).json({
      message: "Post updated",
      success: true,
      data: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to update post",
      success: false,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate("author", "firstname lastname email")
      .populate("comments.user", "firstname lastname email")
      .populate("comments.replies.user", "firstname lastname email");
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Unable to fetch post" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOneAndDelete({ _id: id, author: req.user._id });
    if (!post)
      return res.status(404).json({
        message: "Post not found or not authorized",
        success: false,
      });
    res.status(200).json({
      message: "Post deleted",
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to delete post",
      success: false,
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text)
      return res.status(400).json({
        message: "Comment cannot be empty",
        success: false,
      });
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    post.comments.push({ user: req.user._id, text, replies: [] });
    await post.save();
    res.status(200).json({
      message: "Comment added",
      success: true,
      data: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to add comment",
      success: false,
    });
  }
};

const addReply = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        message: "Reply cannot be empty",
        success: false,
      });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }
    const comment = findCommentById(post.comments, commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }
    comment.replies.push({ user: req.user._id, text, replies: [] });
    await post.save();
    res.status(200).json({
      message: "Reply added",
      success: true,
      data: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to add reply",
      success: false,
    });
  }
};

const votePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    if (!["up", "down", "clear"].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote direction",
      });
    }
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    applyVote(post, req.user._id, direction);
    await post.save();
    res.status(200).json({
      success: true,
      message: "Vote updated",
      data: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Unable to vote on post",
    });
  }
};

const voteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { direction } = req.body;
    if (!["up", "down", "clear"].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote direction",
      });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const comment = findCommentById(post.comments, commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }
    applyVote(comment, req.user._id, direction);
    await post.save();
    res.status(200).json({
      success: true,
      message: "Vote updated",
      data: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Unable to vote on comment",
    });
  }
};

const listTags = async (req, res) => {
  try {
    const tags = await Post.distinct("tags");
    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch tags",
    });
  }
};

const listCategories = async (req, res) => {
  try {
    const categories = await Post.distinct("category");
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Unable to fetch categories",
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  addComment,
  addReply,
  votePost,
  voteComment,
  listTags,
  listCategories,
};
