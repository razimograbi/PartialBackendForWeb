const express = require("express");
const router = express.Router();
const User = require("../model/userModel");

//    Get :  https://partialbackendforweb.onrender.com/pages/api/expenses

router.get("/", async (req, res) => {
  const { name, email, income, expenses, goals, budget } = req.userData;
  const responseData = {
    name: name,
    email: email,
    income: income,
    expenses: expenses,
    goals: goals,
    budget: budget,
  };
  res.json(responseData);
});

router.post("/add", async (req, res) => {
  const { category, amount, numberOfPayments, startDate } = req.body;
  // Validate the input
  if (!category || amount <= 0 || numberOfPayments <= 0) {
    return res
      .status(400)
      .send({
        message:
          "Invalid input. Ensure category is specified and amount is greater than zero.",
      });
  }
  const numberOfPaymentsAfterCasting = Number(numberOfPayments);

  let endDate;
  const updatedStartDate = startDate ? new Date(startDate) : new Date();

  // Calculate the endDate based on the numberOfPayments
  if (numberOfPaymentsAfterCasting > 1) {
    endDate = new Date(updatedStartDate);
    endDate.setMonth(endDate.getMonth() + numberOfPaymentsAfterCasting - 1); // Calculate endDate by adding numberOfPayments to the current month
  }
  const expense = {
    category,
    amount,
    monthlyPayment:
      numberOfPaymentsAfterCasting > 1
        ? amount / numberOfPaymentsAfterCasting
        : 0,
    startDate: startDate || updatedStartDate,
    endDate: endDate || null,
  };

  try {
    await User.updateOne(
      { email: req.userData.email }, // Find user by email
      { $push: { expenses: expense } } // Add the new expense to the expenses array
    );

    res.send({ message: "Expense added successfully." });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).send({ message: "Failed to add expense." });
  }
});

router.get("/retrieve", async (req, res) => {
  let { month, year } = req.query;

  if (!year) {
    return res
      .status(400)
      .send({ message: "Year is a required query parameter." });
  }
  year = Number(year);

  let startDate, endDate;
  if (month) {
    month = Number(month);
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0); // This will get the last day of the given month
  } else {
    startDate = new Date(year, 0, 1); // Start of the year
    endDate = new Date(year, 11, 31); // End of the year
  }

  try {
    const user = req.userData;

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Filter expenses for the specified year, and month
    const filteredExpenses = user.expenses.filter((expense) => {
      const expenseStartDate = new Date(expense.startDate);
      const expenseEndDate = expense.endDate
        ? new Date(expense.endDate)
        : expenseStartDate;
      return !(expenseEndDate <= startDate || endDate <= expenseStartDate);
    });

    res.json({ expenses: filteredExpenses });
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    res.status(500).send({ message: "Failed to retrieve expenses." });
  }
});

router.get("/upcoming-expenses", async (req, res) => {
  const currentDate = new Date();

  // Automatically determine the current year and month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate the start and end dates for the current month
  const startDate = new Date(year, month, 1); // First day of the current month
  const endDate = new Date(year, month + 1, 0); // Last day of the current month

  try {
    const user = req.userData;

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Filter expenses to find those that are upcoming expenses in the current month
    const upcomingExpenses = user.expenses.filter((expense) => {
      const expenseStartDate = new Date(expense.startDate);
      const expenseEndDate = expense.endDate
        ? new Date(expense.endDate)
        : expenseStartDate;
      return !(expenseEndDate <= startDate || endDate <= expenseStartDate);
    });

    res.send({ expenses: upcomingExpenses });
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    res.status(500).send({ message: "Failed to retrieve upcoming expenses." });
  }
});

module.exports = router;
