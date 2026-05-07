const db = require("../../db/connection");

// FIND USER
const findByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1 AND is_deleted = false',
    [email]
  );

  return result.rows[0];
};

// CREATE USER
const createUser = async (user) => {
  const result = await db.query(
    `INSERT INTO users 
    (name, email, password, user_type,  is_deleted, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5,  NOW(), NOW())
    RETURNING *`,
    [
      user.name,
      user.email,
      user.password,
      user.user_type || "User",
      user.isDeleted || false
    ]
  );

  return result.rows[0];
};

// GET USER BY ID
const getFullUserById = async (userId) => {
  const result = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  findByEmail,
  createUser,
  getFullUserById
};