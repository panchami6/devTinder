const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");

const { validateSignUpData, validateLoginData } = require("./utils/validation");

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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

app.get("/profile", userAuth, async (req, res) => {
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
