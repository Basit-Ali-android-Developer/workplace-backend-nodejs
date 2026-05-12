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



const updateProjectStatus = asyncHandler(async (req, res) => {

  const project = await service.updateProjectStatus(
    req.user.id,
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    result: "success",
    message: "Project status updated successfully",
    data: project
  });
});




const deleteProject = asyncHandler(async (req, res) => {

  await service.deleteProject(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Project deleted successfully",
    data: null
  });

});




const getProjectById = asyncHandler(async (req, res) => {

  const project = await service.getProjectById(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Project fetched successfully",
    data: project
  });

});



const getUsersProject = asyncHandler(async (req, res) => {

  const data = await service.getUsersProject(req.user.id);

  res.status(200).json({
    result: "success",
    message: "Dashboard fetched successfully",
    data
  });
});




module.exports = {
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectById,
  getUsersProject
};