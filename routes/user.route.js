const express = require("express");
const { signUpUser, loginUser, logoutUser } = require("../controllers/user.controller");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

module.exports = router;
