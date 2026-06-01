const { Pool } = require('pg');
const path = require('path');

let dbInstance = null;

class DbWrapper {
  constructor(db, type) {
    this.db = db;
    this.type = type;
  }

  convertPlaceholders(sql) {
    if (this.type === 'sqlite') return sql;
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async get(sql, params = []) {
    try {
      if (this.type === 'sqlite') {
        return await this.db.get(sql, params);
      } else {
        const result = await this.db.query(this.convertPlaceholders(sql), params);
        return result.rows[0];
      }
    } catch (err) {
      this.normalizeError(err);
      this.markServiceUnavailable(err);
      throw err;
    }
  }

  async all(sql, params = []) {
    try {
      if (this.type === 'sqlite') {
        return await this.db.all(sql, params);
      } else {
        const result = await this.db.query(this.convertPlaceholders(sql), params);
        return result.rows;
      }
    } catch (err) {
      this.normalizeError(err);
      this.markServiceUnavailable(err);
      throw err;
    }
  }

  async run(sql, params = []) {
    try {
      if (this.type === 'sqlite') {
        const result = await this.db.run(sql, params);
        return { lastID: result.lastID, changes: result.changes };
      } else {
        let pgSql = sql;
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          pgSql = `${sql} RETURNING id`;
        }
        const result = await this.db.query(this.convertPlaceholders(pgSql), params);
        return { lastID: result.rows[0]?.id, changes: result.rowCount };
      }
    } catch (err) {
      this.normalizeError(err);
      this.markServiceUnavailable(err);
      throw err;
    }
  }

  async exec(sql) {
    try {
      if (this.type === 'sqlite') {
        return await this.db.exec(sql);
      } else {
        return await this.db.query(sql);
      }
    } catch (err) {
      this.normalizeError(err);
      this.markServiceUnavailable(err);
      throw err;
    }
  }

  normalizeError(err) {
    if (this.type === 'pg') {
      if (err.code === '23505') err.code = 'SQLITE_CONSTRAINT';
    }
  }

  markServiceUnavailable(err) {
    const connectionIssueCodes = new Set([
      'SQLITE_BUSY',
      'SQLITE_IOERR',
      'SQLITE_CANTOPEN',
      '57P01',
      '57P02',
      '57P03',
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
    ]);

    if (connectionIssueCodes.has(err.code)) {
      err.status = 503;
      err.message = 'Database temporarily unavailable. Please try again shortly.';
    }
  }
}

async function initDb() {
  if (dbInstance) return dbInstance;

  const rawUrl = process.env.DATABASE_URL || '';
  const hasValidUrl = rawUrl.startsWith('postgres://') || rawUrl.startsWith('postgresql://');
  const isRender = process.env.RENDER === 'true';
  const isProdEnv = process.env.NODE_ENV === 'production';

  console.log('--- DB INITIALIZATION ---');
  console.log('Environment:', { isProdEnv, isRender });
  console.log('URL Check:', { 
    exists: !!rawUrl, 
    isValidFormat: hasValidUrl, 
    prefix: rawUrl.substring(0, 10) + '...' 
  });

  // Use PG if we are on Render OR if we have a VALID URL
  if (hasValidUrl || (isRender && isProdEnv)) {
    if (!hasValidUrl) {
      console.error('CRITICAL ERROR: On Render but DATABASE_URL is missing or invalid!');
      throw new Error('DATABASE_URL must start with postgres://');
    }

    console.log('Mode: PostgreSQL');
    const pool = new Pool({
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    dbInstance = new DbWrapper(pool, 'pg');
    
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'To Do',
        priority VARCHAR(20) DEFAULT 'Medium',
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    console.log('Mode: SQLite');
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    
    const DB_PATH = path.join(__dirname, '..', 'data', 'database.sqlite');
    const sqliteDb = await open({
      filename: DB_PATH,
      driver: sqlite3.Database,
    });
    await sqliteDb.exec('PRAGMA foreign_keys = ON;');
    await sqliteDb.exec('PRAGMA busy_timeout = 5000;');

    dbInstance = new DbWrapper(sqliteDb, 'sqlite');

    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        project_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'To Do',
        priority VARCHAR(20) DEFAULT 'Medium',
        due_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `);
  }

  return dbInstance;
}

module.exports = { initDb };
