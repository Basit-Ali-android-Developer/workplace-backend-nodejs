const repository = require("../modules/project/projectRepository");
const AppError = require("./AppError");


const checkProjectManagementAccess = async (projectId, userId) => {

  const member = await repository.getProjectMember(
    projectId,
    userId
  );

  if (!member) {
    throw new AppError("Project access denied", 403);
  }

  if (
    member.role !== "owner" &&
    member.can_manage_project !== true
  ) {
    throw new AppError(
      "Not allowed to manage this project",
      403
    );
  }

  return member;
};



const checkProjectViewAccess = async (projectId, userId) => {

  const member = await repository.getProjectMember(
    projectId,
    userId
  );

  const project = await repository.getById(projectId);

  const isOwner = project.owner_id === userId;

  if (!member && !isOwner) {
    throw new AppError("Project access denied", 403);
  }

  return member;
};


module.exports = {checkProjectManagementAccess,checkProjectViewAccess};