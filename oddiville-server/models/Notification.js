const NotificationTypes = require("../utils/getNotificationtype");
const NotificationIdentifier = require("../constants/Identifier");

const enumTypeValues = [
  ...new Set(Object.values(NotificationTypes).filter(Boolean)),
];

module.exports = (sequelize, Sequelize) => {
  const Notifications = sequelize.define(
    "Notifications",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      itemId: { type: Sequelize.STRING },
      type: { type: Sequelize.ENUM(...enumTypeValues), allowNull: false },
      identifier: {
        type: Sequelize.ENUM(...NotificationIdentifier),
        allowNull: false,
      },
      title: Sequelize.STRING,
      description: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: true },
      category: Sequelize.ENUM("actionable", "informative", "today"),
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      extraData: { type: Sequelize.JSON, allowNull: true },
    },
    { timestamps: true }
  );

  return Notifications;
};
