const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  try {
    // Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Login successful
    const token = jwt.sign(
      { name: user.name, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true });
    res
      .status(200)
      .json({
        message: "Login successful.",
        user: { email: user.email, name: user.name },
        token: token,
      });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error while attempting login." });
  }
});

module.exports = router;
