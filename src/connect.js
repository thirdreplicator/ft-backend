import pg from 'pg'
export const pool = new pg.Pool({
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "user": process.env.DB_USER,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_NAME,
  "max": process.env.DB_MAX_CONNECTIONS,
  "idleTimeoutMillis": process.env.DB_IDLE_TIMEOUT,
  "connectionTimeoutMillis": parseInt(process.env.DB_CONNECTION_TIMEOUT),
})
