const User = require("../models/user");

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

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Note: In a real application, you should hash the password
    });

    res
      .status(201)
      .json({ message: "User created successfully", userId: user.id });
  } catch (err) {
    res.status(500).json({ error: "Error creating user" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check password
    if (user.password !== password) {
      // Note: In production, use proper password hashing
      return res.status(401).json({ error: "Invalid password" });
    }

    // Login successful
    res.status(200).json({
      message: "User login successful",
      userId: user.id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Error during login" });
  }
};
