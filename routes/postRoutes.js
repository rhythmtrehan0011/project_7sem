const express = require("express");
const passport = require("passport");
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  addComment,
  getPosts,
  addReply,
} = require("../controllers/postcontroller");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/", getPosts);
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

module.exports = router;
