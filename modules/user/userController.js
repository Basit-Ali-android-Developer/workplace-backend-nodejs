const userService = require('./userService');
const asyncHandler = require('../../utils/asyncHandler');





const signup = asyncHandler(async (req, res) => {

  await userService.signup(req.body);

  res.status(200).json({
    result: "success",
    message: "Account created successfully",
    data: null
  });

});



const login = asyncHandler(async (req, res) => {

  const result = await userService.login(req.body);

  res.status(200).json({
    result: "success",
    message: "Login successful",
    data: result
  });

});





module.exports = { signup,login };