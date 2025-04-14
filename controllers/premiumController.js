const User = require("../models/user");

exports.getLeaderboard = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({ error: "Premium feature only" });
    }

    const leaderboard = await User.find(
      {},
      {
        _id: 1,
        name: 1,
        totalExpenses: 1,
      }
    ).sort({ totalExpenses: -1 });

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
