CREATE TABLE tasks (

    id SERIAL PRIMARY KEY,

    project_id INTEGER NULL
        REFERENCES projects(id),

    title VARCHAR(255) NOT NULL,

    description TEXT,

	task_type VARCHAR(20) NOT NULL DEFAULT 'project'
    CHECK (task_type IN ('project', 'personal')),

    status VARCHAR(50) DEFAULT 'Todo'
        CHECK (status IN (
            'Todo',
            'In Progress',
            'Review',
            'Completed'
        )),

    priority VARCHAR(50) DEFAULT 'Medium'
        CHECK (priority IN (
            'Low',
            'Medium',
            'High',
            'Urgent'
        )),

    assigned_to INTEGER
        REFERENCES users(id),

    created_by INTEGER NOT NULL
        REFERENCES users(id),

    start_date TIMESTAMP NULL,

    due_date TIMESTAMP NULL,

    completed_at TIMESTAMP NULL,

    actual_hours NUMERIC(8,2) DEFAULT 0,

    total_sessions INTEGER DEFAULT 0,

    is_timer_running BOOLEAN DEFAULT false,

    last_timer_started_at TIMESTAMP NULL,

    is_deleted BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()
);


ALTER TABLE tasks
ADD CONSTRAINT unique_task_per_project
UNIQUE (project_id, title);


