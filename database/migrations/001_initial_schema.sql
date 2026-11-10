-- Migration: 001_initial_schema.sql
-- Description: Baseline schema definition for SQL2ER metadata and initial demo entities

-- Migration tracking table
CREATE TABLE IF NOT EXISTS _schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT INTO _schema_migrations (version, description) 
VALUES ('001_initial_schema', 'Baseline schema created for SQL2ER Studio demo.');

