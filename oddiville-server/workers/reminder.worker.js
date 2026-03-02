const { Worker } = require("bullmq");
const { Calendar } = require("../models");
const { dispatchAndSendNotification } = require("../utils/dispatchAndSendNotification");
const connection = require("../devops/redis");
const { format } = require("date-fns");
new Worker(
  "calendar-reminder",
  async (job) => {
    const { eventId, hoursBefore } = job.data;

    const ev = await Calendar.findByPk(eventId);
    if (!ev) return;

    const formattedDate = format(
      new Date(`${ev.scheduled_date}T00:00:00`),
      "MMM d, yyyy"
    );


    await dispatchAndSendNotification({
      type: "calendar-event-reminder",
      title: ev.product_name,
      description: [
        ev.work_area,
        formattedDate,  
        `Starts in ${hoursBefore} hour(s)`,
      ],
      id: ev.id,
    });
  },
  { connection }
);

console.log("✅ Reminder worker started (24h + 1h)");