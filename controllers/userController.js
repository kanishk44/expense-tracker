const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user with hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isPremium: false,
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      userId: user.id,
      name: user.name,
      isPremium: user.isPremium,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Error creating user" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        isPremium: user.isPremium,
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({
      message: "User login successful",
      token,
      userId: user.id,
      name: user.name,
      isPremium: user.isPremium,
    });
  } catch (err) {
    console.error("Login error details:", {
      error: err,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ error: "Error during login" });
  }
};
