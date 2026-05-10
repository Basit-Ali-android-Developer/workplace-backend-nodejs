const service = require("./projectService");

const asyncHandler = require("../../utils/asyncHandler");



const createProject = asyncHandler(async (req, res) => {

  const project = await service.createProject(
    req.user.id,
    req.body
  );

  res.status(201).json({
    result: "success",
    message: "Project created successfully",
    data: project
  });
});



const updateProject = asyncHandler(async (req, res) => {

  const project = await service.updateProject(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    result: "success",
    message: "Project updated successfully",
    data: project
  });
});



module.exports = {
  createProject,
  updateProject
};