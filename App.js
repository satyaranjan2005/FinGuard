import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialize } from 'expo-insights';
import analyticsConfig from './src/config/analyticsConfig';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { initializeAppData, processAutopayTransactions } from './src/services/dataService';
import { initializePermissions } from './src/services/permissionService';
import { CustomAlert } from './src/components';
import { subscribeToAlerts } from './src/services/alertService';
import { trackAuth, trackPerformance, EVENTS } from './src/services/analyticsService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Initialize Expo Insights for analytics and performance monitoring
initialize({
  enableInDevelopment: analyticsConfig.enableInDevelopment,
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
    const startTime = Date.now();
    try {
      // Initialize permissions first (for first-time users)
      await initializePermissions();
      
      // Initialize sample data
      await initializeAppData();
      
      // Process any pending autopay transactions
      await processAutopayTransactions();
      
      // Then check authentication
      await checkAuthStatus();
      
      // Track app initialization performance
      const initTime = Date.now() - startTime;
      trackPerformance('app_initialization', initTime, { success: true });
    } catch (error) {
      console.error('App initialization error:', error);
      trackPerformance('app_initialization', Date.now() - startTime, { 
        success: false, 
        error: error.message 
      });
      setIsLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      // Check if user is already registered
      const userRegistered = await AsyncStorage.getItem('user_registered');
      if (userRegistered) {
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          setUser(JSON.parse(userData));
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
    
    // Track successful authentication
    trackAuth(EVENTS.AUTH.LOGIN, userData);
  };

  const handleLogout = async () => {
    try {
      // Clear authentication data
      await AsyncStorage.removeItem('user_registered');
      await AsyncStorage.removeItem('user_data');
      setUser(null);
      setIsAuthenticated(false);
      
      // Track logout
      trackAuth(EVENTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
