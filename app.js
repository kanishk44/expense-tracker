const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./util/database");
const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const { authenticateToken } = require("./middleware/auth");
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

// Public routes
app.use("/api/user", userRoutes);

// Protected routes - mount expense routes at /api/expenses
app.use("/api/expenses", authenticateToken, expenseRoutes);

// Serve static files
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.log("Error connecting to database:", err);
  });
