import express from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors.js';
import rodeosRouter from './routes/rodeos.js';
import songsRouter from './routes/songs.js';
import ratingsRouter from './routes/ratings.js';
import dbRouter from './routes/db.js';
import pool from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Diagnostic endpoint
app.get('/api/diagnostic', (req, res) => {
  const dbUrl = process.env.DATABASE_URL || '';
  const startedAt = Date.now();

  let parsedUrl: URL | null = null;
  try {
    parsedUrl = dbUrl ? new URL(dbUrl) : null;
  } catch {
    parsedUrl = null;
  }

  const host = parsedUrl?.hostname || 'unknown';
  const database = (parsedUrl?.pathname || '').replace(/^\//, '') || 'unknown';
  const user = parsedUrl?.username || 'unknown';
  const port = parsedUrl?.port || '5432';
  const sslParam = parsedUrl?.searchParams.get('sslmode') || 'not set';

  const envSnapshot = {
    node_env: process.env.NODE_ENV || 'not set',
    server_port: process.env.PORT || '5000 (default)',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    has_database_url: Boolean(process.env.DATABASE_URL),
    has_pg_host: Boolean(process.env.PGHOST),
    has_pg_port: Boolean(process.env.PGPORT),
    has_pg_database: Boolean(process.env.PGDATABASE),
    has_pg_user: Boolean(process.env.PGUSER),
    has_pg_password: Boolean(process.env.PGPASSWORD),
    has_pg_ssl: Boolean(process.env.PGSSLMODE),
  };

  const dbConfigSnapshot = {
    host,
    port,
    database,
    user,
    ssl_mode_query_param: sslParam,
    connection_string_masked: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'not configured',
  };

  const memory = process.memoryUsage();
  const serverMetrics = {
    uptime_seconds: Number(process.uptime().toFixed(2)),
    process_id: process.pid,
    node_version: process.version,
    platform: `${process.platform}/${process.arch}`,
    memory_usage_mb: {
      rss: Number((memory.rss / 1024 / 1024).toFixed(2)),
      heap_total: Number((memory.heapTotal / 1024 / 1024).toFixed(2)),
      heap_used: Number((memory.heapUsed / 1024 / 1024).toFixed(2)),
      external: Number((memory.external / 1024 / 1024).toFixed(2)),
    },
  };

  pool.query('SELECT NOW() AS now, version() AS postgres_version')
    .then((dbResult) => {
      const finishedAt = Date.now();
      res.json({
        status: 'ok',
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
        },
        timings: {
          started_at_iso: new Date(startedAt).toISOString(),
          finished_at_iso: new Date(finishedAt).toISOString(),
          elapsed_ms: finishedAt - startedAt,
        },
        env: envSnapshot,
        server_metrics: serverMetrics,
        db_config: dbConfigSnapshot,
        db_connection_test: {
          success: true,
          current_time: dbResult.rows[0]?.now,
          postgres_version: dbResult.rows[0]?.postgres_version,
          row_count: dbResult.rowCount,
        },
      });
    })
    .catch((error: any) => {
      const finishedAt = Date.now();
      res.status(500).json({
        status: 'error',
        request: {
          method: req.method,
          path: req.path,
          query: req.query,
        },
        timings: {
          started_at_iso: new Date(startedAt).toISOString(),
          finished_at_iso: new Date(finishedAt).toISOString(),
          elapsed_ms: finishedAt - startedAt,
        },
        env: envSnapshot,
        server_metrics: serverMetrics,
        db_config: dbConfigSnapshot,
        db_connection_test: {
          success: false,
          error_message: error?.message || 'Unknown database error',
          error_name: error?.name || null,
          error_code: error?.code || null,
          error_detail: error?.detail || null,
          error_hint: error?.hint || null,
          error_position: error?.position || null,
          error_internal_position: error?.internalPosition || null,
          error_internal_query: error?.internalQuery || null,
          error_where: error?.where || null,
          error_schema: error?.schema || null,
          error_table: error?.table || null,
          error_column: error?.column || null,
          error_data_type: error?.dataType || null,
          error_constraint: error?.constraint || null,
          error_file: error?.file || null,
          error_line: error?.line || null,
          error_routine: error?.routine || null,
          stack: error?.stack || null,
        },
      });
    });
});

// API Routes
app.use('/api/rodeos', rodeosRouter);
app.use('/api/songs', songsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/db', dbRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
