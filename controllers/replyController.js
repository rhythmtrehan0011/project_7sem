const Post = require("../models/nestedCommentModel");


const findReply = (replies, replyId) => {
  for (let reply of replies) {
    if (reply._id.toString() === replyId) return reply;
    const nested = findReply(reply.replies, replyId);
    if (nested) return nested;
  }
  return null;
};


const addReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text required", success: false });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    if (replyId) {
      const parentReply = findReply(post.comments.id(commentId).replies, replyId);
      if (!parentReply) return res.status(404).json({ message: "Parent reply not found", success: false });
      parentReply.replies.push({ user: req.user._id, text });
    } else {
      const comment = post.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found", success: false });
      comment.replies.push({ user: req.user._id, text });
    }

    await post.save();
    res.status(200).json({ message: "Reply added", success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to add reply", success: false });
  }
};


const updateReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    const reply = findReply(post.comments.id(commentId).replies, replyId);
    if (!reply || reply.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized", success: false });

    if (text) reply.text = text;
    await post.save();
    res.status(200).json({ message: "Reply updated", success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to update reply", success: false });
  }
};



const deleteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found", success: false });

    const deleteRecursive = (replies, replyId) => {
      const index = replies.findIndex(r => r._id.toString() === replyId);
      if (index !== -1) {
        replies.splice(index, 1);
        return true;
      }
      for (let r of replies) {
        if (deleteRecursive(r.replies, replyId)) return true;
      }
      return false;
    };

    if (!deleteRecursive(comment.replies, replyId))
      return res.status(404).json({ message: "Reply not found", success: false });

    await post.save();
    res.status(200).json({ message: "Reply deleted", success: true, data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to delete reply", success: false });
  }
};


const voteReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const { type } = req.body; 

    if (!['upvote','downvote'].includes(type))
      return res.status(400).json({ message: "Invalid vote type", success: false });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    const reply = findReply(post.comments.id(commentId).replies, replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found", success: false });

    const userId = req.user._id.toString();


    if (type === "upvote") {
      reply.votes.downvotes = reply.votes.downvotes.filter(u => u.toString() !== userId);
      if (reply.votes.upvotes.includes(userId)) {
        reply.votes.upvotes = reply.votes.upvotes.filter(u => u.toString() !== userId);
      } else {
        reply.votes.upvotes.push(userId);
      }
    } else {
      reply.votes.upvotes = reply.votes.upvotes.filter(u => u.toString() !== userId);
      if (reply.votes.downvotes.includes(userId)) {
        reply.votes.downvotes = reply.votes.downvotes.filter(u => u.toString() !== userId);
      } else {
        reply.votes.downvotes.push(userId);
      }
    }

    await post.save();
    res.status(200).json({ message: "Vote recorded", success: true, data: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to vote", success: false });
  }
};

module.exports = { addReply, updateReply, deleteReply, voteReply };
