/*
 * Server configuration for a personal finance management application.
 * This file sets up the Express server with necessary middleware for request parsing, authentication, and routes for handling user interactions such as login, registration, and financial data management.
 */

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config(); // to make server.js have access to .env file .
const connectDB = require("./config/connectDB"); // Handles database connection setup
const PORT = process.env.PORT || 2501;
const cors = require("cors");

// Middleware for handling cookies and user authentication
const cookieJwtAuth = require("./middleware/cookieJwtAuth");
const fetchUserData = require("./middleware/fetchUserData");

// Routing modules for various parts of the application
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const userHomeRouter = require("./routes/userHome");
const expensesRouter = require("./routes/expenses");
const budgetRouter = require("./routes/budget");
const goalsRouter = require("./routes/goals");
const incomeRouter = require("./routes/income");

// Global middleWare
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); // allow any one to send you http requests

// Setting up routes with their specific middleware
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/pages/userHome", [cookieJwtAuth, fetchUserData], userHomeRouter);
app.use("/pages/api/expenses", [cookieJwtAuth, fetchUserData], expensesRouter);
app.use("/pages/api/budget", [cookieJwtAuth, fetchUserData], budgetRouter);
app.use("/pages/api/goals", cookieJwtAuth, goalsRouter);
app.use("/income", cookieJwtAuth, incomeRouter);

// Default route for testing server status
app.get("/", (req, res) => {
  res.status(200).json({ success: true });
});

// Function to start the server and handle connection issues
const startServer = async () => {
  try {
    await connectDB(); // Connect to database before starting the server
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
