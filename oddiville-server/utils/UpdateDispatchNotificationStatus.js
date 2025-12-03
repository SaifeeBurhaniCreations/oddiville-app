export async function updateDispatchOrderNotificationStatus(id, newStatus) {
  const notification = await NotificationsClient.findOne({
    where: {
      itemId: id,
    },
  });

  if (!notification || !notification.extraData) return false;

  notification.extraData.status = newStatus;
  notification.changed("extraData", true);
  await notification.save();
  return true;
}
