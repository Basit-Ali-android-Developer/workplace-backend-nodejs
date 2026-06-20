require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const repository = require('./userRepository');

const AppError = require('../../utils/AppError');
const uploadToCloudinary = require("../../utils/uploadToCloudinary");
const cloudinary = require("../../utils/cloudinary");

const JWT_SECRET = process.env.JWT_SECRET;

const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");






const signup = async (data) => {

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(error.details[0].message.replace(/"/g, ''),400);
  }

  
  const existingUser = await repository.findByEmail(value.email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }


  const hashedPassword = await bcrypt.hash(value.password, 10);


  const user = await repository.createUser({
    ...value,
    password: hashedPassword,
    is_deleted: false
  });

  return user;
};





const login = async (data) => {

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ''),
      400
    );
  }

  const { email, password } = value;

  // FIND USER
  const user = await repository.findByEmail(email);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // CHECK PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  // GENERATE TOKEN
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      userType: user.user_type
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // SAFE USER RESPONSE
  const responseUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    user_type: user.user_type,
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  return {
    user: responseUser,
    token
  };
};




const uploadProfileImage = async (userId, file) => {

  if (!file) {
    throw new AppError("Image is required", 400);
  }

  // GET USER
  const user = await repository.getUserById(userId);

  // DELETE OLD IMAGE IF EXISTS
  if (user.profile_image_public_id) {

    await cloudinary.uploader.destroy(
      user.profile_image_public_id
    );
  }

  // UPLOAD NEW IMAGE
  const result = await uploadToCloudinary(
    file.buffer,
    "profile_images"
  );

  // SAVE NEW IMAGE + PUBLIC ID
  const updatedUser = await repository.updateProfileImage(
    userId,
    result.secure_url,
    result.public_id
  );

  return {
    profile_image: updatedUser.profile_image
  };
};



// const getUser = async (userId) => {

//   const user = await repository.getUserById(userId);

//   return user;
// };



const getUser = async (userId) => {

  const user = await repository.getUserById(userId);

  const {
   password,
   user_type,
   created_at,
   updated_at,
   deleted_at,
   is_deleted,
   profile_image_public_id,
   ...userWithoutSensitiveFields
  } = user;

  return userWithoutSensitiveFields;
};



const updateProfile = async (userId, data) => {

  const schema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(error.details[0].message.replace(/"/g, ''),400);
  }

  if (value.email) {

    const existingUser = await repository.findByEmailExcludeUser(value.email,userId);

    if (existingUser) {
      throw new AppError("Email already exists",409);
    }
  }

  const updatedUser = await repository.updateProfile(userId,value);

  // REMOVE SENSITIVE FIELDS
  const {
    password,
    user_type,
    deleted_at,
    is_deleted,
    profile_image_public_id,
    ...safeUser
  } = updatedUser;

  return safeUser;
};







const forgotPassword = async (email) => {

  const user = await repository.findByEmail(email);

  if (!user) {
    return; 
  }

  // 1. Generate token
  const token = crypto.randomBytes(32).toString("hex");

  // 2. Set expiry (10 minutes)
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  // 3. Save in DB
  await repository.saveResetToken(user.id, token, expires);

  // 4. Create reset link
  const resetLink = `${process.env.FRONTEND_URL}/resetPassword?token=${token}`;

  // 5. Send email
  await sendEmail(
    user.email,
    "Reset Password",
    `
      <p>Click below to reset your password</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 10 minutes</p>
    `
  );
};





const resetPassword = async (data) => {

  const { token, password } = data;

  const user = await repository.findByResetToken(token);

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  if (new Date() > user.reset_password_expires) {
    throw new AppError("Token expired", 400);
  }

  // hash new password
  const hashed = await bcrypt.hash(password, 10);

  // update password + clear token
  await repository.updatePassword(user.id, hashed);
};



module.exports = {
  signup,
  login,
  uploadProfileImage,
  getUser,
  updateProfile,

  forgotPassword,
  resetPassword
};