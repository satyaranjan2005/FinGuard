// A simple event emitter for cross-component communication
// This allows us to broadcast events like "transaction updated" or "balance changed"

import { DeviceEventEmitter } from 'react-native';

// Event names
export const EVENTS = {
  TRANSACTION_UPDATED: 'TRANSACTION_UPDATED',
  TRANSACTION_DELETED: 'TRANSACTION_DELETED',
  TRANSACTION_ADDED: 'TRANSACTION_ADDED',
  BUDGET_UPDATED: 'BUDGET_UPDATED',
  BALANCE_CHANGED: 'BALANCE_CHANGED',
  NOTIFICATION_ADDED: 'NOTIFICATION_ADDED',
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
