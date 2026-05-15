const service = require("./memberService");

const asyncHandler = require("../../utils/asyncHandler");


const addMember = asyncHandler(async (req, res) => {

  const member = await service.addMember(
    req.user.id,        // logged-in user
    req.params.id,      // projectId
    req.body            // email + role
  );

  res.status(201).json({
    result: "success",
    message: "Member added successfully",
    data: member
  });
});




const removeMember = asyncHandler(async (req, res) => {

  const result = await service.removeMember(
    req.user.id,
    req.params.id,   // projectId
    req.body.user_id // user to remove
  );

  res.status(200).json({
    result: "success",
    message: "Member removed successfully",
    data: result
  });
});

module.exports = {
    addMember,
    removeMember
};