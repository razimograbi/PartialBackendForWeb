/*
 * Middleware to authenticate requests using JWT tokens stored in cookies.
 * This file includes a function that checks for a JWT in the Authorization header of the request.
 * If the token is valid, the user's information is decoded and attached to the request object, allowing subsequent middleware or route handlers to access user details.
 * If no token is found, or if the token is invalid or expired, the request is denied and an appropriate error message is returned.
 */

const jwt = require("jsonwebtoken");

const cookieJwtAuth = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Extract the JWT from the Authorization header
  }

  if (!token) {
    return res.status(401).send("Access Denied: No token provided."); // Return error if no token is found
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Verify the token using the secret key
    req.user = decoded; // Add the decoded user payload to the request object
    next(); // Continue to the next middleware if the token is valid
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = cookieJwtAuth;
