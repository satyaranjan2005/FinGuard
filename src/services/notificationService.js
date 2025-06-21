// FinGuard Notification Management Service
// This file handles notification history storage, retrieval, and management

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { hasNotificationPermission } from './permissionService';
import { emitEvent, EVENTS } from '../utils/eventEmitter';

// Storage keys
const STORAGE_KEYS = {
  NOTIFICATION_HISTORY: 'notification_history',
  NOTIFICATION_SETTINGS: 'notification_settings'
};

// Default notification settings
const DEFAULT_SETTINGS = {
  budgetAlerts: true,
  goalReminders: true,
  billReminders: true,
  weeklyReports: false,
  monthlyReports: true
};

/**
 * Get notification settings
 * @returns {Promise<Object>} Notification settings
 */
export const getNotificationSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save notification settings
 * @param {Object} settings - Settings to save
 */
export const saveNotificationSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

/**
 * Send a system notification that appears in device status bar
 * @param {Object} notification - Notification object
 */
const sendSystemNotification = async (notification) => {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission, skipping system notification');
      return;
    }

    // Schedule the notification to appear immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.message,
        data: notification.data || {},
        sound: 'default',
        badge: await getUnreadCount() + 1, // Update badge count
      },
      trigger: null, // Show immediately
    });
    
    console.log('System notification sent:', notification.title);
  } catch (error) {
    console.error('Error sending system notification:', error);
  }
};

/**
 * Add a notification to history and send system notification
 * @param {Object} notification - Notification object
 */
export const addNotificationToHistory = async (notification) => {
  try {
    const history = await getNotificationHistory();
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      time: new Date().toISOString(),
      read: false
    };
    
    // Add to beginning of array (most recent first)
    const updatedHistory = [newNotification, ...history];
    
    // Keep only last 100 notifications
    const trimmedHistory = updatedHistory.slice(0, 100);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(trimmedHistory));
    
    // Send system notification to device status bar
    await sendSystemNotification(newNotification);
    
    // Emit event for notification added
    emitEvent(EVENTS.NOTIFICATION_ADDED, newNotification);
    
    return newNotification;
  } catch (error) {
    console.error('Error adding notification to history:', error);
    return null;
  }
};

/**
 * Get notification history
 * @returns {Promise<Array>} Array of notifications
 */
export const getNotificationHistory = async () => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - ID of notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return [];
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.map(notification => 
      ({ ...notification, read: true })
    );
    
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return [];
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY, JSON.stringify([]));
    return [];
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return [];
  }
};

/**
 * Get unread notification count
 * @returns {Promise<number>} Number of unread notifications
 */
export const getUnreadCount = async () => {
  try {
    const history = await getNotificationHistory();
    return history.filter(notification => !notification.read).length;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Format time for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted time string
 */
export const formatNotificationTime = (timestamp) => {
  try {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now - notificationTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays === 1) {
      return '1 day ago';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  } catch (error) {
    console.error('Error formatting notification time:', error);
    return 'Unknown';
  }
};

/**
 * Create budget alert notification
 * @param {string} categoryName - Budget category name
 * @param {number} percentage - Percentage used
 * @param {number} remaining - Remaining amount
 * @param {number} spent - Amount spent
 */
export const createBudgetAlert = async (categoryName, percentage, remaining, spent) => {
  try {
    const settings = await getNotificationSettings();
    if (!settings.budgetAlerts) return;

    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) return;

    let title, message, type, icon;
    
    if (percentage >= 100) {
      title = 'Budget Exceeded';
      message = `You have exceeded your ${categoryName} budget by ₹${Math.abs(remaining).toFixed(2)}`;
      type = 'warning';
      icon = 'warning';
    } else if (percentage >= 90) {
      title = 'Budget Alert';
      message = `You've used ${percentage.toFixed(0)}% of your ${categoryName} budget. Only ₹${remaining.toFixed(2)} remaining`;
      type = 'warning';
      icon = 'warning';
    } else if (percentage >= 75) {
      title = 'Budget Update';
      message = `You have ₹${remaining.toFixed(2)} remaining in your ${categoryName} budget`;
      type = 'info';
      icon = 'information-circle';
    } else {
      return; // Don't create notification for lower percentages
    }

    const notification = {
      title,
      message,
      type,
      icon,
      data: {
        type: 'budget_alert',
        category: categoryName,
        percentage,
        remaining,
        spent
      }
    };

    // Add to history
    const savedNotification = await addNotificationToHistory(notification);

    // Schedule system notification
    if (savedNotification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: notification.data,
        },
        trigger: null, // Send immediately
      });
    }

    return savedNotification;
  } catch (error) {
    console.error('Error creating budget alert:', error);
    return null;
  }
};

/**
 * Create goal milestone notification
 * @param {string} goalName - Goal name
 * @param {number} percentage - Percentage completed
 * @param {number} remaining - Remaining amount
 */
export const createGoalMilestone = async (goalName, percentage, remaining) => {
  try {
    const settings = await getNotificationSettings();
    if (!settings.goalReminders) return;

    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) return;

    // Only notify at certain milestones
    const milestones = [25, 50, 75, 90, 100];
    const currentMilestone = milestones.find(m => 
      percentage >= m && percentage < m + 5
    );

    if (!currentMilestone) return;

    let title, message, type, icon;
    
    if (currentMilestone === 100) {
      title = 'Goal Achievement';
      message = `Congratulations! You reached your ${goalName} goal`;
      type = 'success';
      icon = 'trophy';
    } else {
      title = 'Goal Progress';
      message = `Great progress! You're ${currentMilestone}% towards your ${goalName} goal`;
      type = 'success';
      icon = 'checkmark-circle';
    }

    const notification = {
      title,
      message,
      type,
      icon,
      data: {
        type: 'goal_milestone',
        goal: goalName,
        percentage: currentMilestone,
        remaining
      }
    };

    // Add to history
    const savedNotification = await addNotificationToHistory(notification);

    // Schedule system notification
    if (savedNotification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: notification.data,
        },
        trigger: null,
      });
    }

    return savedNotification;
  } catch (error) {
    console.error('Error creating goal milestone:', error);
    return null;
  }
};

/**
 * Create income notification
 * @param {number} amount - Income amount
 * @param {string} source - Income source
 */
export const createIncomeNotification = async (amount, source = 'account') => {
  try {
    const notification = {
      title: 'Income Added',
      message: `₹${amount.toFixed(2)} has been added to your ${source}`,
      type: 'success',
      icon: 'cash',
      data: {
        type: 'income_added',
        amount,
        source
      }
    };

    return await addNotificationToHistory(notification);
  } catch (error) {
    console.error('Error creating income notification:', error);
    return null;
  }
};

/**
 * Create weekly/monthly report notification
 * @param {string} reportType - 'weekly' or 'monthly'
 * @param {Object} reportData - Report summary data
 */
export const createReportNotification = async (reportType, reportData) => {
  try {
    const settings = await getNotificationSettings();
    const settingKey = `${reportType}Reports`;
    
    if (!settings[settingKey]) return;

    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) return;

    const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    const message = `Your ${reportType} financial summary is ready. Total spent: ₹${reportData.totalSpent?.toFixed(2) || 0}`;

    const notification = {
      title,
      message,
      type: 'info',
      icon: 'document-text',
      data: {
        type: `${reportType}_report`,
        ...reportData
      }
    };

    const savedNotification = await addNotificationToHistory(notification);

    if (savedNotification) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: notification.data,
        },
        trigger: null,
      });
    }

    return savedNotification;
  } catch (error) {
    console.error(`Error creating ${reportType} report notification:`, error);
    return null;  }
};

/**
 * Create a test notification (for demonstration purposes)
 */
export const createTestNotification = async () => {
  try {
    // First check if we have permission
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      console.log('No notification permission for test notification');
      throw new Error('Notification permission required. Please enable notifications in settings.');
    }

    const testNotifications = [
      {
        title: 'Budget Alert',
        message: 'You have used 85% of your Food budget. ₹1,200 remaining.',
        type: 'warning',
        icon: 'warning',
        data: { type: 'test_budget_alert' }
      },
      {
        title: 'Income Added',
        message: 'Salary of ₹75,000 has been credited to your account',
        type: 'success',
        icon: 'cash',
        data: { type: 'test_income' }
      },
      {
        title: 'Goal Progress',
        message: 'Great progress! You\'re 75% towards your Emergency Fund goal',
        type: 'success',
        icon: 'trophy',
        data: { type: 'test_goal' }
      },
      {
        title: 'FinGuard Notification Test',
        message: 'This is a test notification to verify the system is working correctly!',
        type: 'info',
        icon: 'information-circle',
        data: { type: 'test_system' }
      }
    ];

    // Pick a random test notification
    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
    
    const savedNotification = await addNotificationToHistory(randomNotification);
    console.log('Test notification created:', savedNotification);
    
    return savedNotification;
  } catch (error) {
    console.error('Error creating test notification:', error);
    return null;
  }
};

/**
 * Send a direct system notification for testing (bypasses history)
 */
export const sendDirectTestNotification = async () => {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission required. Please enable notifications in device settings.');
    }

    console.log('Sending direct test notification...');
    
    // Send notification directly to system
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'FinGuard Test',
        body: 'This is a direct test notification from FinGuard! 🎉',
        data: { test: true },
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Show immediately
    });
    
    console.log('Direct notification sent with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error sending direct test notification:', error);
    throw error;
  }
};

export default {
  getNotificationSettings,
  saveNotificationSettings,
  addNotificationToHistory,
  getNotificationHistory,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  getUnreadCount,
  formatNotificationTime,
  createBudgetAlert,
  createGoalMilestone,
  createIncomeNotification,
  createReportNotification
};
