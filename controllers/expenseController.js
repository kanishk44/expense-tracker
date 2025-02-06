const Expense = require("../models/expense");
const User = require("../models/user");
const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.getExpenses = async (req, res) => {
  try {
    const { period } = req.query;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    let query = { userId: req.user.userId };

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    switch (period) {
      case "daily":
        query.date = { $gte: startOfDay };
        break;
      case "weekly":
        query.date = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case "monthly":
        query.date = { $gte: new Date(now.setDate(1)) };
        break;
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query).sort({ date: -1 }).skip(skip).limit(pageSize),
      Expense.countDocuments(query),
    ]);

    // Calculate totals
    const allExpenses = await Expense.find(query);
    const totals = allExpenses.reduce(
      (acc, curr) => {
        if (curr.type === "income") {
          acc.income += curr.amount;
        } else {
          acc.expense += curr.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    res.json({
      expenses,
      totals,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: skip + pageSize < total,
        hasPreviousPage: page > 1,
        totalItems: total,
        pageSize,
      },
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { description, amount, category, type } = req.body;

    const expense = await Expense.create({
      description,
      amount: parseFloat(amount),
      category,
      type,
      userId: req.user.userId,
    });

    if (type === "expense") {
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { totalExpenses: parseFloat(amount) },
      });
    }

    res.status(201).json(expense);
  } catch (err) {
    console.error("Error creating expense:", err);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }

    const expense = await Expense.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: req.user.userId,
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.type === "expense") {
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { totalExpenses: -expense.amount },
      });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, category } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid expense ID" });
    }

    const expense = await Expense.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: req.user.userId,
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // If it's an expense type, update the user's total expenses
    if (expense.type === "expense") {
      const amountDiff = parseFloat(amount) - expense.amount;
      if (amountDiff !== 0) {
        await User.findByIdAndUpdate(req.user.userId, {
          $inc: { totalExpenses: amountDiff },
        });
      }
    }

    expense.description = description;
    expense.amount = parseFloat(amount);
    expense.category = category;

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ error: "Failed to update expense" });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({ error: "Premium feature only" });
    }

    const expenses = await Expense.find({ userId: req.user.userId }).sort({
      date: -1,
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const filePath = path.join(uploadsDir, filename);

    // Write CSV to a temporary file
    fs.writeFileSync(filePath, csvContent);

    const fileStream = fs.createReadStream(filePath);

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Body: fileStream,
      ContentType: "text/csv",
    };

    const uploadResult = await s3.upload(params).promise();

    // Clean up temporary file
    fs.unlinkSync(filePath);

    // Generate a signed URL that expires in 1 hour
    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filename,
      Expires: 3600, // URL expires in 1 hour
    });

    res.json({
      message: "File uploaded successfully",
      fileUrl: signedUrl,
    });
  } catch (err) {
    console.error("Error downloading expenses:", err);
    res.status(500).json({ error: "Failed to download expenses" });
  }
};
