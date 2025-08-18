const express = require("express");
const passport = require("passport");
const {
  addReply,
  updateReply,
  deleteReply,
  voteReply
} = require("../controllers/replyController");

const router = express.Router();


router.post("/:postId/comments/:commentId/replies", passport.authenticate("jwt", { session: false }), addReply);
router.post("/:postId/comments/:commentId/replies/:replyId", passport.authenticate("jwt", { session: false }), addReply);

router.put("/:postId/comments/:commentId/replies/:replyId", passport.authenticate("jwt", { session: false }), updateReply);

router.delete("/:postId/comments/:commentId/replies/:replyId", passport.authenticate("jwt", { session: false }), deleteReply);


router.post("/:postId/comments/:commentId/replies/:replyId/vote", passport.authenticate("jwt", { session: false }), voteReply);

module.exports = router;
