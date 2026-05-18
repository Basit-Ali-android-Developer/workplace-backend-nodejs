CREATE TABLE task_time_logs (

    id SERIAL PRIMARY KEY,

    task_id INTEGER NOT NULL
        REFERENCES tasks(id),

    user_id INTEGER NOT NULL
        REFERENCES users(id),

    start_time TIMESTAMP NOT NULL,

    end_time TIMESTAMP NULL,

    duration_minutes INTEGER DEFAULT 0,

    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

