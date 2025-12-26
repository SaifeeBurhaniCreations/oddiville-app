const notificationQueue = require("../queues/notificationQueue");
const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");

notificationQueue.process(async (job) => {
  const { calendarEvent } = job.data;

  await dispatchAndSendNotification({
    type: "calendar-event-reminder",
    title: calendarEvent.product_name,
    description: [
      calendarEvent.work_area,
      calendarEvent.scheduled_date,
      "Starts in 1 hour",
    ],
    id: calendarEvent.id,
  });
});