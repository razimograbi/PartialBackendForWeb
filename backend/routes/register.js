const express = require('express');
const router = express.Router();
const User = require('../model/userModel'); // Ensure this path matches the location of your User model

router.post('/', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send('User already exists');
        }

        // Create a new user
        const user = new User({
            name,
            email,
            password, // In a real app, hash this password
        });

        await user.save();

        // Respond with the created user
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Error registering new user');
    }
});

module.exports = router;
