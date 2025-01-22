const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

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
  const t = await sequelize.transaction();

  try {
    const { description, amount, category } = req.body;

    const expense = await Expense.create(
      {
        description,
        amount: parseFloat(amount),
        category,
        userId: req.user.userId,
      },
      { transaction: t }
    );

    // Update user's total expenses
    await User.increment("totalExpenses", {
      by: parseFloat(amount),
      where: { id: req.user.userId },
      transaction: t,
    });

    await t.commit();
    res.status(201).json(expense);
  } catch (err) {
    await t.rollback();
    console.error("Error creating expense:", err);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const expense = await Expense.findOne({
      where: { id, userId: req.user.userId },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({
        error: "Expense not found or you don't have permission to delete it",
      });
    }

    // Decrease user's total expenses
    await User.decrement("totalExpenses", {
      by: parseFloat(expense.amount),
      where: { id: req.user.userId },
      transaction: t,
    });

    await expense.destroy({ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

exports.updateExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;

    const expense = await Expense.findOne({
      where: { id, userId: req.user.userId },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({
        error: "Expense not found or you don't have permission to update it",
      });
    }

    const amountDifference = parseFloat(amount) - parseFloat(expense.amount);

    // Update user's total expenses with the difference
    if (amountDifference !== 0) {
      await User.increment("totalExpenses", {
        by: amountDifference,
        where: { id: req.user.userId },
        transaction: t,
      });
    }

    await expense.update({ description, amount, category }, { transaction: t });

    await t.commit();
    res.status(200).json({ message: "Expense updated successfully" });
  } catch (err) {
    await t.rollback();
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
};
