require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('./userRepository');
const Joi = require('joi');

const JWT_SECRET = process.env.JWT_SECRET;

const AppError = require('../../utils/AppError');








const signup = async (data) => {

  
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error, value } = schema.validate(data);


   if (error) {
    throw new AppError(error.details[0].message.replace(/"/g, ''), 400);
  }


  // check user
  const existingUser = await userRepository.findByEmail(value.email);


  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(value.password, 10);


  // create user
  const user = await userRepository.createUser({
    ...value,
    password: hashedPassword,
    isDeleted: 0
  });

  return user;
};




const login = async (email, password) => {

  const user = await userRepository.findByEmail(email);

  // 1. check user exists
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // 2. check password safely
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  return user;
};



module.exports = { signup , login};