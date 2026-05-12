const db = require("../../db/connection");


const getById = async (projectId) => {

  const result = await db.query(
    `
    SELECT *
    FROM projects
    WHERE id = $1 AND is_deleted = false
    `,
    [projectId]
  );

  return result.rows[0];
};




const getprojectId = async (taskId) => {

  const result = await db.query(
    `
    SELECT project_id
    FROM tasks
    WHERE id = $1
    `,
    [taskId]
  );

   return result.rows[0]?.project_id;
};


const getTaskByTitleAndProject = async (projectId, title) => {

  const result = await db.query(
    `
      SELECT id
      FROM tasks
      WHERE project_id = $1
      AND LOWER(title) = LOWER($2)
      AND is_deleted = false
    `,
    [projectId, title]
  );

  return result.rows[0];
};





const createTask = async (task) => {

  const {
    project_id,
    title,
    description,
    priority,
    assigned_to,
    start_date,
    due_date,
    created_by
  } = task;

  const result = await db.query(
    `
      INSERT INTO tasks (
        project_id,
        title,
        description,
        priority,
        assigned_to,
        start_date,
        due_date,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `,
    [
      project_id,
      title,
      description,
      priority,
      assigned_to,
      start_date,
      due_date,
      created_by
    ]
  );

  return result.rows[0];
};


const getTaskById = async (taskId) => {

  const result = await db.query(
    `
      SELECT
        t.*,

        p.name AS project_name,
        p.owner_id,

        u1.name AS assigned_user_name,
        u1.email AS assigned_user_email,

        u2.name AS created_by_name

      FROM tasks t

      INNER JOIN projects p
        ON p.id = t.project_id

      LEFT JOIN users u1
        ON u1.id = t.assigned_to

      LEFT JOIN users u2
        ON u2.id = t.created_by

      WHERE t.id = $1
      AND t.is_deleted = false
    `,
    [taskId]
  );

  return result.rows[0];
};




const getTasksByProject = async (projectId) => {

  const result = await db.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.start_date,
        t.due_date,
        t.completed_at,
        t.actual_hours,
        t.total_sessions,
        t.created_at,

        u.name AS assigned_user_name

      FROM tasks t

      LEFT JOIN users u
        ON u.id = t.assigned_to

      WHERE t.project_id = $1
      AND t.is_deleted = false

      ORDER BY t.created_at DESC
    `,
    [projectId]
  );

  return result.rows;
};





const updateTask = async (taskId, data) => {

  const result = await db.query(
    `
    UPDATE tasks
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      priority = COALESCE($3, priority),
      assigned_to = COALESCE($4, assigned_to),
      start_date = COALESCE($5, start_date),
      due_date = COALESCE($6, due_date),
      updated_at = NOW()
    WHERE id = $7
    RETURNING *
    `,
    [
      data.title,
      data.description,
      data.priority,
      data.assigned_to,
      data.start_date,
      data.due_date,
      taskId
    ]
  );

  return result.rows[0];
};



const deleteTask = async (taskId) => {

  const result = await db.query(
    `
      UPDATE tasks
      SET
        is_deleted = true,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [taskId]
  );

  return result.rows[0];
};







const startTask = async (taskId) => {

  const result = await db.query(
    `
      UPDATE tasks
      SET
        is_timer_running = true,
        last_timer_started_at = NOW(),
        status = 'In Progress',
        updated_at = NOW()
      WHERE id = $1
        AND is_deleted = false
      RETURNING *
    `,
    [taskId]
  );

  return result.rows[0];
};



const createTimeLog = async (taskId, userId) => {

  const result = await db.query(
    `
      INSERT INTO task_time_logs (
        task_id,
        user_id,
        start_time
      )
      VALUES ($1, $2, NOW())
      RETURNING *
    `,
    [taskId, userId]
  );

  return result.rows[0];
};




const getActiveSession = async (taskId) => {

  const result = await db.query(
    `
      SELECT *
      FROM task_time_logs
      WHERE task_id = $1
      AND end_time IS NULL
      ORDER BY start_time DESC
      LIMIT 1
    `,
    [taskId]
  );

  return result.rows[0];
};



const stopTimeLog = async (sessionId) => {

  const result = await db.query(
    `
      UPDATE task_time_logs
      SET
        end_time = NOW(),
        duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
      WHERE id = $1
      RETURNING *
    `,
    [sessionId]
  );

  return result.rows[0];
};


const stopTask = async (taskId, durationMinutes) => {

  const result = await db.query(
    `
      UPDATE tasks
      SET
        is_timer_running = false,
        last_timer_started_at = NULL,
        actual_hours = actual_hours + ($2 / 60.0),
        total_sessions = total_sessions + 1,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [taskId, durationMinutes]
  );

  return result.rows[0];
};



const stopTaskTimer = async (taskId) => {

  await db.query(
    `
      UPDATE tasks
      SET
        is_timer_running = false,
        last_timer_started_at = NULL
      WHERE id = $1
    `,
    [taskId]
  );
};

const completeTask = async (taskId) => {

  const result = await db.query(
    `
      UPDATE tasks
      SET
        status = 'Completed',
        completed_at = NOW(),
        is_timer_running = false,
        updated_at = NOW()
      WHERE id = $1
        AND is_deleted = false
      RETURNING *
    `,
    [taskId]
  );

  return result.rows[0];
};






const getActiveTasksByUser = async (userId) => {

  const result = await db.query(
    `
    SELECT *
    FROM tasks
    WHERE assigned_to = $1
      AND is_deleted = false
      AND status != 'Completed'
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
};




module.exports = {
  createTask,
  getById,
  getTaskByTitleAndProject,
  getTaskById,
  getTasksByProject,
  deleteTask,
  getprojectId,

  startTask,
  createTimeLog,

  getActiveSession,
  stopTimeLog,
  stopTask,

  stopTaskTimer,
  completeTask,

  updateTask,
  getActiveTasksByUser
  

};