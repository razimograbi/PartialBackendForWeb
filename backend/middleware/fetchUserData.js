/*
 * Middleware to fetch user data from the database.
 * This file contains a middleware function `fetchUserData` that retrieves user details from the database using the email provided in the `req.user` object.
 * It ensures the user data is attached to the `req` object for use in subsequent middleware or route handlers, excluding sensitive data such as the password.
 */

const User = require("../model/userModel");

const fetchUserData = async (req, res, next) => {
  // Check if the req.user object exists and has an email property
  if (!req.user || !req.user.email) {
    return res
      .status(400)
      .send({ message: "User information is missing from the request." });
  }

  try {
    // Retrieve user from the database by email, not including the password from the result
    const user = await User.findOne({ email: req.user.email }).select(
      "-password"
    ); // without the password.

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    req.userData = user; // Attach user data to request object

    next(); // Proceed to next middleware
  } catch (error) {
    console.error("Error fetching user data:", error);
    res
      .status(500)
      .send({ message: "An error occurred while fetching user data." });
  }
};

module.exports = fetchUserData;
