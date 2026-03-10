const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Protect routes: requires valid JWT in Authorization header
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    const result = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
