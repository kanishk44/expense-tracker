const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isPremium: false,
    });

    const token = jwt.sign(
      {
        userId: user._id.toString(), // Convert ObjectId to string
        email: user.email,
        isPremium: false,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      userId: user._id.toString(), // Convert ObjectId to string
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(), // Convert ObjectId to string
        email: user.email,
        isPremium: user.isPremium,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "User login successful",
      token,
      userId: user._id.toString(), // Convert ObjectId to string
      name: user.name,
      isPremium: user.isPremium,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error during login" });
  }
};
