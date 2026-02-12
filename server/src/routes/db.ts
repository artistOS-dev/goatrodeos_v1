import express, { Request, Response } from 'express';
import pool from '../db/connection.js';

const router = express.Router();

router.get('/validate', async (req: Request, res: Response) => {
  const startedAt = Date.now();

  try {
    const [pingResult, databaseResult, schemaResult, tableResult] = await Promise.all([
      pool.query('SELECT NOW() AS server_time, version() AS postgres_version'),
      pool.query('SELECT current_database() AS database_name, current_schema() AS schema_name'),
      pool.query('SELECT current_user AS user_name, inet_server_addr()::text AS server_addr, inet_server_port() AS server_port'),
      pool.query(
        `SELECT
          t.table_schema,
          t.table_name,
          COALESCE(c.column_count, 0) AS column_count,
          COALESCE(p.has_primary_key, false) AS has_primary_key
        FROM information_schema.tables t
        LEFT JOIN (
          SELECT table_schema, table_name, COUNT(*)::INTEGER AS column_count
          FROM information_schema.columns
          GROUP BY table_schema, table_name
        ) c ON t.table_schema = c.table_schema AND t.table_name = c.table_name
        LEFT JOIN (
          SELECT tc.table_schema, tc.table_name, TRUE AS has_primary_key
          FROM information_schema.table_constraints tc
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) p ON t.table_schema = p.table_schema AND t.table_name = p.table_name
        WHERE t.table_type = 'BASE TABLE'
          AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY t.table_schema, t.table_name`
      ),
    ]);

    const elapsedMs = Date.now() - startedAt;

    res.json({
      status: 'ok',
      timings: {
        elapsed_ms: elapsedMs,
        checked_at: new Date().toISOString(),
      },
      connection: {
        success: true,
        server_time: pingResult.rows[0]?.server_time,
        postgres_version: pingResult.rows[0]?.postgres_version,
      },
      database_context: {
        database_name: databaseResult.rows[0]?.database_name,
        schema_name: databaseResult.rows[0]?.schema_name,
        user_name: schemaResult.rows[0]?.user_name,
        server_addr: schemaResult.rows[0]?.server_addr,
        server_port: schemaResult.rows[0]?.server_port,
      },
      table_summary: {
        total_tables: tableResult.rowCount,
        tables: tableResult.rows,
      },
    });
  } catch (error: any) {
    const elapsedMs = Date.now() - startedAt;

    res.status(500).json({
      status: 'error',
      timings: {
        elapsed_ms: elapsedMs,
        checked_at: new Date().toISOString(),
      },
      connection: {
        success: false,
      },
      error: {
        message: error?.message || 'Unknown database error',
        name: error?.name || null,
        code: error?.code || null,
        detail: error?.detail || null,
        hint: error?.hint || null,
        where: error?.where || null,
        table: error?.table || null,
        column: error?.column || null,
        constraint: error?.constraint || null,
        routine: error?.routine || null,
      },
    });
  }
});

export default router;
