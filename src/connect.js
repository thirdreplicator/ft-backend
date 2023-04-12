// Postgres
import pg from 'pg'
export const pgPool = new pg.Pool({
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "user": process.env.DB_USER,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_NAME,
  "max": process.env.DB_MAX_CONNECTIONS,
  "idleTimeoutMillis": process.env.DB_IDLE_TIMEOUT,
  "connectionTimeoutMillis": parseInt(process.env.DB_CONNECTION_TIMEOUT),
})

// Redis
import { createClient } from 'redis'; // For storing sessions.
export const SIXTY_DAYS = 60 * 24 * 60 * 60
export const redisClient = createClient({socket: {
	host: "127.0.0.1"
}});
redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();
redisClient.select(11)
