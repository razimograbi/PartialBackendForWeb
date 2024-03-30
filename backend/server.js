const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config(); // to make server.js have access to .env file .
const connectDB = require("./config/connectDB");
const PORT = process.env.PORT || 2501;
const cors = require("cors");

// middleware functions
const cookieJwtAuth = require("./middleware/cookieJwtAuth");
const fetchUserData = require("./middleware/fetchUserData");

// routes import
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const userHomeRouter = require("./routes/userHome");
const expensesRouter = require("./routes/expenses");
const budgetRouter = require("./routes/budget");
const goalsRouter = require("./routes/goals");
const incomeRouter = require("./routes/income");

// middleWare
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); // allow any one to send you http requests

//routing
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/pages/userHome", [cookieJwtAuth, fetchUserData], userHomeRouter);
app.use("/pages/api/expenses", [cookieJwtAuth, fetchUserData], expensesRouter);
app.use("/pages/api/budget", [cookieJwtAuth, fetchUserData], budgetRouter);
app.use("/pages/api/goals", cookieJwtAuth, goalsRouter);
app.use("/income", cookieJwtAuth, incomeRouter);

app.get("/", (req, res) => {
  res.status(200).json({ success: true });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
