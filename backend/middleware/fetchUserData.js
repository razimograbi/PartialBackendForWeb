const User = require('../model/userModel');

const fetchUserData = async (req, res, next) => {
    // Check if the req.user object exists and has an email property
    if (!req.user || !req.user.email) {
        return res.status(400).send({ message: 'User information is missing from the request.' });
    }

    try {
        const user = await User.findOne({ email: req.user.email }).select('-password'); // without the password.

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        req.userData = user;

        next();
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send({ message: 'An error occurred while fetching user data.' });
    }
};

module.exports = fetchUserData;