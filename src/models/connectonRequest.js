const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // creating reference to User Model
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: `{VALUE} is not a valid status`,
      },
    },
  },
  { timestamps: true },
);

//compound index to ensure that a user cannot send multiple requests to the same user
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

//this is a pre save hook that will check if the fromUserId and toUserId are the same
//this will be called before the save method is called on the connectionRequestSchema
connectionRequestSchema.pre("save", function () {
  const connectionRequest = this;
  //check if fromUserId and toUserId are the same
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You cannot send a request to yourself");
  }
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema,
);

module.exports = ConnectionRequestModel;
