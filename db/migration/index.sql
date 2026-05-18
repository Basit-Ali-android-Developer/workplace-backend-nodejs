-- Email lookup (login)
CREATE INDEX idx_users_email_not_deleted
ON users (email)
WHERE is_deleted = false;

-- Password reset token
CREATE INDEX idx_users_reset_token
ON users (reset_password_token);                                                                                                                                       





-- Owner-based project fetch
CREATE INDEX idx_projects_owner_not_deleted
ON projects (owner_id)
WHERE is_deleted = false;

-- Case-insensitive duplicate project name check
CREATE INDEX idx_projects_owner_lower_name_not_deleted
ON projects (owner_id, LOWER(name))
WHERE is_deleted = false;

-- (Optional) dashboard sorting if heavily used
CREATE INDEX idx_projects_created_at
ON projects (created_at DESC);





-- Main membership lookup (critical)
CREATE INDEX idx_project_members_user_projects
ON project_members (user_id, project_id);






-- Project task listing
CREATE INDEX idx_tasks_project_not_deleted
ON tasks (project_id)
WHERE is_deleted = false;

-- Assigned tasks lookup
CREATE INDEX idx_tasks_assigned_user
ON tasks (assigned_to)
WHERE is_deleted = false;

-- User task filtering (status-based)
CREATE INDEX idx_tasks_user_status
ON tasks (assigned_to, status)
WHERE is_deleted = false;

-- Project dashboard filtering
CREATE INDEX idx_tasks_project_status
ON tasks (project_id, status)
WHERE is_deleted = false;

-- Title search (case-insensitive per project)
CREATE INDEX idx_tasks_project_lower_title
ON tasks (project_id, LOWER(title))
WHERE is_deleted = false;

-- Task creator tracking
CREATE INDEX idx_tasks_created_by
ON tasks (created_by);

-- Timer optimization (running task per user)
CREATE INDEX idx_tasks_timer_running
ON tasks (assigned_to, is_timer_running)
WHERE is_deleted = false;






-- Active session lookup
CREATE INDEX idx_task_time_logs_active
ON task_time_logs (task_id)
WHERE end_time IS NULL;

-- User session history
CREATE INDEX idx_task_time_logs_user
ON task_time_logs (user_id);

-- Task session ordering
CREATE INDEX idx_task_time_logs_task_start_time
ON task_time_logs (task_id, start_time DESC);