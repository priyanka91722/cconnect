/**
 * Notification Utility
 * Supports Expo push notifications, Gmail email, and stored notification records
 */

const { Expo } = require("expo-server-sdk");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const { sendNotificationEmail } = require("./email");

// Create a new Expo SDK client
const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
});

const buildAppLink = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const appUrl = process.env.APP_URL
    ? process.env.APP_URL.replace(/\/$/, "")
    : "";
  return appUrl ? `${appUrl}${path}` : path;
};

/**
 * Send push notification to a single user
 * @param {string} pushToken - Expo push token
 * @param {Object} notification - Notification data
 */
const sendPushNotification = async (pushToken, notification) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.warn(`Push token ${pushToken} is not a valid Expo push token`);
    return null;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
    priority: notification.priority || "high",
    channelId: notification.channelId || "default",
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    return ticket[0];
  } catch (error) {
    console.error("Error sending push notification:", error);
    return null;
  }
};

/**
 * Send push notifications to multiple users
 * @param {Array} pushTokens - Array of Expo push tokens
 * @param {Object} notification - Notification data
 */
const sendBulkPushNotifications = async (pushTokens, notification) => {
  const validTokens = pushTokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.warn("No valid push tokens provided");
    return [];
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data || {},
    priority: notification.priority || "high",
    channelId: notification.channelId || "default",
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending bulk push notifications:", error);
    }
  }

  return tickets;
};

const getNotificationRecipients = async ({
  department,
  excludedUserIds = [],
}) => {
  const query = {
    status: "active",
    is_deleted: { $ne: true },
  };

  if (department && department !== "All") {
    query.$or = [{ department }, { department: "All" }];
  }

  if (excludedUserIds.length) {
    query._id = { $nin: excludedUserIds };
  }

  return await User.find(query).select("push_token email _id");
};

const createNotificationRecords = async (users, payload) => {
  if (!users || users.length === 0) {
    return [];
  }

  const records = users.map((user) => ({
    user_id: user._id,
    created_by: payload.created_by || null,
    title: payload.title,
    message: payload.body,
    link: payload.link || null,
    type: payload.type || "general",
    department: payload.department || "All",
    data: payload.data || {},
  }));

  try {
    return await Notification.insertMany(records, { ordered: false });
  } catch (error) {
    console.error("Error storing notifications:", error);
    return [];
  }
};

const sendBulkEmailNotifications = async (users, notification) => {
  if (!users || users.length === 0) {
    return [];
  }

  const emailPromises = users
    .filter((user) => user.email)
    .map((user) =>
      sendNotificationEmail({
        to: user.email,
        title: notification.title,
        body: notification.body,
        link: buildAppLink(notification.link),
        timestamp: notification.timestamp || new Date().toISOString(),
      }),
    );

  return await Promise.allSettled(emailPromises);
};

/**
 * Send notifications to all users or department-scoped recipients
 * This sends push notifications, email notifications, and stores notification records.
 */
const sendNotificationsToUsers = async (options) => {
  const {
    title,
    body,
    link,
    type,
    data,
    department,
    excludedUserIds = [],
    created_by,
  } = options;

  try {
    const recipients = await getNotificationRecipients({
      department,
      excludedUserIds,
    });
    if (recipients.length === 0) {
      console.log("No recipients found for notifications");
      return { push: [], emails: [] };
    }

    const pushTokens = recipients
      .map((user) => user.push_token)
      .filter(Boolean);

    const timestamp = new Date().toISOString();

    const pushPromise =
      pushTokens.length > 0
        ? sendBulkPushNotifications(pushTokens, {
            title,
            body,
            data: {
              ...data,
              link: buildAppLink(link),
              timestamp,
              type,
            },
          })
        : Promise.resolve([]);

    const emailPromise = sendBulkEmailNotifications(recipients, {
      title,
      body,
      link,
      timestamp,
    });

    const createRecordsPromise = createNotificationRecords(recipients, {
      title,
      body,
      link: buildAppLink(link),
      type,
      department,
      data,
      created_by,
    });

    const [pushResult, emailResult] = await Promise.all([
      pushPromise,
      emailPromise,
      createRecordsPromise,
    ]);

    return {
      push: pushResult,
      emails: emailResult,
    };
  } catch (error) {
    console.error("Error sending notifications to users:", error);
    return { push: [], emails: [] };
  }
};

/**
 * Send notification to all users (or filtered by department)
 * @param {Object} options - Notification options
 */
const sendBulkNotifications = async (options) => {
  const { title, body, data, department, excludedUserIds = [] } = options;

  const query = {
    push_token: { $ne: null },
    status: "active",
    is_deleted: { $ne: true },
  };

  if (department && department !== "All") {
    query.$or = [{ department }, { department: "All" }];
  }

  if (excludedUserIds.length) {
    query._id = { $nin: excludedUserIds };
  }

  try {
    const users = await User.find(query).select("push_token");
    const pushTokens = users.map((user) => user.push_token).filter(Boolean);

    if (pushTokens.length === 0) {
      console.log("No users with push tokens found");
      return [];
    }

    return await sendBulkPushNotifications(pushTokens, { title, body, data });
  } catch (error) {
    console.error("Error in sendBulkNotifications:", error);
    return [];
  }
};

/**
 * Send notification to specific users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} notification - Notification data
 */
const sendNotificationToUsers = async (userIds, notification) => {
  try {
    const users = await User.find({
      _id: { $in: userIds },
      push_token: { $ne: null },
    }).select("push_token");

    const pushTokens = users.map((user) => user.push_token).filter(Boolean);

    if (pushTokens.length === 0) {
      return [];
    }

    return await sendBulkPushNotifications(pushTokens, notification);
  } catch (error) {
    console.error("Error in sendNotificationToUsers:", error);
    return [];
  }
};

/**
 * Check receipt status for sent notifications
 * @param {Array} ticketIds - Array of ticket IDs
 */
const checkNotificationReceipts = async (ticketIds) => {
  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(ticketIds);
  const receipts = [];

  for (const chunk of receiptIdChunks) {
    try {
      const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
      receipts.push(receiptChunk);
    } catch (error) {
      console.error("Error checking notification receipts:", error);
    }
  }

  return receipts;
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  sendBulkNotifications,
  sendNotificationToUsers,
  sendNotificationsToUsers,
  checkNotificationReceipts,
};
