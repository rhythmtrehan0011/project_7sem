const Profile = require("../models/profileModel");
const User = require("../models/authModel");

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.id })
      .populate("user", "-password")
      .populate("followers", "firstName lastName email")
      .populate("following", "firstName lastName email");
    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.log("Error in getProfile:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, location, avatar } = req.body;
    let profile = await Profile.findOne({ user: req.id });
    if (!profile) {
      profile = new Profile({
        user: req.id,
        bio,
        location,
        avatar,
      });
    } else {
      if (bio !== undefined) profile.bio = bio;
      if (location !== undefined) profile.location = location;
      if (avatar !== undefined) profile.avatar = avatar;
    }
    await profile.save();
    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      data: profile,
    });
  } catch (error) {
    console.log("Error in updateProfile:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

const followUser = async (req, res) => {
  try {
    const toFollowId = req.params.id;
    if (toFollowId === req.id) {
      return res.status(400).json({
        message: "You can'tfollow yourself",
        success: false,
      });
    }
    const me = await Profile.findOne({ user: req.id });
    const toFollow = await Profile.findOne({ user: toFollowId });
    if (!me || !toFollow) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    if (!me.following.includes(toFollowId)) {
      me.following.push(toFollowId);
      await me.save();
    }
    if (!toFollow.followers.includes(req.id)) {
      toFollow.followers.push(req.id);
      await toFollow.save();
    }
    res.status(200).json({
      message: "User followed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in followUser:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const toFollowId = req.params.id;
    const me = await Profile.findOne({ user: req.id });
    const toFollow = await Profile.findOne({ user: toFollowId });
    if (!me || !toFollow) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    me.following = me.following.filter((id) => id.toString() !== toFollowId);
    await me.save();
    toFollow.followers = toFollow.followers.filter(
      (id) => id.toString() !== req.id
    );
    await toFollow.save();
    res.status(200).json({
      message: "User unfollowed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in unfollowUser:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
};
