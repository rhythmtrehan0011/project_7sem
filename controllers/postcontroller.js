const Post = require("../models/postModel");

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "firstname lastname email")
      .populate("comments.user", "firstname lastname email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Unable to fetch posts",
      success: false,
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const { search, author } = req.query;
    let posts;
    if (search) {
      posts = await Post.find({ body: new RegExp(search, "i") })
        .populate("author", "firstname lastname email")
        .populate("comments.user", "firstname lastname email")
        .sort({ createdAt: -1 });
    } else if (author) {
      posts = await Post.find({ author })
        .populate("author", "firstname lastname email")
        .populate("comments.user", "firstname lastname email")
        .sort({ createdAt: -1 });
    } else {
      posts = await Post.find()
        .populate("author", "firstname lastname email")
        .populate("comments.user", "firstname lastname email")
        .sort({ createdAt: -1 });
    }
    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Cannot fetch posts",
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({
        message: "Body is required",
        success: false,
      });
    }
    const post = new Post({ author: req.user._id, body });
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
    const { body } = req.body;
    const post = await Post.findOne({ _id: id, author: req.user._id });
    if (!post)
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
<<<<<<< HEAD

=======
>>>>>>> 45deb83559c4aa033317d2a2f2bb78d0bec660b0
    if (body) post.body = body;
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
    post.comments.push({ user: req.user._id, text });
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
    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }
    comment.replies.push({ user: req.user.id, text });
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

module.exports = {
  getAllPosts,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  addComment,
<<<<<<< HEAD
  getPosts,
  addReply,
};
=======
  addReply,
};
>>>>>>> 45deb83559c4aa033317d2a2f2bb78d0bec660b0
