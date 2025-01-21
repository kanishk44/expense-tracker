const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./util/database");
const expenseRoutes = require("./routes/expense");
const path = require("path");
const userRoutes = require("./routes/user");
const session = require("express-session");

const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

// Add session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
};

// Public routes
app.use("/api", userRoutes);

// Protected routes
app.use("/api", authenticateUser, expenseRoutes);

// Serve login page for unauthenticated users
app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Protected main page
app.get("/", authenticateUser, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add logout route
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
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
