const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateProfileData } = require("../utils/validation");
const validator = require("validator");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("Error fetching the profile:" + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateProfileData(req)) {
      throw new Error("Invalid edit request");
    }
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }

    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    await user.save();

    res.json({ message: "Profile updated successfully", data: user });
  } catch (err) {
    res.status(400).send("Error updating the profile:" + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User not found");
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new Error("Current and new password are required");
    }
    if (currentPassword === newPassword) {
      throw new Error("Password cannot be the same as the current password");
    }
    const isNewPasswordStrong = validator.isStrongPassword(newPassword);
    if (!isNewPasswordStrong) {
      throw new Error("Your password is not strong enough");
    }
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error("Provide a valid password");
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();
    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send("Error updating the password:" + err.message);
  }
});

module.exports = profileRouter;
