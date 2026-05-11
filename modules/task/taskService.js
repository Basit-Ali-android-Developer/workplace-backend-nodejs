const Joi = require("joi");
const repository = require("./taskRepository");
const userRepository = require("../user/userRepository");
const AppError = require("../../utils/AppError");




const createTask = async (userId, data) => {

  const schema = Joi.object({
    project_id: Joi.number().integer().required(),
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),
    assigned_to: Joi.number().integer().required(),
    start_date: Joi.date().required(),
    due_date: Joi.date().required()
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ""),
      400
    );
  }

  const {
    project_id,
    title,
    description,
    priority,
    assigned_to,
    start_date,
    due_date
  } = value;


  if (new Date(due_date).getTime() < new Date(start_date).getTime()) {
    throw new AppError("Due date cannot be before start date", 400);
  }


  const project = await repository.getById(project_id);

  if (!project) {
    throw new AppError("Project not found", 404);
  }


  // if (Number(project.owner_id) !== Number(userId)) {
  //   throw new AppError("Not allowed to create task in this project", 403);
  // }


  const assignedUser = await userRepository.getUserById(assigned_to);

  if (!assignedUser) {
    throw new AppError("Assigned user not found", 404);
  }


  const nameExists = await repository.getTaskByTitleAndProject(project_id,title);

if (nameExists) {
  throw new AppError("Task already exists", 409);
}

  const task = await repository.createTask({
    project_id,
    title,
    description,
    priority,
    assigned_to,
    start_date,
    due_date,
    created_by: userId
  });

  return task;
};





const getTaskById = async (userId, taskId) => {

  // 1. Validate task id
  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required", 400);
  }

  // 2. Get task
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 3. Security check
  // Only project owner can access task
  // if (Number(task.owner_id) !== Number(userId)) {
  //   throw new AppError("Not allowed to access this task", 403);
  // }

  return task;
};




const getTasksByProject = async (userId,projectId) => {

 
  if (!projectId || isNaN(projectId)) {
    throw new AppError("Valid project id is required", 400);
  }


  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

 
  // if (Number(project.owner_id) !== Number(userId)) {
  //   throw new AppError(
  //     "Not allowed to access this project",
  //     403
  //   );
  // }

  // 4. Get tasks
  const tasks = await repository.getTasksByProject(projectId);

  return tasks;
};



const deleteTask = async (userId, taskId) => {


  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required", 400);
  }


  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }


  // if (Number(task.owner_id) !== Number(userId)) {
  //   throw new AppError(
  //     "Not allowed to delete this task",
  //     403
  //   );
  // }


  await repository.deleteTask(taskId);

  return true;
};




const startTask = async (userId, taskId) => {

  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required", 400);
  }

  // 1. Get task
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 2. Ownership check (project owner OR assigned user logic depending on your system)
  if (Number(task.assigned_to) !== Number(userId)) {
    throw new AppError("Not allowed to start this task", 403);
  }

  // 3. Prevent multiple timers
  if (task.is_timer_running) {
    throw new AppError("Task timer is already running", 400);
  }

  // 4. Update task (start timer)
  const updatedTask = await repository.startTask(taskId);

  // 5. Create time log session
  await repository.createTimeLog(taskId, userId);

  return updatedTask;
};




const stopTask = async (userId, taskId) => {

  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required", 400);
  }

  // 1. Get task
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 2. Check permission
  if (Number(task.assigned_to) !== Number(userId)) {
    throw new AppError("Not allowed to stop this task", 403);
  }

  // 3. Check if running
  if (!task.is_timer_running) {
    throw new AppError("Task timer is not running", 400);
  }

  // 4. Find active session
  const session = await repository.getActiveSession(taskId);

  if (!session) {
    throw new AppError("No active session found", 400);
  }

  // 5. Stop session + calculate time
  const updatedSession = await repository.stopTimeLog(session.id);

  // 6. Update task totals
  const updatedTask = await repository.stopTask(taskId, updatedSession.duration_minutes);

  return updatedTask;
};




const completeTask = async (userId, taskId) => {

  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required", 400);
  }

  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (Number(task.assigned_to) !== Number(userId)) {
    throw new AppError("Not allowed to complete this task", 403);
  }

  // 1. If running → stop first (IMPORTANT)
  if (task.is_timer_running) {

    const session = await repository.getActiveSession(taskId);

    if (session) {
      const updatedSession = await repository.stopTimeLog(session.id);

      await repository.stopTask(
        taskId,
        updatedSession.duration_minutes
      );
    }
  }

  // 2. Mark task completed
  const updatedTask = await repository.completeTask(taskId);

  return updatedTask;
};




module.exports = {
  createTask,
  getTaskById,
  getTasksByProject,
  deleteTask,

  startTask,
  stopTask,
  completeTask
};