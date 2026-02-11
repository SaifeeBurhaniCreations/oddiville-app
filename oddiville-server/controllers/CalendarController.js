const router = require("express").Router();
const { subHours } = require("date-fns");
const { format } = require("date-fns");
const { Calendar: calendarClient } = require("../models");
const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");
const reminderQueue = require("../queues/reminder.queue");

router.post("/", async (req, res) => {
  const event = await calendarClient.create(req.body);

 const eventDateTime = new Date(
  `${event.scheduled_date}T${event.start_time}`
);

const now = Date.now();

const delay24h = eventDateTime.getTime() - now - 24 * 60 * 60 * 1000;
const delay1h  = eventDateTime.getTime() - now -  1 * 60 * 60 * 1000;

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
