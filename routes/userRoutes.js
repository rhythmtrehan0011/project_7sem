const express = require("express");
const { signUpUser } = require("../controllers/userController");
const { signInUser } = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/signin", signInUser);

module.exports = router;
