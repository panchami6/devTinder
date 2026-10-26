const express = require("express");
const ConnectionRequestModel = require("../models/connectonRequest");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequestModel.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", ["firstName", "lastName", "photoUrl"]);

    //we need user info instead of just fromIds. This is what connectionRequestModel has

    //we need to find the relation between 2 collections : add ref in connectionRequestModel fromUserId

    res.json({
      message: "Successfully fetched connection requests",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("Error getting connections: " + err.message);
  }
});

module.exports = userRouter;
