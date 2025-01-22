const Expense = require("../models/expense");

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(expenses || []);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category } = req.body;

    if (!description || !amount || !category) {
      return res.status(400).json({
        error: "Missing required fields",
        received: { description, amount, category },
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        error: "User ID not found in token",
        user: req.user,
      });
    }

    const expense = await Expense.create({
      description,
      amount: parseFloat(amount),
      category,
      userId: req.user.userId,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create expense",
      details: err.message,
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({
      where: { id, userId: req.user.userId },
    });

    if (!expense) {
      return res.status(404).json({
        error: "Expense not found or you don't have permission to delete it",
      });
    }

    await expense.destroy();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;

    const expense = await Expense.findOne({
      where: { id, userId: req.user.userId },
    });

    if (!expense) {
      return res.status(404).json({
        error: "Expense not found or you don't have permission to update it",
      });
    }

    await Expense.update(
      { description, amount, category },
      { where: { id, userId: req.user.userId } }
    );
    res.status(200).json({ message: "Expense updated successfully" });
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
};
