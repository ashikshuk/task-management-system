const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const SALT_ROUNDS = 10;

const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0] || null;
};

const createUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('User with this email already exists');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email.toLowerCase(), passwordHash]
  );

  return result.rows[0];
};

const authenticateUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at
  };
};

module.exports = {
  createUser,
  authenticateUser
};
