/*
 * This file defines the User model using Mongoose for MongoDB interactions in a personal finance management application.
 * The User schema includes fields for storing user details (email, name, password), and nested structures for managing personal financial data such as income, expenses, goals, and budget.
 */

const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // Email is mandatory
    unique: true, // Ensure no duplicate emails exist in the database
    trim: true, // Remove whitespace from both ends of the email
    lowercase: true, // Convert email to lowercase
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  income: [
    {
      amount: { type: Number, default: 10000 }, // Default income value if not specified
      date: Date,
    },
  ],
  expenses: [
    {
      category: String,
      amount: Number, // Amount spent
      monthlyPayment: Number, // Monthly payment amount for recurring expenses
      startDate: Date, // Start date of the expense or recurring payment
      endDate: Date, // End date for calculating total duration of an expense or subscription
    },
  ],
  goals: [
    {
      name: String, // Name of the financial goal
      category: String, // Category/type of goal
      amount: Number,
      amountSaved: Number, // Amount currently saved towards the goal
      monthlyPayment: Number, // Expected monthly contribution towards the goal
      setGoalDate: Date, // Date when the goal was set
    },
  ],
  budget: [
    {
      budgetDate: {
        type: String,
        default: () => new Date().toISOString().slice(0, 7),
      }, // Default to current year and month (YYYY-MM)
      category: { type: String, required: true }, // Budget category, e.g., 'Food', 'Travel'
      limit: { type: Number, default: 500 }, // Default budget limit if not specified
    },
  ],
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
