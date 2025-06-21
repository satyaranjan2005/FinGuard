// FinGuard Permission Service
// This file handles permission requests for storage and notifications

import * as Notifications from 'expo-notifications';
import { Alert, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Storage keys for permission tracking
const PERMISSION_KEYS = {
  NOTIFICATIONS: 'permission_notifications',
  STORAGE: 'permission_storage',
  FIRST_TIME: 'app_first_time'
};

/**
 * Check if this is the first time the app is being launched
 * @returns {Promise<boolean>} True if first time launch
 */
export const isFirstTimeLaunch = async () => {
  try {
    const hasLaunchedBefore = await AsyncStorage.getItem(PERMISSION_KEYS.FIRST_TIME);
    return !hasLaunchedBefore;
  } catch (error) {
    console.error('Error checking first time launch:', error);
    return true; // Assume first time on error
  }
};

/**
 * Mark that the app has been launched before
 */
export const markAppAsLaunched = async () => {
  try {
    await AsyncStorage.setItem(PERMISSION_KEYS.FIRST_TIME, 'false');
  } catch (error) {
    console.error('Error marking app as launched:', error);
  }
};

/**
 * Request notification permissions
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestNotificationPermission = async () => {
  try {
    // Check if permission was already requested
    const alreadyRequested = await AsyncStorage.getItem(PERMISSION_KEYS.NOTIFICATIONS);
    
    // Get current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      await AsyncStorage.setItem(PERMISSION_KEYS.NOTIFICATIONS, 'granted');
      return true;
    }

    // If not already requested, show explanation dialog
    if (!alreadyRequested) {
      return new Promise((resolve) => {
        Alert.alert(
          'Enable Notifications',
          'FinGuard would like to send you notifications for:\n\n• Budget alerts when you\'re approaching limits\n• Bill payment reminders\n• Financial goal milestones\n• Weekly spending summaries\n\nYou can change this later in your device settings.',
          [
            {
              text: 'Not Now',
              onPress: async () => {
                await AsyncStorage.setItem(PERMISSION_KEYS.NOTIFICATIONS, 'denied');
                resolve(false);
              },
              style: 'cancel'
            },
            {
              text: 'Enable Notifications',
              onPress: async () => {
                const { status } = await Notifications.requestPermissionsAsync();
                const granted = status === 'granted';
                await AsyncStorage.setItem(PERMISSION_KEYS.NOTIFICATIONS, granted ? 'granted' : 'denied');
                
                if (granted) {
                  // Schedule welcome notification
                  await scheduleWelcomeNotification();
                }
                
                resolve(granted);
              }
            }
          ]
        );
      });
    }

    // If already requested before but denied, just check current status
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
    
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Request storage permissions (mainly for Android)
 * @returns {Promise<boolean>} True if permission granted
 */
export const requestStoragePermission = async () => {
  try {
    // For modern React Native and Expo, AsyncStorage doesn't require explicit permissions
    // This is more about informing the user about data storage
    const alreadyRequested = await AsyncStorage.getItem(PERMISSION_KEYS.STORAGE);
    
    if (!alreadyRequested) {
      return new Promise((resolve) => {
        Alert.alert(
          'Data Storage',
          'FinGuard will store your financial data locally on your device to:\n\n• Keep your transactions and budgets\n• Remember your preferences\n• Work offline\n\nYour data stays private and secure on your device.',
          [
            {
              text: 'Got it',
              onPress: async () => {
                await AsyncStorage.setItem(PERMISSION_KEYS.STORAGE, 'accepted');
                resolve(true);
              }
            }
          ]
        );
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting storage permission:', error);
    return true; // Assume granted since AsyncStorage usually works
  }
};

/**
 * Check notification permission status
 * @returns {Promise<boolean>} True if granted
 */
export const hasNotificationPermission = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
};

/**
 * Check storage permission status
 * @returns {Promise<boolean>} True if granted/accepted
 */
export const hasStoragePermission = async () => {
  try {
    const status = await AsyncStorage.getItem(PERMISSION_KEYS.STORAGE);
    return status === 'accepted';
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
};

/**
 * Request all necessary permissions
 * @returns {Promise<Object>} Object with permission statuses
 */
export const requestAllPermissions = async () => {
  try {
    console.log('Requesting all permissions...');
    
    // Request storage permission first
    const storageGranted = await requestStoragePermission();
    
    // Then request notification permission
    const notificationGranted = await requestNotificationPermission();
    
    const result = {
      storage: storageGranted,
      notifications: notificationGranted
    };
    
    console.log('Permission results:', result);
    return result;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return {
      storage: false,
      notifications: false
    };
  }
};

/**
 * Schedule a welcome notification
 */
const scheduleWelcomeNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Welcome to FinGuard! 🎉',
        body: 'Your financial journey starts now. Set up your first budget to get started.',
        data: { type: 'welcome' },
      },
      trigger: {
        seconds: 5, // 5 seconds delay
      },
    });
  } catch (error) {
    console.error('Error scheduling welcome notification:', error);
  }
};

/**
 * Schedule budget alert notification
 * @param {string} categoryName - Name of the budget category
 * @param {number} percentage - Percentage of budget used
 * @param {number} remaining - Remaining budget amount
 */
export const scheduleBudgetAlert = async (categoryName, percentage, remaining) => {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) return;

    let title, body;
    
    if (percentage >= 100) {
      title = '⚠️ Budget Exceeded!';
      body = `You've exceeded your ${categoryName} budget. Consider reviewing your spending.`;
    } else if (percentage >= 90) {
      title = '⚠️ Budget Alert';
      body = `You've used ${percentage.toFixed(0)}% of your ${categoryName} budget. Only ₹${remaining.toFixed(2)} remaining.`;
    } else if (percentage >= 75) {
      title = '📊 Budget Update';
      body = `You've used ${percentage.toFixed(0)}% of your ${categoryName} budget. ₹${remaining.toFixed(2)} remaining.`;
    } else {
      return; // Don't send notifications for lower percentages
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'budget_alert',
          category: categoryName,
          percentage,
          remaining
        },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error scheduling budget alert:', error);
  }
};

/**
 * Schedule goal milestone notification
 * @param {string} goalName - Name of the goal
 * @param {number} percentage - Percentage of goal completed
 * @param {number} remaining - Remaining amount needed
 */
export const scheduleGoalMilestone = async (goalName, percentage, remaining) => {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) return;

    // Only notify at certain milestones
    const milestones = [25, 50, 75, 90, 100];
    const currentMilestone = milestones.find(m => 
      percentage >= m && percentage < m + 5
    );

    if (!currentMilestone) return;

    let title, body;
    
    if (currentMilestone === 100) {
      title = '🎉 Goal Achieved!';
      body = `Congratulations! You've reached your ${goalName} goal!`;
    } else {
      title = '🎯 Goal Progress';
      body = `Great progress! You're ${currentMilestone}% towards your ${goalName} goal. ₹${remaining.toFixed(2)} to go!`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'goal_milestone',
          goal: goalName,
          percentage: currentMilestone,
          remaining
        },
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error scheduling goal milestone:', error);
  }
};

/**
 * Show permission settings alert
 */
export const showPermissionSettingsAlert = () => {
  Alert.alert(
    'Enable Notifications',
    'To receive budget alerts and financial reminders, please enable notifications in your device settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Open Settings', 
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openURL('package:com.anonymous.FinGaurd');
          }
        }
      }
    ]
  );
};

/**
 * Get notification permission status for display
 * @returns {Promise<string>} Status text
 */
export const getNotificationStatusText = async () => {
  const hasPermission = await hasNotificationPermission();
  return hasPermission ? 'Enabled' : 'Disabled';
};

/**
 * Initialize permissions on app start
 */
export const initializePermissions = async () => {
  try {
    const isFirstTime = await isFirstTimeLaunch();
    
    if (isFirstTime) {
      console.log('First time launch - requesting permissions');
      await requestAllPermissions();
      await markAppAsLaunched();
    } else {
      console.log('App launched before - checking permission status');
      const hasNotifications = await hasNotificationPermission();
      const hasStorage = await hasStoragePermission();
      
      console.log('Current permissions:', {
        notifications: hasNotifications,
        storage: hasStorage
      });
    }
  } catch (error) {
    console.error('Error initializing permissions:', error);
  }
};
