const express = require("express");
const passport = require("passport");
const {
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
} = require("../controllers/post.controller");

const router = express.Router();

router.get("/slug/:slug", getPostBySlug);
router.get("/meta/tags", listTags);
router.get("/meta/categories", listCategories);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", passport.authenticate("jwt", { session: false }), createPost);
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updatePost
);
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  deletePost
);
router.post(
  "/:id/comment",
  passport.authenticate("jwt", { session: false }),
  addComment
);
router.post(
  "/:postId/comment/:commentId/reply",
  passport.authenticate("jwt", { session: false }),
  addReply
);
router.post(
  "/:id/vote",
  passport.authenticate("jwt", { session: false }),
  votePost
);
router.post(
  "/:postId/comment/:commentId/vote",
  passport.authenticate("jwt", { session: false }),
  voteComment
);

module.exports = router;
