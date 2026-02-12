import cors from 'cors';

const devOrigins = ['http://localhost:3000', 'http://localhost:3001'];

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()),
].filter(Boolean) as string[];

const productionOriginMatcher = (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
  if (!origin) {
    // Allow server-to-server and curl requests without Origin header.
    callback(null, true);
    return;
  }

  if (configuredOrigins.length === 0) {
    // Fallback: reflect request origin to avoid invalid "*" + credentials combination.
    callback(null, origin);
    return;
  }

  callback(null, configuredOrigins.includes(origin) ? origin : false);
};

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? productionOriginMatcher : devOrigins,
  credentials: true,
};

export default cors(corsOptions);
