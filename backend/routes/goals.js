const express = require("express");
const router = express.Router();
const User = require("../model/userModel"); // Adjust the path as necessary

function getRandomDateInRange() {
  const startDate = new Date("2025-09-25").getTime(); // Start date
  const endDate = new Date("2030-09-25").getTime(); // End date
  // Calculate a random date within the range
  const randomTime = startDate + Math.random() * (endDate - startDate);
  const randomDate = new Date(randomTime);

  return randomDate;
}

// Get all goals for the user
router.get("/", async (req, res) => {
  const userEmail = req.user.email;
  try {
    const user = await User.findOne({ email: userEmail }, "goals");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.goals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve goals", error: error.message });
  }
});


// add a new goal
router.post("/add", async (req, res) => {
  let { name, category, amount, amountSaved, monthlyPayment, setGoalDate } =
    req.body;

  // Validate input (basic validation)
  if (!name || typeof amount !== "number") {
    return res.status(400).send({
      message: "Invalid input. Please provide all required goal details.",
    });
  }

  if (!category || typeof category !== "string") {
    category = "other";
  }

  if (!amountSaved || typeof amountSaved !== "number") {
    amountSaved = 0;
  }

  if (!monthlyPayment || typeof monthlyPayment !== "number") {
    monthlyPayment = Math.floor(200 + Math.random() * 800);
  }

  if (!setGoalDate) {
    setGoalDate = getRandomDateInRange();
  }

  // Prepare the goal object
  const goal = {
    name,
    category,
    amount,
    amountSaved,
    monthlyPayment,
    setGoalDate: new Date(setGoalDate),
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
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send({ message: "Goal added successfully.", goal: goal });
  } catch (error) {
    console.error("Failed to add goal:", error);
    res
      .status(500)
      .send({ message: "Failed to add goal.", error: error.message });
  }
});

// a method to delete a goal

router.delete("/delete/:goalId", async (req, res) => {
  const goalId = req.params.goalId;
  const userEmail = req.user.email;

  if (!userEmail || !goalId) {
    return res
      .status(404)
      .send({
        message:
          "Please add pass the value of the goalId to the http request, example : https:.../delete/12354  .",
      });
  }

  try {
    const updateResult = await User.updateOne(
      { email: userEmail }, // Find user by their unique email
      { $pull: { goals: { _id: goalId } } } // Remove the goal object
    );

    // Check if the update operation found and updated the user
    if (updateResult.matchedCount === 0) {
      return res.status(404).send({ message: "User not found." });
    }

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .send({ message: "Goal not found or already removed." });
    }

    res.status(200).send({ message: "Goal deleted successfully." });
  } catch (error) {
    console.error("Failed to delete goal:", error);
    res
      .status(500)
      .send({ message: "Failed to delete goal.", error: error.message });
  }
});

//Adan trying 
// Add amount to savings for a specific goal
router.put('/addAmountToGoal', async (req, res) => {
  //const goalId = req.params.goalId;
  const userEmail = req.user.email;
  const { goalId, amount } = req.body;

  if (!userEmail || !goalId || !amount || typeof amount !== "number") {
    return res.status(400).send({
      message: "Please provide a valid goalId and amount.",
      message: userEmail , goalId , amount, 
    });
  }

  try {
    const updateResult = await User.updateOne(
      { email: userEmail, "goals._id": goalId },
      { $inc: { "goals.$.amountSaved": amount } }
    );

    // Check if the update operation found and updated the user
    if (updateResult.matchedCount === 0) {
      return res.status(404).send({ message: "User or Goal not found." });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(404).send({
        message: "Goal not found or already removed.",
      });
    }

    res.status(200).send({ message: "Amount saved for the goal updated successfully." });
  } catch (error) {
    console.error("Failed to update amount saved for goal:", error);
    res
      .status(500)
      .send({ message: "Failed to update amount saved for goal.", error: error.message });
  }
});


module.exports = router;
