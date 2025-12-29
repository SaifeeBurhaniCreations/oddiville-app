const router = require("express").Router();
const { subHours } = require("date-fns");
const { format } = require("date-fns");
const { Calendar: calendarClient } = require("../models");
const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");
const notificationQueue = require("../queues/notificationQueue")
router.post("/", async (req, res) => {
  const body = req.body;
  const io = req.app.get("io");

  const calenderEvent = await calendarClient.create(body);

  const notificationDetails = {
    id: calenderEvent.id,
    work_area: calenderEvent.work_area,
    product_name: calenderEvent.product_name,
    scheduled_date: calenderEvent.scheduled_date,
    start_time: calenderEvent.start_time,
    end_time: calenderEvent.end_time,
  };

  const description = [
    calenderEvent.work_area,
    format(new Date(calenderEvent.scheduled_date), "MMM d, yyyy"),
  ];

  const title = calenderEvent.product_name;

  io.emit("calendar:created", notificationDetails);

  await dispatchAndSendNotification({
    type: "calendar-event-scheduled",
    description,
    title,
    id: calenderEvent.id,
  });

   const eventDateTime = new Date(
    `${calenderEvent.scheduled_date} ${calenderEvent.start_time}`
  );

  // 1 hour before
  const reminderTime = subHours(eventDateTime, 1);

  const delay = reminderTime.getTime() - Date.now();

  if (delay > 0) {
    await notificationQueue.add(
      { calendarEvent: calenderEvent },
      { delay }
    );
  }


  res.status(201).json(calenderEvent);
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
