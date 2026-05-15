const service = require("./taskService");

const asyncHandler = require("../../utils/asyncHandler");



const createTask = asyncHandler(async (req, res) => {

  const task = await service.createTask(
    req.user.id,
    req.body
  );

  res.status(200).json({
    result: "success",
    message: "Task created successfully",
    data: task
  });

});



const getTaskById = asyncHandler(async (req, res) => {

  const task = await service.getTaskById(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Task fetched successfully",
    data: task
  });

});



const getTasksByProject = asyncHandler(async (req, res) => {

  const tasks = await service.getTasksByProject(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Tasks fetched successfully",
    data: tasks
  });

});






const updateTask = asyncHandler(async (req, res) => {

  const task = await service.updateTask(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    result: "success",
    message: "Task updated successfully",
    data: task
  });
});




const deleteTask = asyncHandler(async (req, res) => {

  await service.deleteTask(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Task deleted successfully",
    data: null
  });

});




const startTask = asyncHandler(async (req, res) => {

  const task = await service.startTask(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Task started successfully",
    data: task
  });

});





const stopTask = asyncHandler(async (req, res) => {

  const task = await service.stopTask(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Task stopped successfully",
    data: task
  });

});




const completeTask = asyncHandler(async (req, res) => {

  const task = await service.completeTask(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    result: "success",
    message: "Task completed successfully",
    data: task
  });

});




const getMyActiveTasks = asyncHandler(async (req, res) => {

  const tasks = await service.getMyActiveTasks(req.user.id);

  res.status(200).json({
    result: "success",
    message: "Active tasks fetched successfully",
    data: tasks
  });

});



const getUnassignedTasks = asyncHandler(async (req, res) => {

  const tasks = await service.getUnassignedTasks(
    req.user.id,
    req.params.id // projectId
  );

  res.status(200).json({
    result: "success",
    message: "Unassigned tasks fetched successfully",
    data: tasks
  });
});




module.exports = {
  createTask,
  getTaskById,
  getTasksByProject,
  deleteTask,
  updateTask,

  startTask,
  stopTask,
  completeTask,

  getMyActiveTasks,
  getUnassignedTasks
};