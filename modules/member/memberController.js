const service = require("./memberService");

const asyncHandler = require("../../utils/asyncHandler");


const addMember = asyncHandler(async (req, res) => {

  const member = await service.addMember(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(201).json({
    result: "success",
    message: "Member added successfully",
    data: member
  });

});


module.exports = {
    addMember
};