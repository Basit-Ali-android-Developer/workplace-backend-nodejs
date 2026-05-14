const Joi = require("joi");
const repository = require("./taskRepository");
const userRepository = require("../user/userRepository");
const AppError = require("../../utils/AppError");
const {
  checkProjectManagementAccess,
  checkProjectViewAccess
} = require("../../utils/projectAccess");

const projectRepository = require("../project/projectRepository");




const createTask = async (userId, data) => {

  const schema = Joi.object({
    project_id: Joi.number().integer().required(),
    title: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),

    assigned_to: Joi.number().integer().optional().allow(null),

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

  // 1. Date validation
  if (new Date(due_date) < new Date(start_date)) {
    throw new AppError("Due date cannot be before start date", 400);
  }

  // 2. Check project exists
  const project = await repository.getById(project_id);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 3. CHECK PERMISSION (IMPORTANT)
  const member = await checkProjectManagementAccess(project_id,userId);

  // 4. Check duplicate task title in project
  const exists = await repository.getTaskByTitleAndProject(
    project_id,
    title
  );

  if (exists) {
    throw new AppError("Task already exists in this project", 409);
  }

  // 5. If assigned user is provided → validate membership
  if (assigned_to) {

    const assignedMember = await projectRepository.getProjectMember(project_id,assigned_to);

    if (!assignedMember) {
      throw new AppError("Assigned user is not a project member",400);
    }
  }

  // 6. Create task
  const task = await repository.createTask({
    project_id,
    title,
    description,
    priority,
    assigned_to: assigned_to || null,
    start_date,
    due_date,
    created_by: userId
  });

  return task;
};




const updateTask = async (userId, taskId, data) => {

  // 1. Validate input
  const schema = Joi.object({
    title: Joi.string().trim().required(),

    description: Joi.string().trim().required(),

    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),

    assigned_to: Joi.number().integer().optional().allow(null),
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
    title,
    description,
    priority,
    assigned_to,
    start_date,
    due_date
  } = value;

  // 2. Due date validation
  if (new Date(due_date).getTime() < new Date(start_date).getTime()) {
    throw new AppError("Due date cannot be before start date",400);
  }

  // 3. Check task exists
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 4. Get project id from task
  const projectId = task.project_id;

  // 5. Only owner/admin can update task
  await checkProjectManagementAccess(projectId,userId);

  // 6. Check assigned user exists (if provided)
  if (assigned_to) {

    const assignedUser = await userRepository.getUserById(assigned_to);

    if (!assignedUser) {
      throw new AppError("Assigned user not found",404);
    }

    // 7. Assigned user must be project member
    const member = await projectRepository.getProjectMember(projectId,assigned_to);

    if (!member) {
      throw new AppError("Assigned user is not a project member",403);
    }
  }

  // 8. Check duplicate task title
  const existingTask = await repository.getTaskByTitleAndProject(projectId,title);

  if (existingTask && existingTask.id !== Number(taskId)) {
    throw new AppError("Task already exists",409);
  }

  // 9. Update task
  const updatedTask = await repository.updateTask(taskId,
      {
        title,
        description,
        priority,
        assigned_to,
        start_date,
        due_date
      }
    );

  return updatedTask;
};






const getTaskById = async (userId,taskId) => {

  // 1. Validate task id
  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required",400);
  }

  // 2. Get task
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found",404);
  }

  // 3. Check project access
  await checkProjectViewAccess(task.project_id,userId);

  // 4. Return task
  return task;
};



const getTasksByProject = async (userId,projectId) => {

  // 1. Validate project id
  if (!projectId || isNaN(projectId)) {
    throw new AppError("Valid project id is required",400);
  }

  // 2. Check project exists
  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found",404);
  }

  // 3. Allow all project members to view
  await checkProjectViewAccess(projectId,userId);

  // 4. Get tasks
  const tasks = await repository.getTasksByProject( projectId);

  return tasks;
};



const deleteTask = async (userId,taskId) => {

  // 1. Validate task id
  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required",400);
  }

  // 2. Get task
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found",404);
  }

  // 3. Only project owner/admin can delete
  await checkProjectManagementAccess(task.project_id,userId);

  // 4. Delete task
  await repository.deleteTask(taskId);

  return true;
};




const startTask = async (userId, taskId) => {

  // 1. Validate task id
  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required", 400);
  }

  // 2. Get task
  const task = await repository.getTaskById(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 3. Get project (IMPORTANT FIX)
  const project = await projectRepository.getById(task.project_id);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 4. Block if project is deleted or completed
  if (project.is_deleted) {
    throw new AppError("Project is deleted", 400);
  }

  if (project.status === "Completed") {
    throw new AppError("Project is completed", 400);
  }

  // 5. Ensure task is assigned
  if (!task.assigned_to) {
    throw new AppError(
      "Task is not assigned to anyone",
      400
    );
  }

  // 6. ONLY assigned user can start
  if (Number(task.assigned_to) !== Number(userId)) {
    throw new AppError(
      "Only assigned user can start this task",
      403
    );
  }

  // 7. Prevent multiple running timers
  if (task.is_timer_running) {
    throw new AppError(
      "Task timer is already running",
      400
    );
  }

  // 8. Prevent starting completed task
  if (task.status === "Completed") {
    throw new AppError(
      "Cannot start a completed task",
      400
    );
  }

  // 9. Start task
  const updatedTask = await repository.startTask(taskId);

  // 10. Create time log session
  await repository.createTimeLog(
    taskId,
    userId
  );

  return updatedTask;
};




const stopTask = async (userId, taskId) => {

  // 1. Validate task id
  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required",400);
  }


  const task = await repository.getTaskByIdForTimer(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 3. Ensure task assigned
  // if (!task.assigned_to) {
  //   throw new AppError("Task is not assigned to anyone",400);
  // }

  // 4. ONLY assigned user can stop timer
  if (Number(task.assigned_to) !== Number(userId)) {
    throw new AppError("Only assigned user can stop this task",403);
  }

  // 5. Timer must be running
  if (!task.is_timer_running) {
    throw new AppError("Task timer is not running",400);
  }

  // 6. Get active session
  const session = await repository.getActiveSession(taskId);

  if (!session) {
    throw new AppError("No active session found",400);
  }

  // 7. Stop time log session
  const updatedSession = await repository.stopTimeLog(session.id);

  // 8. Update task totals
  const updatedTask = await repository.stopTask(
      taskId,
      updatedSession.duration_minutes
    );

  return updatedTask;
};




const completeTask = async (userId, taskId) => {

  // 1. Validate task id
  if (!taskId || isNaN(taskId)) {
    throw new AppError("Valid task id is required",400);
  }

  // 2. Get task
  // IMPORTANT:
  // Do NOT filter soft deleted tasks
  // because completion is a cleanup/finalization action
  const task = await repository.getTaskByIdForTimer(taskId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  // 3. Ensure assigned
  if (!task.assigned_to) {
    throw new AppError("Task is not assigned to anyone",400);
  }

  // 4. ONLY assigned user can complete
  if (Number(task.assigned_to) !== Number(userId)) {
    throw new AppError("Only assigned user can complete this task",403);
  }

  // 5. Prevent duplicate completion
  if (task.status === "Completed") {
    throw new AppError("Task already completed",400);
  }

  // 6. If timer running → stop first
  if (task.is_timer_running) {

    const session = await repository.getActiveSession(taskId);

    if (!session) {
      throw new AppError("No active session found",400);
    }

    // Stop session
    const updatedSession = await repository.stopTimeLog(session.id);

    // Update task time totals
    await repository.stopTask(
      taskId,
      updatedSession.duration_minutes
    );
  }

  // 7. Complete task
  const updatedTask = await repository.completeTask(taskId);

  return updatedTask;
};


const getMyActiveTasks = async (userId) => {

  const tasks = await repository.getActiveTasksByUser(userId);

  return tasks;
};



module.exports = {
  createTask,
  getTaskById,
  getTasksByProject,
  deleteTask,
  updateTask,

  startTask,
  stopTask,
  completeTask,

  getMyActiveTasks
};