/**
 * API Configuration
 *
 * IMPORTANT: Replace `API_HOST` with your PC’s LAN IPv4 address.
 * Example: 192.168.1.42 (not localhost, not 127.0.0.1) for physical phones.
 */

import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || extra.apiHost || "10.72.65.16";
const API_PORT = Number(process.env.EXPO_PUBLIC_API_PORT || extra.apiPort || 5000);

export const BASE_URL = `http://${API_HOST}:${API_PORT}`;
export const SERVER_HOST = BASE_URL; // backward-compatible alias
export const SERVER_URL = BASE_URL; // for file/asset URLs (e.g., uploads)
export const API_BASE_URL = `${BASE_URL}/api`; // for JSON API endpoints

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  CHANGE_PASSWORD: "/auth/change-password",
  PUSH_TOKEN: "/auth/push-token",

  // Users
  USERS: "/users",
  USER_BY_ID: (id) => `/users/${id}`,
  USER_DEACTIVATE: (id) => `/users/${id}/deactivate`,
  USER_ACTIVATE: (id) => `/users/${id}/activate`,
  USERS_BY_DEPARTMENT: (dept) => `/users/department/${dept}`,

  // Posts
  POSTS: "/posts",
  FEED: "/posts/feed",
  POST_BY_ID: (id) => `/posts/${id}`,
  POST_LIKE: (id) => `/posts/${id}/like`,
  POST_URGENT: (id) => `/posts/${id}/urgent`,
  POSTS_BY_USER: (userId) => `/posts/user/${userId}`,

  // Comments
  COMMENTS_BY_POST: (postId) => `/comments/post/${postId}`,
  COMMENT_BY_ID: (id) => `/comments/${id}`,

  // Events
  EVENTS: "/events",
  CALENDAR_EVENTS: "/events/calendar",
  EVENT_BY_ID: (id) => `/events/${id}`,
  EVENT_QR: (id) => `/events/${id}/qrcode`,
  EVENT_ATTENDANCE: (id) => `/events/${id}/attendance`,
  EVENT_CHECKIN: "/events/checkin",
  EVENT_CANCEL: (id) => `/events/${id}/cancel`,

  // Registrations
  REG_REGISTER: (eventId) => `/registrations/${eventId}/register`,
  REG_MY_QR: (eventId) => `/registrations/${eventId}/my-qr`,
  REG_STATUS: (eventId) => `/registrations/${eventId}/status`,
  REG_VALIDATE_QR: "/registrations/validate-qr",
  REG_LIST: (eventId) => `/registrations/${eventId}/list`,
  REG_EXPORT: (eventId) => `/registrations/${eventId}/export`,
  REG_UNREGISTER: (eventId) => `/registrations/${eventId}/unregister`,

  // Polls
  POLLS: "/polls",
  POLL_BY_ID: (id) => `/polls/${id}`,
  POLL_VOTE: (id) => `/polls/${id}/vote`,
  POLL_RESULTS: (id) => `/polls/${id}/results`,
  POLL_CLOSE: (id) => `/polls/${id}/close`,
  POLL_EXPORT: (id) => `/polls/${id}/export`,

  // Analytics
  ANALYTICS_DASHBOARD: "/analytics/dashboard",
  ANALYTICS_LOGINS: "/analytics/logins",
  ANALYTICS_USERS: "/analytics/users",
  ANALYTICS_CONTENT: "/analytics/content",
  ANALYTICS_ENGAGEMENT: "/analytics/engagement",
  ANALYTICS_COMMITTEES: "/analytics/committees",
  ANALYTICS_EVENTS: "/analytics/events",
};

// User Roles
export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  COMMITTEE: "committee",
  ADMIN: "admin",
};

// Departments
export const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Information Technology",
  "Chemical",
  "Biotechnology",
  "All",
];

// Colors
export const COLORS = {
  primary: "#6366F1", // Modern indigo
  primaryLight: "#818CF8",
  primaryDark: "#4F46E5",
  secondary: "#10B981", // Emerald
  secondaryLight: "#6EE7B7",
  accent: "#F59E0B", // Amber
  accentLight: "#FBBF24",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  dark: "#1F2937",
  gray: "#6B7280",
  gray_medium: "#9CA3AF",
  lightGray: "#E5E7EB",
  light_bg: "#F3F4F6", // For light backgrounds in dark mode
  white: "#FFFFFF",
  background: "#F9FAFB",
  card: "#FFFFFF",
  text: "#1F2937",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  urgent: "#DC2626",
};
