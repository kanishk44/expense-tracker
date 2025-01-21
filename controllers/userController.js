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
