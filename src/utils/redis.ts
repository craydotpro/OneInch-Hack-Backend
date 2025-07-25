import { createClient } from 'redis'
export const redisClient = createClient({
  legacyMode: true,
  socket: {
    host: process.env.APP_REDIS_HOST,
    port: process.env.APP_REDIS_PORT as any,
  },
  password: process.env.APP_REDIS_PASSWORD,
  database: process.env.APP_REDIS_DB as any,
})

export const r = redisClient.v4
redisClient.connect()
redisClient.on('error', (err) => console.log('Redis Client Error', err))
/**
let redisClient = createClient();
redisClient.connect().catch(console.error);
 * 
 */
