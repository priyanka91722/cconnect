const Notification = require("../models/notification.model");
const { asyncHandler, AppError } = require("../middleware/error.middleware");
const { HTTP_STATUS, PAGINATION } = require("../config/constants");

const getNotifications = asyncHandler(async (req, res) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    unread,
  } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const query = { user_id: req.user._id };
  if (unread === "true") {
    query.is_read = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Notification.countDocuments(query),
  ]);

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    data: {
      notifications,
      pagination: {
        current_page: parseInt(page, 10),
        total_pages: Math.ceil(total / parseInt(limit, 10)),
        total_notifications: total,
        has_more: skip + notifications.length < total,
      },
    },
  });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user_id: req.user._id },
    { is_read: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError("Notification not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    status: "success",
    message: "Notification marked as read",
    data: { notification },
  });
});

module.exports = {
  getNotifications,
  markNotificationAsRead,
};
