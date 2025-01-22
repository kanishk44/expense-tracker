const jwt = require("jsonwebtoken");
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

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", {
      name: err.name,
      message: err.message,
    });
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { authenticateToken, JWT_SECRET };
