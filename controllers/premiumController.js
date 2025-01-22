const User = require("../models/user");
const Expense = require("../models/expense");
const sequelize = require("../util/database");

exports.getLeaderboard = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({ error: "Premium feature only" });
    }

    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "name",
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("expenses.amount")),
            0
          ),
          "totalExpenses",
        ],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["user.id"],
      order: [[sequelize.literal("totalExpenses"), "DESC"]],
    });

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};
