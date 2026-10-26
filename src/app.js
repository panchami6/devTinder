const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const requestsRouter = require("./routes/requests");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", requestsRouter);
app.use("/", profileRouter);
app.use("/", userRouter);

app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.emailId;
    const users = await User.findOne({ emailId: userEmail });
    if (!users) {
      return res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Error fetching the user:" + err.message);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const feed = await User.find({});
    res.send(feed);
  } catch (err) {
    res.status(400).send("Error fetching the feed:" + err.message);
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const userId = req.body.userId;
    await User.findOneAndDelete({ _id: userId });
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Error deleting the user:" + err.message);
  }
});

app.patch("/update/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;
    const updatedData = req.body;
    const ALLOWED_UPDATES = ["age", "gender", "photoUrl", "about", "skills"];

    const isValidOperation = Object.keys(updatedData).every((update) => {
      return ALLOWED_UPDATES.includes(update);
    });
    if (!isValidOperation) {
      throw new Error("Invalid update fields");
    }
    if (updatedData.skills.length > 10) {
      throw new Error("Skills cannot exceed 10");
    }
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      runValidators: true,
    });

    res.send("User updated Successfully");
  } catch (err) {
    res.status(400).send("Error updating the user:" + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });
