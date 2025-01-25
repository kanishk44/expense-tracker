const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");
const { Op } = require("sequelize");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

exports.getExpenses = async (req, res) => {
  try {
    const { period } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let whereClause = { userId: req.user.userId };

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    switch (period) {
      case "daily":
        whereClause.date = {
          [Op.gte]: startOfDay,
        };
        break;
      case "weekly":
        whereClause.date = {
          [Op.gte]: new Date(now.setDate(now.getDate() - 7)),
        };
        break;
      case "monthly":
        whereClause.date = {
          [Op.gte]: new Date(now.setDate(1)),
        };
        break;
    }

    // Get total count for pagination
    const count = await Expense.count({ where: whereClause });
    const totalPages = Math.ceil(count / pageSize);

    const expenses = await Expense.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit: pageSize,
      offset,
    });

    // Calculate totals for the current filter
    const allExpenses = await Expense.findAll({
      where: whereClause,
      attributes: ["type", "amount"],
    });

    const totals = {
      income: allExpenses
        .filter((e) => e.type === "income")
        .reduce((sum, e) => sum + Number(e.amount), 0),
      expense: allExpenses
        .filter((e) => e.type === "expense")
        .reduce((sum, e) => sum + Number(e.amount), 0),
    };

    res.json({
      expenses,
      totals,
      pagination: {
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        totalItems: count,
        pageSize,
      },
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

exports.createExpense = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { description, amount, category, type } = req.body;

    const expense = await Expense.create(
      {
        description,
        amount: parseFloat(amount),
        category,
        type,
        userId: req.user.userId,
      },
      { transaction: t }
    );

    if (type === "expense") {
      await User.increment("totalExpenses", {
        by: parseFloat(amount),
        where: { id: req.user.userId },
        transaction: t,
      });
    }

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

exports.downloadExpenses = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({ error: "Premium feature only" });
    }

    const expenses = await Expense.findAll({
      where: { userId: req.user.userId },
      order: [["date", "DESC"]],
    });

    const headers = "Date,Type,Description,Category,Amount\n";
    const rows = expenses
      .map((expense) => {
        return `${expense.date.toISOString().split("T")[0]},${expense.type},${
          expense.description
        },${expense.category},${expense.amount}`;
      })
      .join("\n");

    const csvContent = headers + rows;
    const filename = `expenses_${req.user.userId}_${Date.now()}.csv`;
    const filePath = path.join(__dirname, "../uploads", filename);

    // Write CSV to a temporary file
    fs.writeFileSync(filePath, csvContent);

    const fileStream = fs.createReadStream(filePath);

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: fileStream,
      ContentType: "text/csv",
    };

    s3.upload(params, (err, data) => {
      // Clean up temporary file
      fs.unlinkSync(filePath);

      if (err) {
        console.error("Upload error:", err);
        return res
          .status(500)
          .json({ message: "File upload failed", error: err });
      }

      res.status(200).json({
        message: "File uploaded successfully",
        fileUrl: data.Location,
      });
    });
  } catch (err) {
    console.error("Error downloading expenses:", err);
    res.status(500).json({ error: "Failed to download expenses" });
  }
};
