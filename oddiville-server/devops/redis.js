const Redis = require("ioredis");
const dotenv = require("dotenv");

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const redis = new Redis(
  isProd
    ? {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
      }
    : {
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: null,
      }
);

redis.on("connect", () =>
  console.log(`[Redis] connected (${isProd ? "production" : "local"})`)
);

redis.on("error", (err) =>
  console.error("[Redis] error", err.message)
);

module.exports = redis;