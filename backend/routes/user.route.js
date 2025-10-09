const express = require("express");
const { signUpUser, signInUser, logoutUser, forgotPassword, resetPassword } = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
