const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your-very-secret-key-12345', {
        expiresIn: '7d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.register = async (req, res, next) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'employee',
            profile: req.body.profile || {},
            permissions: req.body.permissions || []
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // 1) Check if username and password exist
        if (!username || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide username and password'
            });
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ username }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect username or password'
            });
        }

        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
