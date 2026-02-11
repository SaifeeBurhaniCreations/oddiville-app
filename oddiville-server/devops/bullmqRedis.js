const IORedis = require("ioredis");

module.exports = new IORedis({
  host: "redis-13483.c232.us-east-1-2.ec2.cloud.redislabs.com",
  port: 13483,
  username: "default",
  password: process.env.REDIS_PASSWORD,

  maxRetriesPerRequest: null,
});