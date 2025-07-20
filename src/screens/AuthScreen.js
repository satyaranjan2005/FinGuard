import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logo } from '../components';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert, 
  showInfoAlert 
} from '../services/alertService';
import { trackAuth, EVENTS as ANALYTICS_EVENTS } from '../services/analyticsService';

const AuthScreen = ({ onAuthSuccess }) => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);

  useEffect(() => {
    checkBiometricSupport();
    checkFirstTimeUser();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        setBiometricType('Face ID or Fingerprint');
      } else {
        setBiometricAvailable(false);
        showErrorAlert(
          'Biometric Authentication Required',
          'This app requires biometric authentication. Please set up fingerprint or face recognition in your device settings.'
        );
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setBiometricAvailable(false);
    }
  };

  const checkFirstTimeUser = async () => {
    try {
      const hasUser = await AsyncStorage.getItem('user_registered');
      setIsFirstTime(!hasUser);
    } catch (error) {
      console.error('Error checking first time user:', error);
    }
  };

  const handleBiometricAuth = async () => {
    if (!biometricAvailable) {
      showErrorAlert(
        'Biometric Not Available',
        'Please enable biometric authentication in your device settings.'
      );
      return;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access FinGuard',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        if (isFirstTime) {
          // First time user - register them
          await registerNewUser();
        } else {
          // Existing user - log them in
          await loginExistingUser();
        }
      } else {
        showErrorAlert('Authentication Failed', 'Biometric authentication was cancelled or failed.');
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      showErrorAlert('Error', 'An error occurred during biometric authentication.');
    }
  };

  const registerNewUser = async () => {
    try {
      const userData = {
        id: Date.now().toString(),
        registeredAt: new Date().toISOString(),
        name: 'User'
      };
      
      await AsyncStorage.setItem('user_registered', 'true');
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      
      // Track user registration
      trackAuth(ANALYTICS_EVENTS.AUTH.REGISTER, userData);
      
      showSuccessAlert('Welcome!', 'Welcome to FinGuard! You can now start managing your finances.');
      onAuthSuccess(userData);
    } catch (error) {
      console.error('Error registering user:', error);
      showErrorAlert('Error', 'Failed to register user. Please try again.');
    }
  };

  const loginExistingUser = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        
        // Track user login
        trackAuth(ANALYTICS_EVENTS.AUTH.LOGIN, userData);
        
        showSuccessAlert('Welcome Back!', 'Biometric authentication successful!');
        onAuthSuccess(userData);
      } else {
        showErrorAlert('Error', 'User data not found. Please contact support.');
      }
    } catch (error) {
      console.error('Error logging in user:', error);
      showErrorAlert('Error', 'Failed to log in. Please try again.');
    }
  };

  const getBiometricIcon = () => {
    return 'finger-print'; // Use fingerprint icon as generic biometric icon
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#4F8EF7" />
      
      <LinearGradient
        colors={['#4F8EF7', '#6C63FF']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo size="large" color="white" />
          <Text style={styles.title}>FinGuard</Text>
          <Text style={styles.subtitle}>Your Personal Finance Manager</Text>
        </View>

        {/* Authentication Section */}
        <View style={styles.authSection}>
          <View style={styles.biometricContainer}>
            <View style={styles.biometricIconContainer}>
              <Ionicons 
                name={getBiometricIcon()} 
                size={64} 
                color="white" 
              />
            </View>
            
            <Text style={styles.biometricTitle}>
              {isFirstTime ? 'Get Started' : 'Welcome Back'}
            </Text>
            
            <Text style={styles.biometricDescription}>
              {isFirstTime 
                ? `Use your ${biometricType} to set up your account and start managing your finances securely.`
                : `Use your ${biometricType} to securely access your financial data.`
              }
            </Text>

            {biometricAvailable ? (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons 
                    name={getBiometricIcon()} 
                    size={24} 
                    color="white" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>
                    {isFirstTime ? `Set up with Face ID or Fingerprint` : `Unlock with Face ID or Fingerprint`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.unavailableContainer}>
                <Ionicons name="warning" size={24} color="#FF6B6B" />
                <Text style={styles.unavailableText}>
                  Biometric authentication is not available on this device
                </Text>
                <TouchableOpacity
                  style={styles.settingsButton}
                  onPress={checkBiometricSupport}
                >
                  <Text style={styles.settingsButtonText}>Check Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your financial data is stored securely on your device
          </Text>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="rgba(255, 255, 255, 0.8)" />
            <Text style={styles.securityText}>End-to-End Encrypted</Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  authSection: {
    flex: 0.5,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  biometricContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  biometricIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  biometricTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  biometricDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  biometricButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  unavailableContainer: {
    alignItems: 'center',
    padding: 20,
  },
  unavailableText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  settingsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  securityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default AuthScreen;
