CREATE TABLE projects (

    id SERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    owner_id INTEGER NOT NULL REFERENCES users(id),

    status VARCHAR(50) DEFAULT 'Active',

    priority VARCHAR(50) DEFAULT 'Medium',

    start_date DATE,

    due_date DATE,

    completed_at TIMESTAMP NULL,

    is_deleted BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),

    updated_at TIMESTAMP DEFAULT NOW()

);
