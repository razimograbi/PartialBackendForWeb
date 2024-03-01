const express = require('express');
const router = express.Router();
const User = require('../model/userModel');

router.get('/', async (req, res) => {
    const {name, email, income, expenses, goals, budget} = req.userData;
    const responseData = {
        name: name,
        email: email,
        income: income,
        expenses:expenses,
        goals:goals,
        budget:budget,
    };
    res.json(responseData);
});

module.exports = router;