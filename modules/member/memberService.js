const Joi = require("joi");
const repository = require("./memberRepository");
const memberCheck = require("../project/projectService");
const projectRepository = require("../project/projectRepository");
const userRepository = require("../user/userRepository");
const AppError = require("../../utils/AppError");
const projectAccess = require("../../utils/projectAccess");
const taskRepository = require("../task/taskRepository");





const addMember = async (currentUserId, projectId, data) => {

  // 1. Validate input
  const schema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid("admin", "member").default("member")
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  // 2. Check project exists
  const project = await projectRepository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 3. Check permission (owner/admin only)
  await projectAccess.checkProjectManagementAccess(projectId, currentUserId);

  // 4. Find user by email
  const user = await userRepository.getUserByEmail(value.email);

  if (!user) {
    throw new AppError("User not found with this email", 404);
  }

  // 5. Check already member
  const existing = await repository.getProjectMember(
    projectId,
    user.id
  );

  if (existing) {
    throw new AppError("User already a project member", 409);
  }

  // 6. Set permissions
  let canManage = false;
  let canAssign = false;

  if (value.role === "admin") {
    canManage = true;
    canAssign = true;
  }

  // 7. Insert into project_members
  const member = await repository.addProjectMember(
    projectId,
    user.id,          // IMPORTANT: resolved ID
    value.role,
    canAssign,
    canManage
  );

  return member;
};






const removeMember = async (currentUserId, projectId, userId) => {

  // 1. Check project
  const project = await projectRepository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 2. Only admin/owner can remove members
  await projectAccess.checkProjectManagementAccess(
    projectId,
    currentUserId
  );

  // 3. Check member exists
  const member = await repository.getProjectMember(projectId, userId);

  if (!member) {
    throw new AppError("User is not a project member", 404);
  }

  // 4. Prevent removing owner (important safety rule)
  if (project.owner_id === Number(userId)) {
    throw new AppError("Project owner cannot be removed",400);
  }

  // 5. Unassign all tasks of this user in this project
  await taskRepository.unassignTasksByUserAndProject(
    projectId,
    userId
  );

  // 6. Remove member
  await repository.removeProjectMember(projectId, userId);

  return { removedUserId: userId };
};




module.exports = {
    addMember,
    removeMember
};