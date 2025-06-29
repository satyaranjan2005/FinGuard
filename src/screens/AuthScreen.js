import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input, Logo } from '../components';
import { authService } from '../services/authService';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert, 
  showInfoAlert 
} from '../services/alertService';

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
    checkExistingAuth();
  }, []);

  const checkBiometricAvailability = async () => {
    const available = await authService.isBiometricAvailable();
    setBiometricAvailable(available);
  };

  const checkExistingAuth = async () => {
    const credentials = await authService.getCredentials();
    if (credentials) {
      const biometricEnabled = await authService.isBiometricEnabled();
      if (biometricEnabled && biometricAvailable) {
        handleBiometricAuth();
      }
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const success = await authService.authenticateWithBiometrics();
      if (success) {
        const credentials = await authService.getCredentials();
        if (credentials) {
          onAuthSuccess({ email: credentials.email });
        }
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      showWarningAlert('Error', 'Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarningAlert('Error', 'Please enter a valid email address');
      return false;
    }

    if (password.length < 6) {
      showWarningAlert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (!isLogin && password !== confirmPassword) {
      showWarningAlert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await authService.login(email, password);
      } else {
        result = await authService.register(email, password);
      }

      if (result.success) {
        if (biometricAvailable) {
          showInfoAlert(
            'Biometric Authentication',
            'Would you like to enable biometric authentication for faster login?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Yes', 
                onPress: async () => {
                  await authService.setBiometricEnabled(true);
                }
              }
            ]
          );
        }
        
        onAuthSuccess(result.user);
      } else {
        showErrorAlert('Error', result.error);
      }
    } catch (error) {
      showErrorAlert('Error', 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>          {/* Logo and Header */}
          <View style={styles.headerContainer}>
            <Logo 
              size="large" 
              showText={true} 
              textColor="white" 
              style={styles.logoComponent}
            />
          </View>

          {/* Auth Form */}
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </Text>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              type="email"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              type="password"
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                type="password"
              />
            )}

            <Button
              title={loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              onPress={handleAuth}
              disabled={loading}
              style={styles.authButton}
            />

            {/* Biometric Authentication */}
            {isLogin && biometricAvailable && (
              <TouchableOpacity
                onPress={handleBiometricAuth}
                style={styles.biometricButton}
              >
                <Ionicons name="finger-print" size={24} color="#3B82F6" />
                <Text style={styles.biometricText}>
                  Use Biometric Authentication
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Switch between Login/Register */}
          <TouchableOpacity
            onPress={() => {
              setIsLogin(!isLogin);
              resetForm();
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text style={styles.switchHighlight}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What you can do with FinGuard:</Text>
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="analytics" size={24} color="white" />
                <Text style={styles.featureText}>Track Expenses</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="flag" size={24} color="white" />
                <Text style={styles.featureText}>Set Budgets</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trending-up" size={24} color="white" />
                <Text style={styles.featureText}>View Reports</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={24} color="white" />
                <Text style={styles.featureText}>Secure Data</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoComponent: {
    marginBottom: 20,
  },
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  authButton: {
    marginTop: 16,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  biometricText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  switchHighlight: {
    color: 'white',
    fontWeight: '600',
  },
  featuresContainer: {
    marginTop: 32,
  },
  featuresTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  featureItem: {
    alignItems: 'center',
    width: '22%',
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AuthScreen;
