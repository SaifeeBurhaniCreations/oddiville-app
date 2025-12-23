const { Notifications } = require("../models");
const buttonsByType = require("../utils/buttonByType");
const NOTIFICATION_CATEGORIES = require("../types/notification-types");
const getNotificationtype = require("./getNotificationtype");
const { getIO } = require("../config/socket");

function normalizeForClient(payload) {
  return {
    id: payload.id,
    title: payload.details?.title ?? "",
    message: "",
    created_at: payload.details?.createdAt ?? payload.timestamp ?? new Date(),
    read: !!payload.details?.read,
    type: payload.details?.type ?? payload.type,
    color: payload.color ?? payload.details?.color ?? null,
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

  const channel = channelForCategory(category);
  io.emit(channel, payload);
}

function resolveTypeAndCategory(typeKey) {
  const entry = NOTIFICATION_CATEGORIES[typeKey];

  if (!Array.isArray(entry)) {
    throw new Error(`Invalid notification config for type: ${typeKey}`);
  }

  if (entry.length !== 2 && entry.length !== 3) {
    throw new Error(
      `Notification config must be [type, category] or [type, category, color]: ${typeKey}`
    );
  }

  const [type, category, color] = entry;

  if (!type || !category) {
    throw new Error(`Invalid notification entry: ${typeKey}`);
  }

  return {
    type,
    category,
    color: entry.length === 3 ? color : null,
  };
}

// ---------- dispatcher ----------
/**
 * @param {Object} params
 * @param {string | [string, "informative"|"actionable"|"today"]} params.type
 * @param {string[]} params.description
 * @param {string} params.title
 * @param {string|number} params.id
 * @param {any} [params.extraData]
 */

async function dispatchAndSendNotification({
  type,
  description,
  title,
  id,
  extraData,
}) {
  try {
    
    const { type: notificationType, category, color } = resolveTypeAndCategory(type);
console.log("clr", color);

    const sanitizedId = String(id ?? "").trim();
    const sanitizedTitle = (title || "").trim();
    const sanitizedDescription = Array.isArray(description) ? description : [];

    const existing = await Notifications.findOne({
      where: { identifier: notificationType, itemId: sanitizedId, read: false },
    });
    if (existing) {
      console.log(
        `Duplicate notification prevented: ${notificationType} / ${sanitizedId}`
      );
      return {
        success: true,
        notification: existing,
        isDuplicate: true,
        message: "Notification already exists",
      };
    }

    const notification = await Notifications.create({
      type: getNotificationtype[notificationType],
      title: sanitizedTitle,
      description: sanitizedDescription,
      category,
      read: false,
      itemId: sanitizedId,
      identifier: notificationType,
      extraData: extraData ?? null,
      color,
    });

    const newBasePayload = {
      id: notification.id,
      itemId: notification.itemId,
      identifier: notification.identifier,
      type: getNotificationtype[notification.identifier] ?? notification.identifier,
      title: notification.title,
      badgeText: "New",
      createdAt: notification.createdAt || new Date(),
      description: notification.description,
      category: notification.category,
      read: notification.read,
      color,
    }

    if (category === "actionable") {
      const buttons = buttonsByType[notificationType];
      if (Array.isArray(buttons)) newBasePayload.buttons = buttons;
    }
    
      sendNotificationByType(notificationType, newBasePayload);
    return {
      success: true,
      notification,
      isDuplicate: false,
      message: "Notification created and sent successfully",
    };
  } catch (error) {
    console.error("Error in dispatchAndSendNotification:", error);
    return {
      success: false,
      error: error.message,
      notification: null,
      isDuplicate: false,
    };
  }
}

dispatchAndSendNotification.withTransaction = async (
  { type, description, title, id },
  transaction = null
) => {
  const { sequelize } = require("../models");
  const t = transaction || (await sequelize.transaction());
  try {
    const result = await dispatchAndSendNotification({
      type,
      description,
      title,
      id,
    });
    if (!transaction) {
      if (result.success) await t.commit();
      else await t.rollback();
    }
    return result;
  } catch (e) {
    if (!transaction) await t.rollback();
    throw e;
  }
};

module.exports = {
  dispatchAndSendNotification,
  normalizeForClient,
  channelForCategory,
  getNotificationCategory,
  sendNotificationByType,
};
