import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { authService } from './src/services/authService';
import { initializeAppData } from './src/services/dataService';
import { initializePermissions } from './src/services/permissionService';
import { CustomAlert } from './src/components';
import { subscribeToAlerts } from './src/services/alertService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Subscribe to global alert events
    const unsubscribe = subscribeToAlerts((config) => {
      setAlertConfig(config);
    });

    return unsubscribe;
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize permissions first (for first-time users)
      await initializePermissions();
      
      // Initialize sample data
      await initializeAppData();
      
      // Then check authentication
      await checkAuthStatus();
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const credentials = await authService.getCredentials();
      if (credentials) {
        const biometricEnabled = await authService.isBiometricEnabled();
        const biometricAvailable = await authService.isBiometricAvailable();
        
        if (biometricEnabled && biometricAvailable) {
          // Try biometric authentication
          const success = await authService.authenticateWithBiometrics();
          if (success) {
            setUser({ email: credentials.email });
            setIsAuthenticated(true);
          }
        } else {
          // Auto-login with stored credentials
          setUser({ email: credentials.email });
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    // You could add a loading screen here
    return null;
  }

  return (
    <SafeAreaProvider>
      {isAuthenticated ? (
        <AppNavigator user={user} onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
      <StatusBar style="auto" translucent/>
      
      {/* Global Custom Alert */}
      <CustomAlert
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        type={alertConfig?.type}
        buttons={alertConfig?.buttons}
        onClose={() => setAlertConfig(null)}
      />
    </SafeAreaProvider>
  );
}
