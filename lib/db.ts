import mysql, { Pool, PoolOptions } from 'mysql2/promise';

// Keep a single pool across hot-reloads in dev
let _pool: Pool | undefined = (global as any).__RAVDESK_MYSQL_POOL__;
let _initPromise: Promise<void> | undefined = (global as any).__RAVDESK_DB_INIT_PROMISE__;

export function getPool(): Pool {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (url) {
    _pool = mysql.createPool(url);
  } else {
    const host = process.env.DB_HOST || process.env.MYSQL_HOST;
    const user = process.env.DB_USER || process.env.MYSQL_USER;
    const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
    const database = process.env.DB_DATABASE || process.env.MYSQL_DATABASE;
    const portStr = process.env.DB_PORT || process.env.MYSQL_PORT;
    const port = portStr ? parseInt(portStr, 10) : undefined;
    if (!host || !user || !database) {
      throw new Error('DATABASE_URL or (DB_HOST/DB_USER/DB_DATABASE) or (MYSQL_HOST/MYSQL_USER/MYSQL_DATABASE) must be set in Ravdesk/.env.local');
    }
    const cfg: PoolOptions = { host, user, password, database, port };
    _pool = mysql.createPool(cfg);
  }
  (global as any).__RAVDESK_MYSQL_POOL__ = _pool;
  return _pool;
}

async function ensureDatabaseExists(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      // Parse URL to extract connection details and database name
      const u = new URL(url);
      const database = (u.pathname || '').replace(/^\//, '');
      if (!database) return; // nothing we can do
      const host = u.hostname;
      const user = decodeURIComponent(u.username);
      const password = decodeURIComponent(u.password);
      const port = u.port ? parseInt(u.port, 10) : undefined;
      const admin = await mysql.createConnection({ host, user, password, port });
      await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await admin.end();
    } catch {
      // best-effort; continue
    }
    return;
  }

  const host = process.env.DB_HOST || process.env.MYSQL_HOST;
  const user = process.env.DB_USER || process.env.MYSQL_USER;
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.DB_DATABASE || process.env.MYSQL_DATABASE;
  const portStr = process.env.DB_PORT || process.env.MYSQL_PORT;
  const port = portStr ? parseInt(portStr, 10) : undefined;
  if (!host || !user || !database) return;

  try {
    const admin = await mysql.createConnection({ host, user, password, port });
    await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await admin.end();
  } catch {
    // best-effort; continue
  }
}

async function ensureTables(): Promise<void> {
  const pool = getPool();
  // contracts table used by /api/ravdesk-server/api/contracts
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contracts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      address VARCHAR(255) NOT NULL,
      creator VARCHAR(255) NOT NULL,
      role VARCHAR(255) NULL,
      total_amount VARCHAR(255) NULL,
      net_amount VARCHAR(255) NULL,
      milestone_amounts TEXT NULL,
      clients TEXT NOT NULL,
      freelancers TEXT NOT NULL,
      freelancer_percentages TEXT NOT NULL,
      is_timelock TINYINT(1) DEFAULT 0,
      release_time BIGINT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_creator (creator),
      INDEX idx_address (address)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function initDbIfNeeded(): Promise<void> {
  if (_initPromise) {
    return _initPromise;
  }
  _initPromise = (async () => {
    await ensureDatabaseExists();
    // After database exists, (re)create pool to include the database
    _pool = undefined;
    getPool();
    await ensureTables();
  })();
  (global as any).__RAVDESK_DB_INIT_PROMISE__ = _initPromise;
  return _initPromise;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const pool = getPool();
  const [rows] = await pool.query(sql, params as any);
  return rows as T[];
}

export function coerceArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value == null) return [];
  if (typeof value === 'string') {
    const v = value.trim();
    if (!v) return [];
    if (v.startsWith('[')) {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        // fall through to comma split
      }
    }
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [String(value)];
}

export function toJSONStringArrayOrDefault(value: any): string {
  try {
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'string') {
      const v = value.trim();
      if (v.startsWith('[')) return v; // already JSON array
      const parts = v.split(',').map((s) => s.trim()).filter(Boolean);
      return JSON.stringify(parts);
    }
    if (value == null) return '[]';
    return JSON.stringify([String(value)]);
  } catch {
    return '[]';
  }
}
