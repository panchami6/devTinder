const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
  try {
    //validate the user
    validateSignUpData(req);

    //encrypt the password
    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found");
    }
    await validateLoginData(req, user, res);
  } catch (err) {
    res.status(400).send("Error logging in the user:" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("User logged out successfully");
  } catch (err) {
    res.status(400).send("Error logging out the user:" + err.message);
  }
});
module.exports = authRouter;
