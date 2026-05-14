const db = require("../../db/connection");







const createProjectWithOwner = async (project) => {

  const client = await db.connect();

  try {

    await client.query("BEGIN");

    const projectResult =
      await client.query(
        `
        INSERT INTO projects
        (
          name,
          description,
          owner_id,
          status,
          priority,
          start_date,
          due_date,
          created_at,
          updated_at
        )
        VALUES
        (
          $1, $2, $3, $4,
          $5, $6, $7,
          NOW(),
          NOW()
        )
        RETURNING *
        `,
        [
          project.name,
          project.description,
          project.owner_id,
          project.status,
          project.priority,
          project.start_date,
          project.due_date
        ]
      );

    const createdProject = projectResult.rows[0];

    await client.query(
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
      VALUES
      (
        $1, $2, $3, $4, $5,
        NOW()
      )
      `,
      [
        createdProject.id,
        project.owner_id,
        "owner",
        true,
        true
      ]
    );

    await client.query("COMMIT");

    return createdProject;

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();
  }
};









const findByNameAndOwner = async (name,ownerId) => {

  const result = await db.query(
    `
    SELECT id
    FROM projects
    WHERE LOWER(name) = LOWER($1)
    AND owner_id = $2
    AND is_deleted = false
    `,
    [name, ownerId]
  );

  return result.rows[0];
};









const findDuplicateProjectName = async (name,ownerId,projectId) => {

  const result = await db.query(
    `
    SELECT id
    FROM projects
    WHERE LOWER(name) = LOWER($1)
    AND owner_id = $2
    AND id != $3
    AND is_deleted = false
    `,
    [name, ownerId, projectId]
  );

  return result.rows[0];
};









const getProjectMember = async ( projectId, userId) => {

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









const getById = async ( projectId) => {

  const result = await db.query(
    `
    SELECT *
    FROM projects
    WHERE id = $1
    AND is_deleted = false
    `,
    [projectId]
  );

  return result.rows[0];
};









const updateProject = async (projectId,data) => {

  const result = await db.query(
    `
    UPDATE projects
    SET
      name = $1,
      description = $2,
      priority = $3,
      start_date = $4,
      due_date = $5,
      updated_at = NOW()
    WHERE id = $6
    RETURNING *
    `,
    [
      data.name,
      data.description,
      data.priority,
      data.start_date,
      data.due_date,
      projectId
    ]
  );

  return result.rows[0];
};









const updateProjectStatus = async (
  projectId,
  status
) => {

  const result = await db.query(
    `
    UPDATE projects
    SET
      status = $1::text,

      completed_at =
        CASE
          WHEN $1::text = 'Completed'
          THEN NOW()
          ELSE NULL
        END,

      updated_at = NOW()

    WHERE id = $2

    RETURNING *
    `,
    [status, projectId]
  );

  return result.rows[0];
};









const deleteProject = async (projectId) => {

  const result = await db.query(
    `
    UPDATE projects
    SET
      is_deleted = true,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
    `,
    [projectId]
  );

  return result.rows[0];
};









const getProjectById = async (projectId) => {

  const result = await db.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.status,
      p.priority,
      p.start_date,
      p.due_date,
      p.completed_at,
      p.created_at,
      p.updated_at,

      u.id AS owner_id,
      u.name AS owner_name,
      u.email AS owner_email

    FROM projects p

    INNER JOIN users u
      ON p.owner_id = u.id

    WHERE p.id = $1
    AND p.is_deleted = false
    `,
    [projectId]
  );

  return result.rows[0];
};









const getTasksByProjectId = async ( projectId) => {

  const result = await db.query(
    `
    SELECT
      id,
      title,
      description,
      status,
      priority,
      assigned_to,
      start_date,
      due_date,
      completed_at,
      actual_hours,
      total_sessions,
      created_at,
      updated_at

    FROM tasks

    WHERE project_id = $1
    AND is_deleted = false

    ORDER BY created_at DESC
    `,
    [projectId]
  );

  return result.rows;
};









const getUserProjects = async (userId) => {

  const result = await db.query(
    `
    SELECT DISTINCT
      p.id,
      p.name,
      p.description,
      p.status,
      p.priority,
      p.created_at,
      p.owner_id,

      CASE
        WHEN p.owner_id = $1
        THEN 'owner'
        ELSE pm.role
      END AS user_role

    FROM projects p

    LEFT JOIN project_members pm
      ON pm.project_id = p.id
      AND pm.user_id = $1

    WHERE
    (
      p.owner_id = $1
      OR pm.user_id = $1
    )
    AND p.is_deleted = false

    ORDER BY p.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};









const getProjectMembers = async (projectId) => {

  const result = await db.query(
    `
    SELECT
      pm.user_id,
      pm.role,
      pm.can_assign_tasks,
      pm.can_manage_project,
      pm.joined_at,
      

      u.name,
      u.email,
      u.profile_image

    FROM project_members pm

    INNER JOIN users u
      ON u.id = pm.user_id

    WHERE pm.project_id = $1

    ORDER BY pm.joined_at ASC
    `,
    [projectId]
  );

  return result.rows;
};









module.exports = {
  createProjectWithOwner,

  findByNameAndOwner,
  findDuplicateProjectName,

  getProjectMember,

  getById,

  updateProject,
  updateProjectStatus,
  deleteProject,

  getProjectById,

  getTasksByProjectId,

  getUserProjects,
  getProjectMembers
};