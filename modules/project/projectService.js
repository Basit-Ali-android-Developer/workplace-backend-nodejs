const Joi = require("joi");
const repository = require("./projectRepository");
const AppError = require("../../utils/AppError");



const createProject = async (userId, data) => {

  const schema = Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),
    start_date: Joi.date().required(),
    due_date: Joi.date().optional()
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ""),
      400
    );
  }

  if (value.due_date && value.due_date < value.start_date) {
    throw new AppError("Due date cannot be before start date", 400);
  }

  // 🔥 NEW UNIQUE CHECK
  const existingProject = await repository.findByNameAndOwner(
    value.name,
    userId
  );

  if (existingProject) {
    throw new AppError("Project name already exists", 409);
  }

  const project = await repository.createProject({
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





const updateProject = async (userId, projectId, data) => {

  const schema = Joi.object({
     name: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    priority: Joi.string()
      .valid("Low", "Medium", "High", "Critical")
      .required(),
    start_date: Joi.date().required(),
    due_date: Joi.date().optional()
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ""),
      400
    );
  }

  // 1. Check project exists
  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 2. Check ownership
  if (project.owner_id !== userId) {
    throw new AppError("Only Project Owner allowed to update", 403);
  }

  // 3. Duplicate name check (if name is being updated)
  if (value.name) {

    const existing = await repository.findByNameAndOwner(
      value.name,
      userId
    );

    if (existing && existing.id != projectId) {
      throw new AppError("Project name already exists", 409);
    }
  }

  // 4. Business validation
  if (value.due_date && value.start_date && value.due_date < value.start_date) {
    throw new AppError("Due date cannot be before start date", 400);
  }

  // 5. Update project
  const updatedProject = await repository.updateProject(
    projectId,
    value
  );

  return updatedProject;
};





const updateProjectStatus = async (userId, projectId, status) => {

  const schema = Joi.string()
    .valid("Active", "On Hold", "Completed", "Archived")
    .required();

  const { error } = schema.validate(status);

  if (error) {
    throw new AppError("Invalid status value", 400);
  }

  // 1. Check project exists
  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 2. Check ownership
  // if (Number(project.owner_id) !== Number(userId)) {
  //   throw new AppError("Not allowed to update this project", 403);
  // }

  // 3. Update status
  const updated = await repository.updateProjectStatus(
    projectId,
    status
  );

  return updated;
};



const deleteProject = async (userId, projectId) => {

  // 1. Check project exists
  const project = await repository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 2. Check ownership
  if (Number(project.owner_id) !== Number(userId)) {
    throw new AppError("Not allowed to delete this project", 403);
  }

  // 3. Update status
  const updated = await repository.deleteProject(projectId);

  return updated;

};







const getProjectById = async (userId, projectId) => {

  // 1. Validate id
  if (!projectId || isNaN(projectId)) {
    throw new AppError("Invalid project id", 400);
  }

  // 2. Get project
  const project = await repository.getProjectById(projectId);

  // 3. Check exists
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 4. Authorization
  // if (Number(project.owner_id) !== Number(userId)) {
  //   throw new AppError("Not allowed to access this project", 403);
  // }

  // 5. Get tasks
  const tasks = await repository.getTasksByProjectId(projectId);

  // 6. Return combined response
  return {
    ...project,
    tasks
  };
};


module.exports = {
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getProjectById
};