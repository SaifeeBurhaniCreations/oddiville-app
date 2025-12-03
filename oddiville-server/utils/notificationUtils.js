const { getIO } = require("../config/socket");
const NOTIFICATION_CATEGORIES = require("../types/notification-types");

function normalizeForClient(payload) {
  return {
    id: payload.id,
    title: payload.details?.title ?? "",
    message: "",
    created_at: payload.details?.createdAt ?? payload.timestamp ?? new Date(),
    read: !!payload.details?.read,
    type: payload.details?.type ?? payload.type,
    details: {
      ...payload.details,
      createdAt: payload.details?.createdAt ?? payload.timestamp ?? new Date(),
    },
  };
}

function channelForCategory(category) {
  if (category === "actionable") return "notification-actionable:new";
  if (category === "today") return "notification-today:new";
  return "notification-informative:new";
}

function getNotificationCategory(type) {
  const entry = NOTIFICATION_CATEGORIES[type];
  if (type === "calendar-event-scheduled") return "today";
  return Array.isArray(entry) ? entry[1] : "informative";
}

function sendNotificationByType(type, payload) {
  const io = getIO();
  const category = getNotificationCategory(type);

  const normalized = normalizeForClient({
    ...payload,
    type,
    details: { ...(payload.details || {}), type },
    timestamp: payload.timestamp || new Date(),
  });

  const channel = channelForCategory(category);
  // console.log(
  //   "EMIT ▶",
  //   channel,
  //   "type=",
  //   type,
  //   "itemId=",
  //   payload?.details?.id
  // );
  io.emit(channel, normalized);
}