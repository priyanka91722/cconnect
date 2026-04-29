const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: "general",
    },
    department: {
      type: String,
      default: "All",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    is_read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
