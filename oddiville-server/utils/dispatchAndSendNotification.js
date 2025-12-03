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

function resolveTypeAndCategory(input) {
  if (Array.isArray(input)) {
    const [t, cat] = input;
    const type = (t || "").trim();
    if (!type) throw new Error("Invalid notification type");
    if (["informative", "actionable", "today"].includes(cat)) {
      return { type, category: cat };
    }
    return { type, category: getNotificationCategory(type) };
  }
  if (typeof input === "string" && input.trim()) {
    const type = input.trim();
    return { type, category: getNotificationCategory(type) };
  }
  throw new Error("Type must be string or [type, category]");
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
    
    const { type: notificationType, category } = resolveTypeAndCategory(type);

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

    console.log("getNotificationtype[notificationType]", getNotificationtype[notificationType]);
    

    const notification = await Notifications.create({
      type: getNotificationtype[notificationType],
      title: sanitizedTitle,
      description: sanitizedDescription,
      category,
      read: false,
      itemId: sanitizedId,
      identifier: notificationType,
      extraData: extraData ?? null,
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
