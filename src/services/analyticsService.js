// Analytics Service for FinGuard
// This service handles all analytics tracking using Expo Insights

import { track } from 'expo-insights';

/**
 * Track user events in the app
 * @param {string} eventName - Name of the event
 * @param {Object} properties - Event properties/parameters
 */
export const trackEvent = (eventName, properties = {}) => {
  try {
    track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      app_version: '1.0.0', // You can get this from app.json if needed
    });
    console.log(`Analytics: Tracked event "${eventName}"`, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

/**
 * Track screen views
 * @param {string} screenName - Name of the screen
 * @param {Object} additionalData - Additional screen data
 */
export const trackScreenView = (screenName, additionalData = {}) => {
  trackEvent('screen_view', {
    screen_name: screenName,
    ...additionalData,
  });
};

/**
 * Track transaction events
 * @param {string} action - Transaction action (add, edit, delete)
 * @param {Object} transactionData - Transaction details
 */
export const trackTransaction = (action, transactionData) => {
  trackEvent('transaction', {
    action,
    type: transactionData.type,
    amount: transactionData.amount,
    category: transactionData.category || transactionData.categoryId,
    payment_mode: transactionData.paymentMode,
    is_autopay: transactionData.isAutopay || false,
  });
};

/**
 * Track budget events
 * @param {string} action - Budget action (create, edit, delete, reset)
 * @param {Object} budgetData - Budget details
 */
export const trackBudget = (action, budgetData) => {
  trackEvent('budget', {
    action,
    amount: budgetData.amount,
    category: budgetData.category || budgetData.categoryId,
    period: budgetData.period,
    auto_reset: budgetData.autoReset,
  });
};

/**
 * Track goal events
 * @param {string} action - Goal action (create, edit, delete, complete)
 * @param {Object} goalData - Goal details
 */
export const trackGoal = (action, goalData) => {
  trackEvent('goal', {
    action,
    target_amount: goalData.targetAmount,
    current_amount: goalData.currentAmount,
    deadline: goalData.deadline,
    category: goalData.category,
  });
};

/**
 * Track autopay events
 * @param {string} action - Autopay action (create, disable, execute)
 * @param {Object} autopayData - Autopay details
 */
export const trackAutopay = (action, autopayData) => {
  trackEvent('autopay', {
    action,
    frequency: autopayData.autopayFrequency,
    amount: autopayData.amount,
    type: autopayData.type,
    execution_count: autopayData.executionCount,
  });
};

/**
 * Track user authentication events
 * @param {string} action - Auth action (login, logout, register)
 * @param {Object} userData - User details (non-sensitive)
 */
export const trackAuth = (action, userData = {}) => {
  trackEvent('authentication', {
    action,
    user_name: userData.name || 'anonymous',
    registration_date: userData.registrationDate,
  });
};

/**
 * Track app performance metrics
 * @param {string} metric - Performance metric name
 * @param {number} value - Metric value
 * @param {Object} context - Additional context
 */
export const trackPerformance = (metric, value, context = {}) => {
  trackEvent('performance', {
    metric,
    value,
    ...context,
  });
};

/**
 * Track user errors and issues
 * @param {string} errorType - Type of error
 * @param {string} message - Error message
 * @param {Object} context - Error context
 */
export const trackError = (errorType, message, context = {}) => {
  trackEvent('error', {
    error_type: errorType,
    message,
    ...context,
  });
};

/**
 * Track feature usage
 * @param {string} feature - Feature name
 * @param {Object} usage - Usage data
 */
export const trackFeatureUsage = (feature, usage = {}) => {
  trackEvent('feature_usage', {
    feature,
    ...usage,
  });
};

/**
 * Track notification events
 * @param {string} action - Notification action (sent, opened, dismissed)
 * @param {Object} notificationData - Notification details
 */
export const trackNotification = (action, notificationData) => {
  trackEvent('notification', {
    action,
    type: notificationData.type,
    category: notificationData.category,
  });
};

// Pre-defined event names for consistency
export const EVENTS = {
  SCREEN: {
    DASHBOARD: 'dashboard',
    TRANSACTIONS: 'transactions',
    BUDGET: 'budget',
    ANALYTICS: 'analytics',
    GOALS: 'goals',
    PROFILE: 'profile',
    AUTH: 'authentication',
  },
  TRANSACTION: {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    VIEW: 'view',
  },
  BUDGET: {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    RESET: 'reset',
    EXPIRED: 'expired',
  },
  GOAL: {
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    COMPLETE: 'complete',
    UPDATE_PROGRESS: 'update_progress',
  },
  AUTOPAY: {
    CREATE: 'create',
    DISABLE: 'disable',
    EXECUTE: 'execute',
  },
  AUTH: {
    LOGIN: 'login',
    LOGOUT: 'logout',
    REGISTER: 'register',
  },
  FEATURE: {
    EXPORT_DATA: 'export_data',
    IMPORT_DATA: 'import_data',
    BACKUP: 'backup',
    RESTORE: 'restore',
  },
};

export default {
  trackEvent,
  trackScreenView,
  trackTransaction,
  trackBudget,
  trackGoal,
  trackAutopay,
  trackAuth,
  trackPerformance,
  trackError,
  trackFeatureUsage,
  trackNotification,
  EVENTS,
};
