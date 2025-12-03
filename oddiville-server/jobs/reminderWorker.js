const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { getIO } = require("../config/socket");
const { YourEventModel, Notifications } = require("../models");
const { dispatchAndSendNotification } = require("../utils/dispatchAndSendNotification");

const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
const QUEUE_NAME = "reminder-24h";

/**
 * Worker process:
 * - fetch event by id
 * - optionally verify scheduled time still appropriate (e.g., within ±30 minutes of job arrival)
 * - call dispatchAndSendNotification to create DB notifs + default emit
 * - additionally, emit test channel if testSocketId provided (io.to(...).emit)
 */
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { eventId, title, scheduledAt, testSocketId } = job.data;
    console.log("Processing reminder job:", job.id, job.data);

    const ev = await YourEventModel.findByPk(eventId);
    if (!ev) {
      console.warn("Event not found, skipping reminder:", eventId);
      return;
    }

    if (ev.reminder_24h_sent) {
      console.log("Reminder already marked sent for event:", eventId);
      return;
    }

    if (ev.scheduled_at) {
      const scheduled = new Date(ev.scheduled_at).getTime();
      const now = Date.now();
      const delta = Math.abs(scheduled - (now + 24 * 60 * 60 * 1000));
      if (delta > 60 * 60 * 1000) {
        console.log("Event rescheduled or out-of-window; skipping:", eventId, "delta(ms):", delta);
        return;
      }
    }

    const desc = [String(ev.location || "--"), ev.scheduled_at ? new Date(ev.scheduled_at).toISOString() : "--"];

    await dispatchAndSendNotification({
      type: "calendar-event-scheduled",
      title: ev.title || title || "Upcoming event",
      description: desc,
      id: ev.id,
    });

    try {
      const io = getIO();
      const normalized = {
        id: "test-" + (ev.id || job.id),
        title: ev.title || title || "Upcoming event (test)",
        message: "",
        created_at: new Date(),
        read: false,
        type: "calendar-event-scheduled",
        details: {
          id: ev.id,
          identifier: "calendar-event-scheduled",
          type: "calendar-event-scheduled",
          title: ev.title,
          badgeText: "New",
          createdAt: new Date(),
          description: desc,
          category: "today",
          read: false,
          extraData: null,
        },
      };

      if (testSocketId) {
        io.to(testSocketId).emit("notification-today:new:test", normalized);
        console.log("Emitted test notification to socket:", testSocketId);
      } else {
        io.emit("notification-today:new", normalized);
        console.log("Broadcasted notification to channel notification-today:new");
      }
    } catch (emitErr) {
      console.error("Emit error in worker:", emitErr);
    }

    try {
      ev.reminder_24h_sent = true;
      await ev.save();
    } catch (e) {
      console.warn("Could not mark reminder_24h_sent:", e.message);
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on("failed", (job, err) => {
  console.error("Reminder job failed:", job.id, err);
});
worker.on("completed", (job) => {
  console.log("Reminder job completed:", job.id);
});

module.exports = worker;