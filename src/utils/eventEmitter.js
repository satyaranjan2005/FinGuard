// A simple event emitter for cross-component communication
// This allows us to broadcast events like "transaction updated" or "balance changed"

import { DeviceEventEmitter } from 'react-native';

// Event names
export const EVENTS = {
  TRANSACTION_UPDATED: 'TRANSACTION_UPDATED',
  TRANSACTION_DELETED: 'TRANSACTION_DELETED',
  TRANSACTION_ADDED: 'TRANSACTION_ADDED',
  BUDGET_UPDATED: 'BUDGET_UPDATED',
  BUDGET_RESET: 'BUDGET_RESET',
  BUDGETS_RESET: 'BUDGETS_RESET',
  BUDGETS_EXPIRED: 'BUDGETS_EXPIRED',
  BALANCE_CHANGED: 'BALANCE_CHANGED',
  NOTIFICATION_ADDED: 'NOTIFICATION_ADDED',
  FORCE_REFRESH_ALL: 'FORCE_REFRESH_ALL',
  SCREEN_FOCUSED: 'SCREEN_FOCUSED',
  AUTOPAY_DISABLED: 'AUTOPAY_DISABLED',
};

// Emit event
export const emitEvent = (eventName, data = {}) => {
  DeviceEventEmitter.emit(eventName, data);
};

// Subscribe to event
export const addEventListener = (eventName, handler) => {
  const subscription = DeviceEventEmitter.addListener(eventName, handler);
  return subscription;
};

// Unsubscribe from event
export const removeEventListener = (subscription) => {
  subscription.remove();
};

// Global force refresh function to refresh all screens
export const forceRefreshAllScreens = () => {
  console.log('EventEmitter: Triggering force refresh for all screens');
  emitEvent(EVENTS.FORCE_REFRESH_ALL);
};

// Navigation helper to trigger refresh when navigating to screens
export const navigateAndRefresh = (navigation, screenName, params = {}) => {
  console.log(`EventEmitter: Navigating to ${screenName} and triggering refresh`);
  navigation.navigate(screenName, params);
  // Small delay to ensure navigation completes before refresh
  setTimeout(() => {
    emitEvent(EVENTS.FORCE_REFRESH_ALL);
  }, 100);
};
