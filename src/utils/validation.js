const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is required");
  }
  //there are some validations in schema level, so we can skip them here or we can add them here as well
  else if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  } else if (!password || !validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateLoginData = async (req, user, res) => {
  const { emailId, password } = req.body;
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid credentials");
  }
  const passwordValid = await user.validatePassword(password);
  if (passwordValid) {
    //create a JWT token and send it to the client
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });
    res.send("User logged in successfully");
  }
  if (!passwordValid) {
    throw new Error("Invalid credentials");
  }
};

const validateProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];
  const isValidOperation = Object.keys(req.body).every((update) => {
    return allowedEditFields.includes(update);
  });
  return isValidOperation;
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateProfileData,
};
