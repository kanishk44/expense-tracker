const Expense = require("../models/expense");

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { description, amount } = req.body;
    const expense = await Expense.create({
      description,
      amount,
    });
    res.status(201).json(expense);
  } catch (err) {
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
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body;
    await Expense.update({ description, amount }, { where: { id } });
    res.status(200).json({ message: "Expense updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense" });
  }
};
