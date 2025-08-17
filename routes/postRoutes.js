const express = require("express");
const passport = require("passport");
const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  addComment,
  getPosts,
<<<<<<< HEAD
=======
  addReply,
>>>>>>> 45deb83559c4aa033317d2a2f2bb78d0bec660b0
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
<<<<<<< HEAD
  "/:id/comment/:commentId/reply",
=======
  "/:postId/comment/:commentId/reply",
>>>>>>> 45deb83559c4aa033317d2a2f2bb78d0bec660b0
  passport.authenticate("jwt", { session: false }),
  addReply
);

module.exports = router;
