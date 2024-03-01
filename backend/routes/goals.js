const express = require('express');
const router = express.Router();
const User = require('../model/userModel'); // Adjust the path as necessary

// Get all goals for the user
router.get('/', async (req, res) => {
    const userEmail = req.user.email;
    try {
        const user = await User.findOne({ email: userEmail }, 'goals');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.goals);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve goals", error: error.message });
    }
});

// add a new goal
router.post('/add', async (req, res) => {
    const { name, category, amount, amountSaved, monthlyPayment, setGoalDate } = req.body;

    // Validate input (basic validation)
    if (!name || !category || typeof amount !== 'number' || typeof amountSaved !== 'number' || typeof monthlyPayment !== 'number' || !setGoalDate) {
        return res.status(400).send({ message: 'Invalid input. Please provide all required goal details.' });
    }

    // Prepare the goal object
    const goal = {
        name,
        category,
        amount,
        amountSaved,
        monthlyPayment,
        setGoalDate: new Date(setGoalDate)
    };

    try {
        const userEmail = req.user.email;

        // Update the user document by pushing the new goal into the goals array
        const updateResult = await User.updateOne(
            { email: userEmail }, // Find user by their unique email
            { $push: { goals: goal } } // Add the new goal object
        );

        // Check if the update operation was successful
        if (updateResult.matchedCount === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        res.status(200).send({ message: 'Goal added successfully.', goal: goal });
    } catch (error) {
        console.error('Failed to add goal:', error);
        res.status(500).send({ message: 'Failed to add goal.', error: error.message });
    }
});

module.exports = router;
