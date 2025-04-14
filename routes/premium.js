const express = require("express");
const router = express.Router();
const premiumController = require("../controllers/premiumController");
const { authenticateToken } = require("../middleware/auth");

router.get("/leaderboard", authenticateToken, premiumController.getLeaderboard);

module.exports = router;
