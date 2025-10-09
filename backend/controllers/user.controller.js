const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const generateToken = require("../utils/generateToken");

const signUpUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, email, password } = req.body;
    if (!firstName || !lastName || !phoneNumber || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
        success: false,
      });
    }
    const alreadySignedUp = await User.findOne({ email });
    if (alreadySignedUp) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = generateToken(newUser._id, res);
    res.status(201).json({
      message: "User created successfully",
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        token,
      },
      success: true,
    });
  } catch (err) {
    console.log("Error in signUpUser:", err);
    res.status(500).json({
      message: "Internal Server error",
      success: false,
    });
  }
};

const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "fill all details",
        success: false,
      });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        message: "incorrect credentials",
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "invalid email or password",
        success: false,
      });
    }
    const token = generateToken(existingUser._id, res);
    res.status(200).json({
      message: "sign in successful",
      data: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        phoneNumber: existingUser.phoneNumber,
        token,
      },
      success: true,
    });
  } catch (err) {
    console.log("Error in signinUser:", err);
    res.status(500).json({
      message: "Internal Server error",
      success: false,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please provide an email",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();
    const resetURL = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;
    res.status(200).json({
      message: "Password reset token generated successfully",
      resetURL,
      success: true,
    });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required",
        success: false,
      });
    }
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({
      message: "Password reset successful",
      success: true,
    });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (err) {
    console.log("Error in logoutUser:", err);
    res.status(500).json({
      message: "Internal Server error",
      success: false,
    });
  }
};

module.exports = {
  signUpUser,
  signInUser,
  forgotPassword,
  resetPassword,
  logoutUser,
};
