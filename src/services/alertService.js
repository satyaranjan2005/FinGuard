import { emitEvent, addEventListener, removeEventListener } from '../utils/eventEmitter';

// Event names for the alert system
export const ALERT_EVENTS = {
  SHOW_ALERT: 'SHOW_ALERT',
  HIDE_ALERT: 'HIDE_ALERT',
};

/**
 * Show a custom styled alert
 * @param {Object} alertConfig - Alert configuration
 * @param {string} alertConfig.title - Alert title
 * @param {string} alertConfig.message - Alert message
 * @param {string} alertConfig.type - Alert type (success, warning, error, info)
 * @param {Array} alertConfig.buttons - Array of button objects
 */
export const showCustomAlert = (alertConfig) => {
  emitEvent(ALERT_EVENTS.SHOW_ALERT, alertConfig);
};

/**
 * Hide the current alert
 */
export const hideCustomAlert = () => {
  emitEvent(ALERT_EVENTS.HIDE_ALERT);
};

/**
 * Show a success alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Optional buttons array
 */
export const showSuccessAlert = (title, message, buttons = null) => {
  showCustomAlert({
    title,
    message,
    type: 'success',
    buttons: buttons || [{ text: 'OK', style: 'default' }],
  });
};

/**
 * Show a warning alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Optional buttons array
 */
export const showWarningAlert = (title, message, buttons = null) => {
  showCustomAlert({
    title,
    message,
    type: 'warning',
    buttons: buttons || [{ text: 'OK', style: 'default' }],
  });
};

/**
 * Show an error alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Optional buttons array
 */
export const showErrorAlert = (title, message, buttons = null) => {
  showCustomAlert({
    title,
    message,
    type: 'error',
    buttons: buttons || [{ text: 'OK', style: 'default' }],
  });
};

/**
 * Show an info alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Optional buttons array
 */
export const showInfoAlert = (title, message, buttons = null) => {
  showCustomAlert({
    title,
    message,
    type: 'info',
    buttons: buttons || [{ text: 'OK', style: 'default' }],
  });
};

/**
 * Show a confirmation alert
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onConfirm - Callback for confirm button
 * @param {Function} onCancel - Callback for cancel button
 * @param {string} confirmText - Text for confirm button (default: 'Confirm')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 * @param {string} type - Alert type (default: 'warning')
 */
export const showConfirmationAlert = (
  title, 
  message, 
  onConfirm, 
  onCancel = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
) => {
  showCustomAlert({
    title,
    message,
    type,
    buttons: [
      { 
        text: cancelText, 
        style: 'cancel', 
        onPress: onCancel 
      },
      { 
        text: confirmText, 
        style: type === 'error' ? 'destructive' : 'default', 
        onPress: onConfirm 
      },
    ],
  });
};

/**
 * Show a destructive confirmation alert (for delete actions, etc.)
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onConfirm - Callback for confirm button
 * @param {Function} onCancel - Callback for cancel button
 * @param {string} confirmText - Text for confirm button (default: 'Delete')
 * @param {string} cancelText - Text for cancel button (default: 'Cancel')
 */
export const showDestructiveAlert = (
  title, 
  message, 
  onConfirm, 
  onCancel = null,
  confirmText = 'Delete',
  cancelText = 'Cancel'
) => {
  showCustomAlert({
    title,
    message,
    type: 'error',
    buttons: [
      { 
        text: cancelText, 
        style: 'cancel', 
        onPress: onCancel 
      },
      { 
        text: confirmText, 
        style: 'destructive', 
        onPress: onConfirm 
      },
    ],
  });
};

/**
 * Show a three-button alert (demonstration)
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Function} onFirst - Callback for first button
 * @param {Function} onSecond - Callback for second button
 * @param {Function} onThird - Callback for third button
 * @param {string} firstText - Text for first button (default: 'Option 1')
 * @param {string} secondText - Text for second button (default: 'Option 2')
 * @param {string} thirdText - Text for third button (default: 'Cancel')
 * @param {string} type - Alert type (default: 'info')
 */
export const showThreeButtonAlert = (
  title, 
  message, 
  onFirst, 
  onSecond, 
  onThird = null,
  firstText = 'Option 1',
  secondText = 'Option 2',
  thirdText = 'Cancel',
  type = 'info'
) => {
  showCustomAlert({
    title,
    message,
    type,
    buttons: [
      { 
        text: firstText, 
        style: 'default', 
        onPress: onFirst 
      },
      { 
        text: secondText, 
        style: 'default', 
        onPress: onSecond 
      },
      { 
        text: thirdText, 
        style: 'cancel', 
        onPress: onThird 
      },
    ],
  });
};

/**
 * Subscribe to alert events
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToAlerts = (callback) => {
  const showSubscription = addEventListener(ALERT_EVENTS.SHOW_ALERT, callback);
  const hideSubscription = addEventListener(ALERT_EVENTS.HIDE_ALERT, () => callback(null));
  
  return () => {
    removeEventListener(showSubscription);
    removeEventListener(hideSubscription);
  };
};
