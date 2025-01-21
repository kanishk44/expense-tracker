const Expense = require("../models/expense");

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [["createdAt", "DESC"]], // Show newest expenses first
    });
    res.json(expenses || []); // Ensure we always return an array
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    const expense = await Expense.create({
      description,
      amount,
      category,
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.destroy({
      where: { id },
    });
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
    await Expense.update({ description, amount, category }, { where: { id } });
    res.status(200).json({ message: "Expense updated successfully" });
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
};
