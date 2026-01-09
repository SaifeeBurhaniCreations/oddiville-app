// const Redis = require('ioredis');

// const redisClient = new Redis({
//     port: 6380,
//     host: '127.0.0.1',
//     lazyConnect: true,
//     retryStrategy(times) {
//         if (times > 5) return null; 
//         return Math.min(times * 100, 2000);
//     },
// });

// (async () => {
//     try {
//         await redisClient.connect();
//     } catch (err) {
//         console.error('Redis connection failed:', err);
//     }
// })();

// redisClient.on('connect', () => {
//     console.log('[Redis info]: Connected to Redis on port 6380');
// });

// redisClient.on('error', (err) => {
//     console.warn('[Redis warning]:', err.message);
// });

// module.exports = redisClient;

const Redis = require('ioredis');
const dotenv = require("dotenv");

dotenv.config();

const redis = new Redis({
  port: 13483,
  host: 'redis-13483.c232.us-east-1-2.ec2.cloud.redislabs.com',
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  retryStrategy(times) {
    if (times > 5) return null;
    return Math.min(times * 100, 2000);
  },
});

redis.on('connect', () => console.log('[Redis] connected'));
redis.on('error', (err) => console.error('[Redis] error', err));

module.exports = redis;