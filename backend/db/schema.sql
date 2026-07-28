-- AI Resume Builder - SQL Schema
-- Run this once against your PostgreSQL database (Render Postgres, Supabase, etc.)

CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(128) UNIQUE NOT NULL,       -- Firebase Auth UID
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  summary TEXT,
  skills TEXT,
  experience TEXT,
  education TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_requests_log (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(128),
  request_type VARCHAR(50),   -- 'summary' or 'experience'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_email ON resumes(email);
