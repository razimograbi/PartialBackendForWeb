const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
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
    income: [{
        amount: { type: Number, default: 10000 }, // Default set as specified
        date: Date,
    }],
    expenses: [{
        category: String, 
        amount: Number,
        monthlyPayment: Number, // Relevant for loans and subscriptions
        startDate: Date, // The date the expense was made or the loan/subscription started
        endDate: Date, // Calculated for loans/expected end for subscriptions
    }],
    goals: [{
        name: String,
        category: String,
        amount: Number,
        amountSaved: Number,
        monthlyPayment: Number,
        setGoalDate: Date,
    }],
    budget: [{
        budgetDate: { type: String, default: () => new Date().toISOString().slice(0,7) }, // Default to current "YYYY-MM"
        category: { type: String, required: true },
        limit: { type: Number, default: 500 }, 
    }]
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
