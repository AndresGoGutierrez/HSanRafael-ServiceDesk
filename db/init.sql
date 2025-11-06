-- Intenta crear la base de datos "hospital_desk" solo si no existe previamente
SELECT 'CREATE DATABASE hospital_desk'
WHERE NOT EXISTS (
    -- Subconsulta: busca en la lista de bases de datos existentes
    SELECT FROM pg_database WHERE datname = 'hospital_desk'
)
\gexec  -- Ejecuta dinámicamente el resultado del SELECT

\connect hospital_desk;
CREATE EXTENSION IF NOT EXISTS pgcrypto;