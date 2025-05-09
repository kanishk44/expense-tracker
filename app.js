const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./util/database");
const expenseRoutes = require("./routes/expense");
const userRoutes = require("./routes/user");
const { authenticateToken } = require("./middleware/auth");
const path = require("path");
const paymentRoutes = require("./routes/payment");
const premiumRoutes = require("./routes/premium");
const passwordRoutes = require("./routes/password");
const morgan = require("morgan");
const fs = require("fs");

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());
app.use(express.static("public"));

// Use morgan for logging in production
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use("/api/user", userRoutes);
app.use("/api/expenses", authenticateToken, expenseRoutes);
app.use("/api/payment", authenticateToken, paymentRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/password", passwordRoutes);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
