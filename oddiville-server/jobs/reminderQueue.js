const { Queue, QueueScheduler } = require("bullmq");
const IORedis = require("ioredis");
const { getIO } = require("../config/socket");
const { Calendar } = require("../models");
const { v4: uuidv4 } = require("uuid");

const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

const QUEUE_NAME = "reminder-24h";
const queueScheduler = new QueueScheduler(QUEUE_NAME, { connection });
const reminderQueue = new Queue(QUEUE_NAME, { connection });

/**
 * schedule24hReminder
 * - event: sequelize model instance or plain object with { id, scheduled_at, title, ... }
 * - options:
 *    - testSocketId: if provided, worker will emit to socket id channel for testing (notification-today:new:test)
 *    - jobIdMode: 'byEvent' default => jobId = `reminder-24h:${event.id}`
 */
async function schedule24hReminder(event, options = {}) {
  if (!event || !event.id) throw new Error("event required");

  const eventTime = new Date(event.scheduled_at).getTime();
  const sendAt = eventTime - 24 * 60 * 60 * 1000;
  const delay = Math.max(0, sendAt - Date.now());

  const jobId = options.jobId || `reminder-24h:${event.id}`;

  const jobData = {
    eventId: event.id,
    title: event.title || null,
    scheduledAt: event.scheduled_at || null,
    testSocketId: options.testSocketId || null,
  };

  await reminderQueue.add("send-24h-reminder", jobData, {
    jobId,
    delay,
    attempts: 3,
    backoff: { type: "exponential", delay: 60 * 1000 },
    removeOnComplete: { age: 24 * 60 * 60 }, 
    removeOnFail: { age: 7 * 24 * 60 * 60 },
  });

  try {
    if (event && event.save) {
      event.reminder_24h_job_id = jobId;
      await event.save();
    }
  } catch (e) {
    console.warn("Could not persist reminder job id:", e.message);
  }

  return { jobId, scheduledAt: new Date(Date.now() + delay).toISOString() };
}

async function remove24hReminderForEvent(eventId) {
  const jobId = `reminder-24h:${eventId}`;
  await reminderQueue.remove(jobId);
  // note: also clear column in DB if you persisted
  return true;
}

module.exports = {
  reminderQueue,
  queueScheduler,
  schedule24hReminder,
  remove24hReminderForEvent,
};
