const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const mongoose = require("mongoose");

// get all budgets
router.get("/", (req, res) => {
  try {
    const budgets = req.userData.budget;
    res.status(200).json(budgets);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve budgets", error: error.message });
  }
});

// add a budget for a specific category and month and year
router.post("/add", async (req, res) => {
  // Changed from .get to .post for adding data
  const { category, date, limit } = req.body;

  if (!category || limit == null || limit == undefined || limit < 0) {
    return res.status(400).send({
      message:
        "Invalid input. Ensure category is specified and limit is a non-negative number.",
    });
  }

  let budgetDate = date
    ? new Date(date).toISOString().slice(0, 7)
    : new Date().toISOString().slice(0, 7);

  const objectToAdd = {
    budgetDate,
    category,
    limit,
  };

  try {
    const updateResult = await User.updateOne(
      { email: req.userData.email }, // Find user by their unique email
      { $push: { budget: objectToAdd } } // Add the new budget object
    );

    // Check if the update operation was successful
    if (updateResult.matchedCount === 0) {
      return res.status(404).send({ message: "User not found." });
    }

    res
      .status(200)
      .send({ message: "Budget added successfully.", budget: objectToAdd });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Failed to add budget.", error: error.message });
  }
});

// Edit a specific budget by _id
router.put("/edit", async (req, res) => {
  let { budgetId, newBudget } = req.body;
  const userEmail = req.userData.email;
  if (!userEmail) {
    return res
      .status(404)
      .json({ success: false, message: "userEmail is null or undefined" });
  }

  // Validate input
  if (!budgetId || !newBudget || newBudget < 0) {
    return res.status(400).send({
      message:
        "Invalid input. Please provide a valid budgetId and newBudget data.",
    });
  }

  if (typeof budgetId !== "string") {
    try {
      budgetId = budgetId.toString();
    } catch (error) {
      return res
        .status(400)
        .send({ message: "Invalid BudgetId must be a String" });
    }
  }

  try {
    // const budgetObjectId = new mongoose.Types.ObjectId(parseInt(budgetId)); // Ensure budgetId is correctly formatted as ObjectId
    const updateResult = await User.updateOne(
      { email: userEmail }, // Find user by their unique email
      { $set: { "budget.$[elem].limit": newBudget } }, // Update the budget limit
      { arrayFilters: [{ "elem._id": budgetId }] } // Correctly instantiate ObjectId
    );

    if (updateResult.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User or budget item not found." });
    } else if (updateResult.modifiedCount === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Budget item was not updated." });
    }

    res
      .status(200)
      .json({ success: true, message: "Budget item updated successfully." });
  } catch (error) {
    console.error("Failed to edit budget item:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating budget item.",
    });
  }
});

module.exports = router;
