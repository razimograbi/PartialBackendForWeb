const jwt = require("jsonwebtoken");

const cookieJwtAuth = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // Extract the token from the header
  }

  if (!token) {
    return res.status(401).send("Access Denied: No token provided.");
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Add the decoded user payload to the request object
    next();
  } catch (error) {
    // Optionally handle token clear or redirect if necessary
    // For API responses, consider sending a JSON response
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = cookieJwtAuth;
