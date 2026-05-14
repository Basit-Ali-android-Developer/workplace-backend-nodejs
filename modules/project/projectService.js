const Joi = require("joi");

const repository = require("./projectRepository");

const AppError = require("../../utils/AppError");

const {
  checkProjectManagementAccess,
  checkProjectViewAccess
} = require("../../utils/projectAccess");







const createProject = async (userId, data) => {

  const schema = Joi.object({
    name: Joi.string().trim().required(),

    description: Joi.string().trim().required(),

    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),

    start_date: Joi.date().required(),

    due_date: Joi.date().allow(null)
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ""),
      400
    );
  }

  if (
    value.due_date &&
    value.due_date < value.start_date
  ) {
    throw new AppError(
      "Due date cannot be before start date",
      400
    );
  }

  const existingProject =
    await repository.findByNameAndOwner(
      value.name,
      userId
    );

  if (existingProject) {
    throw new AppError(
      "Project name already exists",
      409
    );
  }

  const project =
    await repository.createProjectWithOwner({
      name: value.name,
      description: value.description,
      owner_id: userId,
      status: "Active",
      priority: value.priority,
      start_date: value.start_date,
      due_date: value.due_date || null
    });

  return project;
};







const getProjectMembers = async (userId, projectId) => {

  if (!projectId || isNaN(projectId)) {
    throw new AppError("Invalid project id", 400);
  }

  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found",404);
  }


  // 1. Check project exists + user access
  await checkProjectViewAccess(projectId, userId);

  // 2. Fetch members
  const members = await repository.getProjectMembers(projectId);

  return members;
};






const updateProject = async (userId,projectId,data) => {

  const schema = Joi.object({
    name: Joi.string().trim().required(),

    description: Joi.string().trim().required(),

    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),

    start_date: Joi.date().required(),

    due_date: Joi.date().allow(null)
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ""),
      400
    );
  }

  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found",404);
  }

  await checkProjectManagementAccess(projectId,userId);

  if (
    value.due_date &&
    value.due_date < value.start_date
  ) {
    throw new AppError(
      "Due date cannot be before start date",
      400
    );
  }

  const existing =
    await repository.findDuplicateProjectName(
      value.name,
      userId,
      projectId
    );

  if (existing) {
    throw new AppError(
      "Project name already exists",
      409
    );
  }

  const updatedProject =
    await repository.updateProject(
      projectId,
      value
    );

  return updatedProject;
};









const updateProjectStatus = async (
  userId,
  projectId,
  status
) => {

  // 1. Validate status
  const allowedStatuses = [
    "Active",
    "On Hold",
    "Completed",
    "Archived"
  ];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid status value", 400);
  }

  // 2. Check project exists
  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 3. Permission check
  await checkProjectManagementAccess(
    projectId,
    userId
  );

  // 4. Normalize status (important for DB safety)
  const normalizedStatus = String(status);

  // 5. Update
  const updated =
    await repository.updateProjectStatus(
      projectId,
      normalizedStatus
    );

  return updated;
};









const deleteProject = async (userId,projectId) => {

  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found",404);
  }

  await checkProjectManagementAccess(projectId,userId);

  await repository.deleteProject(projectId);

  return;
};









const getProjectById = async (userId,projectId) => {

  if (!projectId || isNaN(projectId)) {
    throw new AppError("Invalid project id",400);
  }

  const project = await repository.getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found",404);
  }

  await checkProjectViewAccess(projectId,userId);

  const members = await repository.getProjectMembers(projectId);

  const tasks = await repository.getTasksByProjectId(projectId);

  return {
    ...project,
    members,
    tasks
  };
};









const getUsersProject = async (userId) => {

  const projects = await repository.getUserProjects(userId);

  for (const project of projects) {

    const [members, tasks] =
      await Promise.all([
        repository.getProjectMembers(project.id),
        repository.getTasksByProjectId(project.id)
      ]);

    project.members = members;
    project.tasks = tasks;
  }

  return projects;
};









module.exports = {
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectById,
  getUsersProject,
  getProjectMembers
};