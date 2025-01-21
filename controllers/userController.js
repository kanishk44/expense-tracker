const User = require("../models/user");
const bcrypt = require("bcrypt");

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

    // Compare password with hashed password in database
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Set user session
    req.session.userId = user.id;
    req.session.userName = user.name;

    res.status(200).json({
      message: "User login successful",
      userId: user.id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ error: "Error during login" });
  }
};
