const db = require("../../db/connection");



const getProjectMember = async (projectId, userId) => {

  const result = await db.query(
    `
    SELECT *
    FROM project_members
    WHERE project_id = $1
    AND user_id = $2
    `,
    [projectId, userId]
  );

  return result.rows[0];
};




const addProjectMember = async (projectId,userId,role,canAssignTasks,canManageProject) => {

  const result = await db.query(
    `
    INSERT INTO project_members
    (
      project_id,
      user_id,
      role,
      can_assign_tasks,
      can_manage_project,
      joined_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
    `,
    [
      projectId,
      userId,
      role,
      canAssignTasks,
      canManageProject
    ]
  );

  return result.rows[0];
};


const getUserByEmail = async (email) => {

  const result = await db.query(
    `
    SELECT id, name, email
    FROM users
    WHERE email = $1
    AND is_deleted = false
    `,
    [email]
  );

  return result.rows[0];
};



const unassignTasksByUserAndProject = async (projectId, userId) => {

  await db.query(
    `
    UPDATE tasks
    SET assigned_to = NULL,
        updated_at = NOW()
    WHERE project_id = $1
      AND assigned_to = $2
      AND is_deleted = false
    `,
    [projectId, userId]
  );
};


const removeProjectMember = async (projectId, userId) => {

  const result = await db.query(
    `
    DELETE FROM project_members
    WHERE project_id = $1
      AND user_id = $2
    RETURNING *
    `,
    [projectId, userId]
  );

  return result.rows[0];
};




module.exports = {
    getProjectMember,
    addProjectMember,
    getUserByEmail,
    unassignTasksByUserAndProject,
    removeProjectMember
};