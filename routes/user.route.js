const express = require("express");
const { signUpUser, signInUser, logoutUser } = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);
router.post("/logout", logoutUser);

module.exports = router;
