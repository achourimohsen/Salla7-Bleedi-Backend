const asyncHandler = require("express-async-handler")
const Notification = require('../models/Notification');


/**
 * Create a new notification
 * @param {ObjectId} recipient - The ID of the user who will receive the notification
 * @param {String} content - The content of the notification
 * @param {ObjectId} reportId - The ID of the report related to the notification
 */
module.exports.createNotification   = asyncHandler(async(recipient, content, reportId, io) => {
  const notification = new Notification({
      recipient,
      content,
      reportId
  });

  await notification.save();

  // إرسال الإشعار عبر socket.io
  if (io) {
    io.to(recipient.toString()).emit('newNotification', notification);
}
})

module.exports.getAllNotifCtrl = asyncHandler(async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId });
        res.json(notifications);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
})
