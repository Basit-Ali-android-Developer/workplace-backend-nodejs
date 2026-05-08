const service = require('./userService');
const asyncHandler = require('../../utils/asyncHandler');





const signup = asyncHandler(async (req, res) => {

  await service.signup(req.body);

  res.status(201).json({
    result: "success",
    message: "Account created successfully",
    data: null
  });

});





const login = asyncHandler(async (req, res) => {

  const result = await service.login(req.body);

  res.status(200).json({
    result: "success",
    message: "Login successful",
    data: result
  });

});





const uploadProfileImage = asyncHandler(async (req, res) => {
  const result = await service.uploadProfileImage(
    req.user.id,
    req.file
  );

  res.status(200).json({
    result: "success",
    message: "Image uploaded successfully",
    data: result
  });
});




const getUser = asyncHandler(async (req, res) => {

  const user = await service.getUser(req.user.id);

  res.status(200).json({
    result: "success",
    message: "User fetched successfully",
    data: user
  });

});



module.exports = {
  signup,
  login,
  uploadProfileImage,
  getUser
};