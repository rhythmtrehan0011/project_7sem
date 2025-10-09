import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  ThumbUp,
  ThumbDown,
  Edit,
  Delete,
  Reply,
  ArrowBack,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      setPost(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch post");
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleVote = async (postId, direction) => {
    try {
      const response = await api.post(`/posts/${postId}/vote`, { direction });
      setPost({
        ...post,
        upvoters: response.data.data.upvoters,
        downvoters: response.data.data.downvoters,
      });
    } catch (err) {
      console.error("Error voting on post:", err);
    }
  };

  const handleCommentVote = async (postId, commentId, direction) => {
    try {
      const response = await api.post(
        `/posts/${postId}/comment/${commentId}/vote`,
        { direction }
      );
      setPost({ ...post, comments: response.data.data.comments });
    } catch (err) {
      console.error("Error voting on comment:", err);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(`/posts/${id}/comment`, {
        text: commentText,
      });
      setPost({ ...post, comments: response.data.data.comments });
      setCommentText("");
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (commentId) => {
    if (!replyText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(
        `/posts/${id}/comment/${commentId}/reply`,
        { text: replyText }
      );
      setPost({ ...post, comments: response.data.data.comments });
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error submitting reply:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/posts/${id}`);
        navigate("/");
      } catch (err) {
        console.error("Error deleting post:", err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScore = (item) => {
    const upvotes = item.upvoters?.length || 0;
    const downvotes = item.downvoters?.length || 0;
    return upvotes - downvotes;
  };

  const renderComment = (comment, depth = 0) => (
    <Box key={comment._id} sx={{ ml: depth * 3, mb: 2 }}>
      <Card variant="outlined">
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                {comment.user?.firstName} {comment.user?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              sx={{ ml: 2 }}
            >
              <Typography variant="h6" color="primary">
                {getScore(comment)}
              </Typography>
              <Box>
                <IconButton
                  onClick={() => handleCommentVote(id, comment._id, "up")}
                  color="primary"
                  size="small"
                >
                  <ThumbUp />
                </IconButton>
                <IconButton
                  onClick={() => handleCommentVote(id, comment._id, "down")}
                  color="error"
                  size="small"
                >
                  <ThumbDown />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {depth < 2 && (
            <Button
              size="small"
              startIcon={<Reply />}
              onClick={() => setReplyingTo(comment._id)}
              sx={{ mt: 1 }}
            >
              Reply
            </Button>
          )}

          {replyingTo === comment._id && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleSubmitReply(comment._id)}
                  disabled={submittingComment}
                  sx={{ mr: 1 }}
                >
                  Reply
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || "Post not found"}</Alert>
        <Button component={Link} to="/" sx={{ mt: 2 }}>
          Back to Posts
        </Button>
      </Container>
    );
  }

  const isAuthor = user && post.author?._id === user._id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} component={Link} to="/" sx={{ mb: 2 }}>
        Back to Posts
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>

          {isAuthor && (
            <Box>
              <IconButton
                component={Link}
                to={`/posts/${post._id}/edit`}
                color="primary"
              >
                <Edit />
              </IconButton>
              <IconButton onClick={handleDeletePost} color="error">
                <Delete />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip label={post.category} color="primary" />
          {post.tags?.map((tag) => (
            <Chip key={tag} label={tag} variant="outlined" />
          ))}
        </Box>

        <Typography variant="body1" sx={{ mb: 3, whiteSpace: "pre-wrap" }}>
          {post.body}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            By {post.author?.firstName} {post.author?.lastName} •{" "}
            {formatDate(post.createdAt)}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={() => handleVote(post._id, "up")}
              color="primary"
            >
              <ThumbUp />
            </IconButton>
            <Typography variant="h6" color="primary">
              {getScore(post)}
            </Typography>
            <IconButton
              onClick={() => handleVote(post._id, "down")}
              color="error"
            >
              <ThumbDown />
            </IconButton>
            <Typography variant="caption" sx={{ ml: 1 }}>
              votes
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({post.comments?.length || 0})
        </Typography>

        {/* Add Comment Form */}
        <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={submittingComment || !commentText.trim()}
          >
            {submittingComment ? <CircularProgress size={20} /> : "Comment"}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Comments List */}
        {post.comments?.length === 0 ? (
          <Typography color="text.secondary" align="center">
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          post.comments?.map((comment) => renderComment(comment))
        )}
      </Paper>
    </Container>
  );
};

export default PostDetail;
