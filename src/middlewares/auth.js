const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies || !cookies.token) {
      throw new Error("Please Login to access the profile");
    }
    const decodedObj = await jwt.verify(cookies.token, "DEV@Tinder$576");
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user; // Attach the user object to the request for further use
    next();
  } catch (err) {
    res.status(400).send("Error in user authentication:" + err.message);
  }
};

module.exports = { userAuth };
