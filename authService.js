const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const SALT_ROUNDS = 12; // bumped from 10 - stronger against modern hardware

// A valid bcrypt hash with no matching plaintext password - used to keep
// response timing constant whether or not the email exists (prevents
// user-enumeration via timing attacks on login).
const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO3XvJdEo4TG6qWZ4wtLh3sc.a9UDs7Sm';

const findUserByEmail = async (email) => {
  const result = await query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows[0] || null;
};

const createUser = async ({ name, email, password }) => {
  // Fast-path existence check for a friendlier error in the common case.
  // NOT sufficient on its own to prevent duplicates under concurrent requests -
  // the real guarantee comes from the UNIQUE constraint on users.email,
  // enforced below by catching the DB error.
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('User with this email already exists');
    err.statusCode = 409; // Conflict, not Bad Request
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email.toLowerCase(), passwordHash]
    );
    return result.rows[0];
  } catch (err) {
    // 23505 = unique_violation in Postgres. Requires:
    //   ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    if (err.code === '23505') {
      const e = new Error('User with this email already exists');
      e.statusCode = 409;
      throw e;
    }
    throw err;
  }
};

const authenticateUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  // Always run bcrypt.compare, even when no user was found, so response
  // timing doesn't reveal whether the email is registered.
  const hashToCheck = user ? user.password_hash : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCheck);

  if (!user || !isMatch) {
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
