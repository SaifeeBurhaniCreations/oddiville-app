const router = require("express").Router();
const { parse } = require("date-fns");
const { Calendar: calendarClient } = require("../models");
const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");
const reminderQueue = require("../queues/reminder.queue");

router.post("/", async (req, res) => {
  const io = req.app.get("io");

  const event = await calendarClient.create(req.body);

  const notificationDetails = {
    id: event.id,
    work_area: event.work_area,
    product_name: event.product_name,
    scheduled_date: event.scheduled_date,
    start_time: event.start_time,
    end_time: event.end_time,
  };

  const description = [
    event.work_area,
    format(new Date(event.scheduled_date), "MMM d, yyyy"),
  ];

  const title = event.product_name;

  io.emit("calendar:created", notificationDetails);

  await dispatchAndSendNotification({
    type: "calendar-event-scheduled",
    description,
    title,
    id: event.id,
  });

  const eventDateTime = parse(
    `${event.scheduled_date} ${event.start_time}`,
    "yyyy-MM-dd hh:mm a",
    new Date()
  );

  const now = Date.now();

  const delay24h = eventDateTime.getTime() - now - 24 * 60 * 60 * 1000;
  const delay1h = eventDateTime.getTime() - now - 1 * 60 * 60 * 1000;

  if (delay24h > 0) {
    await reminderQueue.add(
      "send-reminder",
      { eventId: event.id, hoursBefore: 24 },
      { jobId: `reminder-24h:${event.id}`, delay: delay24h }
    );
  }

  if (delay1h > 0) {
    await reminderQueue.add(
      "send-reminder",
      { eventId: event.id, hoursBefore: 1 },
      { jobId: `reminder-1h:${event.id}`, delay: delay1h }
    );
  }

  io.emit("calendar:created", event);

  res.status(201).json(event);
});


router.get("/", async (req, res) => {
  const calenderEvents = await calendarClient.findAll();

  res.status(200).json(calenderEvents);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const calenderEvent = await calendarClient.findOne({ where: { id } });

  res.status(200).json(calenderEvent);
});

module.exports = router;