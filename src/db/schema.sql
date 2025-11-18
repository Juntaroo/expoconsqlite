-- Tabla principal de Observations
CREATE TABLE IF NOT EXISTS observations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deviceId TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_observations_updatedAt ON observations(updatedAt);
CREATE INDEX IF NOT EXISTS idx_observations_deleted ON observations(deleted);

-- Tabla Outbox para operaciones pendientes de sync
CREATE TABLE IF NOT EXISTS outbox (
  opId TEXT PRIMARY KEY,
  entityId TEXT NOT NULL,
  opType TEXT NOT NULL,           --Nuestros tipos: 'INSERT' | 'UPDATE' | 'DELETE'
  payload TEXT NOT NULL,          --JSON de la Observation
  createdAt TEXT NOT NULL,
  tryCount INTEGER NOT NULL DEFAULT 0,
  lastError TEXT
);
