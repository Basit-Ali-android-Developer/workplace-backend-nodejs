const db = require('../../db/connection');





const findByEmail = async (email) => {

  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    AND is_deleted = false
    `,
    [email]
  );

  return result.rows[0];
};






const createUser = async (user) => {

  const result = await db.query(
    `
    INSERT INTO users
    (
      name,
      email,
      password,
      user_type,
      is_deleted,
      created_at,
      updated_at
    )
    VALUES
    (
      $1, $2, $3, $4, $5,
      NOW(), NOW()
    )
    RETURNING *
    `,
    [
      user.name,
      user.email,
      user.password,
      'User',
      user.is_deleted
    ]
  );

  return result.rows[0];
};








// FIND BY EMAIL EXCLUDING USER
const findByEmailExcludeUser = async (email, userId) => {

  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    AND id != $2
    `,
    [email, userId]
  );

  return result.rows[0];
};



const getUserById = async (id) => {

  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE id = $1 AND is_deleted = false
    `,
    [id]
  );

  return result.rows[0];
};



const updateProfileImage = async (userId, imageUrl) => {

  const result = await db.query(
    `
    UPDATE users
    SET profile_image = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, profile_image
    `,
    [imageUrl, userId]
  );

  return result.rows[0];
};






module.exports = {
  findByEmail,
  createUser,
  findByEmailExcludeUser,
  updateProfileImage,
  getUserById
};