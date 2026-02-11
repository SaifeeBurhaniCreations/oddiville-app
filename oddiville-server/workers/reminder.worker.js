// workers/reminder.worker.js
const { Worker } = require("bullmq");
const { Calendar } = require("../models");
const { dispatchAndSendNotification } = require("../utils/dispatchAndSendNotification");
const connection = require("../devops/bullmqRedis");

new Worker(
  "calendar-reminder",
  async (job) => {
    const { eventId, hoursBefore } = job.data;

    const ev = await Calendar.findByPk(eventId);
    if (!ev) return;

    await dispatchAndSendNotification({
      type: "calendar-event-reminder",
      title: ev.product_name,
      description: [
        ev.work_area,
        ev.scheduled_date,
        `Starts in ${hoursBefore} hour(s)`,
      ],
      id: ev.id,
    });
  },
  { connection }
);

console.log("✅ Reminder worker started (24h + 1h)");