const { Queue } = require("bullmq");
const connection = require("../devops/redis");

const QUEUE_NAME = "calendar-reminder";

module.exports = new Queue(QUEUE_NAME, { connection });