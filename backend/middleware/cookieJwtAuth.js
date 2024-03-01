const jwt = require('jsonwebtoken');

const cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send('Access Denied: No token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // Add the decoded user payload to the request object
        next();
    } catch (error) {
        res.clearCookie("token");
        res.redirect("/login");
    }
};

module.exports = cookieJwtAuth;
