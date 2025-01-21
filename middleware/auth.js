const jwt = require("jsonwebtoken");

const JWT_SECRET = "your-secret-key"; // In production, use environment variable

const authenticateToken = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Received token:", token);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

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
