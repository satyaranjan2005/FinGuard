import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const AUTH_KEYS = {
  USER_CREDENTIALS: 'user_credentials',
  BIOMETRIC_ENABLED: 'biometric_enabled',
};

export const authService = {
  // Check if biometric authentication is available
  async isBiometricAvailable() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  // Authenticate with biometrics
  async authenticateWithBiometrics() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access FinGuard',
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
      });
      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  },

  // Save user credentials securely
  async saveCredentials(email, password) {
    try {
      const credentials = { email, password, createdAt: new Date().toISOString() };
      await SecureStore.setItemAsync(AUTH_KEYS.USER_CREDENTIALS, JSON.stringify(credentials));
      return true;
    } catch (error) {
      console.error('Save credentials error:', error);
      return false;
    }
  },

  // Get stored credentials
  async getCredentials() {
    try {
      const credentials = await SecureStore.getItemAsync(AUTH_KEYS.USER_CREDENTIALS);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Get credentials error:', error);
      return null;
    }
  },

  // Validate login
  async login(email, password) {
    const storedCredentials = await this.getCredentials();
    if (storedCredentials && storedCredentials.email === email && storedCredentials.password === password) {
      return { success: true, user: { email } };
    }
    return { success: false, error: 'Invalid credentials' };
  },

  // Register new user
  async register(email, password) {
    const existingCredentials = await this.getCredentials();
    if (existingCredentials) {
      return { success: false, error: 'User already exists' };
    }
    
    const saved = await this.saveCredentials(email, password);
    if (saved) {
      return { success: true, user: { email } };
    }
    return { success: false, error: 'Registration failed' };
  },

  // Enable/disable biometric authentication
  async setBiometricEnabled(enabled) {
    try {
      await SecureStore.setItemAsync(AUTH_KEYS.BIOMETRIC_ENABLED, enabled.toString());
      return true;
    } catch (error) {
      console.error('Set biometric enabled error:', error);
      return false;
    }
  },

  // Check if biometric is enabled
  async isBiometricEnabled() {
    try {
      const enabled = await SecureStore.getItemAsync(AUTH_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch (error) {
      console.error('Check biometric enabled error:', error);
      return false;
    }
  },

  // Logout
  async logout() {
    try {
      await SecureStore.deleteItemAsync(AUTH_KEYS.USER_CREDENTIALS);
      await SecureStore.deleteItemAsync(AUTH_KEYS.BIOMETRIC_ENABLED);
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },
};

export default authService;
