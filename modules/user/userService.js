require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const repository = require('./userRepository');

const AppError = require('../../utils/AppError');
const uploadToCloudinary = require("../../utils/uploadToCloudinary");

const JWT_SECRET = process.env.JWT_SECRET;






const signup = async (data) => {

  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ''),
      400
    );
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


  const result = await uploadToCloudinary(file.buffer, "profile_images");

  // save URL in DB
  const updatedUser = await repository.updateProfileImage(
    userId,
    result.secure_url
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
   ...userWithoutSensitiveFields
  } = user;

  return userWithoutSensitiveFields;
};


module.exports = {
  signup,
  login,
  uploadProfileImage,
  getUser
};