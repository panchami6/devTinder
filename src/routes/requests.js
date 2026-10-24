const express = require("express");
const requestsRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectonRequest");
const User = require("../models/user");

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatuses = ["interested", "ignored"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).send("Invalid status");
      }

      //check if user exists in the database
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).send("User not found");
      }

      //check if a request already exists between the two users
      //check if a request already exists from to UserId to from UserId
      const existingRequest = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        return res.status(400).send("Request already exists");
      }

      const connectionRequest = ConnectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      await connectionRequest.save();
      res.status(200).json({
        message: "Request sent successfully",
        data: connectionRequest,
      });
    } catch (error) {
      res.status(400).send("Error sending the request:" + error.message);
    }
  },
);

module.exports = requestsRouter;
