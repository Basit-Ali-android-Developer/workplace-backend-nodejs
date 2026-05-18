CREATE TABLE project_members (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),

    role VARCHAR(20) NOT NULL DEFAULT 'member',
    -- owner | admin | member

    can_assign_tasks BOOLEAN DEFAULT false,
    can_manage_project BOOLEAN DEFAULT false,

    joined_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(project_id, user_id)
);