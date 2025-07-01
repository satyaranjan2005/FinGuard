import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEYS = {
  USER_REGISTERED: 'user_registered',
  USER_DATA: 'user_data',
};

export const authService = {
  // Check if biometric authentication is available
  async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Biometric availability check error:', error);
      return false;
    }
  },

  // Get supported biometric types
  async getSupportedBiometricTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      console.error('Get biometric types error:', error);
      return [];
    }
  },

  // Authenticate with biometrics
  async authenticateWithBiometrics(promptMessage = 'Authenticate to access FinGuard') {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  // Check if user is registered
  async isUserRegistered() {
    try {
      const registered = await AsyncStorage.getItem(AUTH_KEYS.USER_REGISTERED);
      return registered === 'true';
    } catch (error) {
      console.error('Check user registration error:', error);
      return false;
    }
  },

  // Register new user
  async registerUser(userData = {}) {
    try {
      const defaultUserData = {
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
        name: 'User',
        ...userData
      };
      
      await AsyncStorage.setItem(AUTH_KEYS.USER_REGISTERED, 'true');
      await AsyncStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(defaultUserData));
      
      return { success: true, user: defaultUserData };
    } catch (error) {
      console.error('User registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  },

  // Get user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(AUTH_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user data error:', error);
      return null;
    }
  },

  // Update user data
  async updateUserData(newData) {
    try {
      const currentData = await this.getUserData();
      if (!currentData) {
        return { success: false, error: 'User not found' };
      }

      const updatedData = { ...currentData, ...newData };
      await AsyncStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(updatedData));
      
      return { success: true, user: updatedData };
    } catch (error) {
      console.error('Update user data error:', error);
      return { success: false, error: 'Update failed' };
    }
  },

  // Logout (clear all user data)
  async logout() {
    try {
      await AsyncStorage.removeItem(AUTH_KEYS.USER_REGISTERED);
      await AsyncStorage.removeItem(AUTH_KEYS.USER_DATA);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  },

  // Reset app data (for development/testing)
  async resetAppData() {
    try {
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      console.error('Reset app data error:', error);
      return { success: false, error: 'Reset failed' };
    }
  },
};

export default authService;
