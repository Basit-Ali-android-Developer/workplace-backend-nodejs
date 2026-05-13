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


const getUserByEmail = async (email) => {

  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE email = $1 AND is_deleted = false
    `,
    [email]
  );

  return result.rows[0];
};



const updateProfileImage = async (
  userId,
  imageUrl,
  publicId
) => {

  const result = await db.query(
    `
    UPDATE users
    SET
      profile_image = $1,
      profile_image_public_id = $2,
      updated_at = NOW()
    WHERE id = $3
    RETURNING id, profile_image, profile_image_public_id
    `,
    [imageUrl, publicId, userId]
  );

  return result.rows[0];
};



const updateProfile = async (userId, data) => {

  const result = await db.query(
    `
    UPDATE users
    SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      updated_at = NOW()
    WHERE id = $3
    RETURNING *
    `,
    [
      data.name,
      data.email,
      userId
    ]
  );

  return result.rows[0];
};




const saveResetToken = async (userId, token, expires) => {

  await db.query(
    `
    UPDATE users
    SET
      reset_password_token = $1,
      reset_password_expires = $2
    WHERE id = $3
    `,
    [token, expires, userId]
  );
};


const findByResetToken = async (token) => {

  const result = await db.query(
    `
    SELECT *
    FROM users
    WHERE reset_password_token = $1
    `,
    [token]
  );

  return result.rows[0];
};




const updatePassword = async (userId, password) => {

  await db.query(
    `
    UPDATE users
    SET
      password = $1,
      reset_password_token = NULL,
      reset_password_expires = NULL,
      updated_at = NOW()
    WHERE id = $2
    `,
    [password, userId]
  );
};

module.exports = {
  findByEmail,
  createUser,
  findByEmailExcludeUser,
  updateProfileImage,
  getUserById,
  updateProfile,
  
  saveResetToken,
  findByResetToken,
  updatePassword,
  getUserByEmail
};