const { Queue } = require("bullmq");
const connection = require("../devops/bullmqRedis");

const QUEUE_NAME = "calendar-reminder";

module.exports = new Queue(QUEUE_NAME, { connection });
