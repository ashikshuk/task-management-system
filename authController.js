const { validationResult } = require('express-validator');
const { createUser, authenticateUser } = require('../services/authService');
const generateToken = require('../utils/generateToken');

const handleValidation = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    err.details = errors.array();
    throw err;
  }
};

const signup = async (req, res, next) => {
  try {
    handleValidation(req);

    const { name, email, password } = req.body;
    const user = await createUser({ name, email, password });
    const token = generateToken(user.id);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    handleValidation(req);

    const { email, password } = req.body;
    const user = await authenticateUser({ email, password });
    const token = generateToken(user.id);

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  signup,
  login
};
