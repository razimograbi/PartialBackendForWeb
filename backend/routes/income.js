const express = require("express");
const router = express.Router();
const User = require("../model/userModel");

router.get("/", async (req, res) => {
  const userEmail = req.user.email;
  try {
    const user = await User.findOne({ email: userEmail }, "income");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.income);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve incomes", error: error.message });
  }
});

router.post("/add", async (req, res) => {
  const { amount, date } = req.body;

  // Validate input (basic validation)
  if (!amount || typeof amount !== "number") {
    return res.status(400).send({
      message:
        "Invalid input. Please provide all required income details. the amount must be a number",
    });
  }

  // Prepare the income object
  const incomeEntry = {
    amount,
    date: date ? new Date(date) : new Date(), // Use current date if none provided
  };

  try {
    const userEmail = req.user.email;

    // Update the user document by pushing the new income entry into the income array
    const updateResult = await User.updateOne(
      { email: userEmail }, // Find user by their unique email
      { $push: { income: incomeEntry } } // Add the new income entry
    );

    // Check if the update operation was successful
    if (updateResult.matchedCount === 0) {
      return res.status(404).send({ message: "User not found." });
    }

    res
      .status(200)
      .send({ message: "Income added successfully.", income: incomeEntry });
  } catch (error) {
    console.error("Failed to add income:", error);
    res
      .status(500)
      .send({ message: "Failed to add income.", error: error.message });
  }
});



router.post("/add2", async (req, res) => {
  const { amount, month, year } = req.body;

  // Validate input (basic validation)
  if (!amount || typeof amount !== "number" || !month || !year) {
    return res.status(400).send({
      message:
        "Invalid input. Please provide all required income details: amount (number), month, and year.",
    });
  }

  // Prepare the income object
  const incomeEntry = {
    amount,
    // Constructing the date on the server side
    date: new Date(`${year}-${month}-01`),
  };

  try {
    const userEmail = req.user.email;

    // Check if an income entry exists for the provided month and year
    const existingIncomeIndex = await User.findOne({
      email: userEmail,
      "income.date": {
        $gte: new Date(incomeEntry.date.getFullYear(), incomeEntry.date.getMonth(), 1),
        $lt: new Date(incomeEntry.date.getFullYear(), incomeEntry.date.getMonth() + 1, 1),
      },
    }).select("income");

    if (existingIncomeIndex) {
      const existingIncome = existingIncomeIndex.income.find((entry) => {
        return (
          entry.date.getFullYear() === incomeEntry.date.getFullYear() &&
          entry.date.getMonth() === incomeEntry.date.getMonth()
        );
      });

      if (existingIncome) {
        // Override existing income entry
        const updateResult = await User.updateOne(
          {
            email: userEmail,
            "income.date": existingIncome.date,
          },
          {
            $set: { "income.$.amount": amount },
          }
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).send({ message: "User not found." });
        }

        res.status(200).send({ message: "Income updated successfully.", income: incomeEntry });
      } else {
        // Add new income entry
        const updateResult = await User.updateOne(
          { email: userEmail }, // Find user by their unique email
          { $push: { income: incomeEntry } } // Add the new income entry
        );

        if (updateResult.matchedCount === 0) {
          return res.status(404).send({ message: "User not found." });
        }

        res.status(200).send({ message: "Income added successfully.", income: incomeEntry });
      }
    } else {
      // Add new income entry
      const updateResult = await User.updateOne(
        { email: userEmail }, // Find user by their unique email
        { $push: { income: incomeEntry } } // Add the new income entry
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).send({ message: "User not found." });
      }

      res.status(200).send({ message: "Income added successfully.", income: incomeEntry });
    }
  } catch (error) {
    console.error("Failed to add/update income:", error);
    res.status(500).send({ message: "Failed to add/update income.", error: error.message });
  }
});


module.exports = router;
