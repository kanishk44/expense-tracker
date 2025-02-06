const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

const authenticateToken = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Convert string ID to MongoDB ObjectId
    req.user = {
      ...decoded,
      userId: new mongoose.Types.ObjectId(decoded.userId),
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { authenticateToken, JWT_SECRET };
