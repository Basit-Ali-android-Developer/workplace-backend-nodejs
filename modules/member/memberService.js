const Joi = require("joi");
const repository = require("./memberRepository");
const memberCheck = require("../project/projectService");
const projectRepository = require("../project/projectRepository");
const userRepository = require("../user/userRepository");
const AppError = require("../../utils/AppError");





const addMember = async (currentUserId,projectId,data) => {

  // 1. Validate input
  const schema = Joi.object({
    user_id: Joi.number().integer().required(),
    role: Joi.string()
      .valid("admin", "member")
      .default("member")
  });

  const { error, value } = schema.validate(data);

  if (error) {
    throw new AppError(
      error.details[0].message.replace(/"/g, ""),
      400
    );
  }

  // 2. Check project exists
  const project = await projectRepository.getById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  // 3. Permission check (only owner/admin can add members)
  await memberCheck.checkProjectManagementAccess(projectId,currentUserId);

  // 4. Check user exists
  const user = await userRepository.getUserById(
    value.user_id
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 5. Check already a member
  const existing = await repository.getProjectMember(projectId,value.user_id);

  if (existing) {
    throw new AppError("User already a project member",409);
  }

  // 6. Set permissions based on role
  let canManage = false;
  let canAssign = false;

  if (value.role === "admin") {
    canManage = true;
    canAssign = true;
  }

  // 7. Insert member
  const member = await repository.addProjectMember(
    projectId,
    value.user_id,
    value.role,
    canAssign,
    canManage
  );

  return member;
};







module.exports = {
    addMember
};