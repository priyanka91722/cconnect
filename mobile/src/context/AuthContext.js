/**
 * Auth Context
 * Manages authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { authAPI } from "../services/api";
import { getItemAsync, setItemAsync, deleteItemAsync } from "../utils/storage";
import { API_BASE_URL, BASE_URL } from "../config/constants";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    // Network test for LAN debugging visibility (don't crash on failure)
    fetch(`${BASE_URL}/`)
      .then((res) => res.text())
      .then((data) => console.log("TEST SUCCESS:", data))
      .catch((err) =>
        console.log("TEST FAIL (expected on phone):", err.message),
      );

    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getItemAsync("authToken");
      const userData = await getItemAsync("user");

      if (token && userData) {
        setUser(JSON.parse(userData));

        // Verify token is still valid
        try {
          const response = await authAPI.getMe();
          const updatedUser = response.data.data.user;
          setUser(updatedUser);
          await setItemAsync("user", JSON.stringify(updatedUser));
        } catch (err) {
          // Only logout if we get a 401 (token truly invalid)
          // For network errors, keep the cached user
          if (err.response?.status === 401) {
            await logout();
          } else {
            console.log(
              "Token verification failed (network issue), keeping cached session",
            );
          }
        }
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const registerForPushNotifications = async () => {
    if (Platform.OS === "web") {
      console.log("Push notifications not supported on web");
      return null;
    }

    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4F46E5",
        });
      }

      return token;
    } catch (err) {
      console.error("Error getting push token:", err);
      return null;
    }
  };

  const login = async (pid, password) => {
    try {
      setError(null);

      console.log(
        "[Login] API URL:",
        `${API_BASE_URL}/auth/login`,
      );
      console.log("[Login] Request payload:", { pid, password });
      const response = await authAPI.login({ pid, password });
      const { user: userData, token } = response.data.data;
      console.log("[Login] Response data:", response.data);

      // Store auth data
      await setItemAsync("authToken", token);
      await setItemAsync("user", JSON.stringify(userData));

      setUser(userData);

      // Register for push notifications
      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        await authAPI.updatePushToken(pushToken);
      }

      return { success: true };
    } catch (err) {
      console.log("ERROR:", err);
      console.log("ERROR MESSAGE:", err?.message);
      console.log("ERROR RESPONSE:", err?.response?.data);
      alert(err?.response?.data?.message || err?.message || "Unknown error");

      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);

      console.log("[Register] Request payload being sent:", {
        name: userData?.name,
        email: userData?.email,
        pid: userData?.pid,
        hasPassword: !!userData?.password,
        role: userData?.role,
        department: userData?.department,
      });
      console.log(
        "[Register] API URL:",
        `${API_BASE_URL}/auth/register`,
      );

      const response = await authAPI.register(userData);
      const { user: newUser, token } = response.data.data;
      console.log("[Register] Response data:", response.data);

      // Store auth data
      await setItemAsync("authToken", token);
      await setItemAsync("user", JSON.stringify(newUser));

      setUser(newUser);

      // Register for push notifications
      const pushToken = await registerForPushNotifications();
      if (pushToken) {
        await authAPI.updatePushToken(pushToken);
      }

      return { success: true };
    } catch (err) {
      console.log("ERROR:", err);
      console.log("ERROR MESSAGE:", err?.message);
      console.log("ERROR RESPONSE:", err?.response?.data);
      alert(err?.response?.data?.message || err?.message || "Unknown error");

      console.log("[Register] Error response:", {
        message: err?.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method,
        payload: err.config?.data,
      });

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Call logout API to clear push token
      await authAPI.logout();
    } catch (err) {
      // Continue with local logout even if API fails
    }

    // Clear local storage
    await deleteItemAsync("authToken");
    await deleteItemAsync("user");
    setUser(null);
  };

  const updateUser = async (userData) => {
    setUser(userData);
    await setItemAsync("user", JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
