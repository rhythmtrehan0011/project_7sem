const express = require("express");
const passport = require("passport");
const {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
} = require("../controller/profileController");

const router = express.Router();

router.get("/", passport.authenticate("jwt", { session: false }), getProfile);
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  updateProfile
);
router.post(
  "/follow/:id",
  passport.authenticate("jwt", { session: false }),
  followUser
);
router.post(
  "/unfollow/:id",
  passport.authenticate("jwt", { session: false }),
  unfollowUser
);

module.exports = router;
