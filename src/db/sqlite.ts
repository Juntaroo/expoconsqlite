import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export function getDB() {
  if (!db) {
    db = SQLite.openDatabaseSync("localfirst.db");
  }
  return db;
}

//Ejecuta múltiples sentencias separadas por ';'
function execBatch(database: SQLite.SQLiteDatabase, statements: string[]) {
  for (const sql of statements) {
    if (sql.trim().length > 0) {
      const stmt = database.prepareSync(sql);
      stmt.executeSync();
      stmt.finalizeSync();
    }
  }
}

export function runMigrations() {
  const database = getDB();

  const schema = `
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

    CREATE TABLE IF NOT EXISTS outbox (
      opId TEXT PRIMARY KEY,
      entityId TEXT NOT NULL,
      opType TEXT NOT NULL,
      payload TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      tryCount INTEGER NOT NULL DEFAULT 0,
      lastError TEXT
    );
  `;

  execBatch(database, schema.split(";"));
}
