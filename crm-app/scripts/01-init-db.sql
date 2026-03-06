-- Initialize PostgreSQL database and user for CRM app
-- This script runs automatically on first postgres container startup

-- Create the crm_db database
CREATE DATABASE crm_db;

-- Create the crm_user role and grant privileges
GRANT ALL PRIVILEGES ON DATABASE crm_db TO postgres;
