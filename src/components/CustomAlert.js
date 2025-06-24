import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../utils/colors';

const { width, height } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  buttons = [], 
  onClose 
}) => {
  const [slideAnim] = useState(new Animated.Value(height));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: colors.success.main,
          gradient: ['#10b981', '#059669'],
          bgColor: 'rgba(16, 185, 129, 0.08)',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: colors.warning.main,
          gradient: ['#f59e0b', '#d97706'],
          bgColor: 'rgba(245, 158, 11, 0.08)',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: colors.danger.main,
          gradient: ['#ef4444', '#dc2626'],
          bgColor: 'rgba(239, 68, 68, 0.08)',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          iconColor: colors.info.main,
          gradient: ['#3b82f6', '#2563eb'],
          bgColor: 'rgba(59, 130, 246, 0.08)',
        };
    }
  };

  const config = getAlertConfig();

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose) {
      onClose();
    }
  };

  const defaultButtons = buttons.length > 0 ? buttons : [
    { text: 'OK', onPress: onClose, style: 'default' }
  ];

  // Calculate dynamic heights based on button count and content
  const getAlertHeight = () => {
    const baseHeight = 180; // Header + basic content
    const messageHeight = message ? Math.max(60, (message.length / 50) * 20) : 40;
    const buttonHeight = defaultButtons.length === 3 ? 120 : 60; // Increased button area height
    const padding = 20;
    
    return Math.min(baseHeight + messageHeight + buttonHeight + padding, height * 0.85);
  };

  const alertHeight = getAlertHeight();

  // Check if this is a confirmation or destructive alert
  const isConfirmationAlert = defaultButtons.some(button => 
    button.style === 'destructive' || 
    (defaultButtons.length > 1 && (
      button.text?.toLowerCase().includes('delete') ||
      button.text?.toLowerCase().includes('remove') ||
      button.text?.toLowerCase().includes('confirm') ||
      button.text?.toLowerCase().includes('yes') ||
      button.text?.toLowerCase().includes('proceed')
    ))
  );

  const isDestructiveAlert = type === 'error' || defaultButtons.some(button => button.style === 'destructive');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.alertContainer,
            {
              height: alertHeight,
              transform: [{ translateY: slideAnim }]
            },
            defaultButtons.length === 1 && styles.singleButtonAlert,
            defaultButtons.length === 2 && styles.twoButtonAlert,
            defaultButtons.length === 3 && styles.threeButtonAlert,
          ]}
        >
          {/* Header with icon */}
          <View style={[styles.header, { backgroundColor: config.bgColor }]}>
            <View style={[styles.iconContainer, { backgroundColor: config.iconColor }]}>
              <Ionicons name={config.icon} size={28} color="white" />
            </View>
          </View>

          {/* Content */}
          <View style={[
            styles.content,
            defaultButtons.length === 1 && styles.singleButtonContent,
            defaultButtons.length === 2 && styles.twoButtonContent,
            defaultButtons.length === 3 && styles.threeButtonContent,
          ]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[
              styles.message,
              message?.length > 100 && styles.longMessage
            ]}>
              {message}
            </Text>
          </View>

          {/* Buttons */}
          <View style={[
            styles.buttonContainer,
            defaultButtons.length === 1 && styles.singleButtonContainer,
            defaultButtons.length === 2 && styles.twoButtonContainer,
            defaultButtons.length === 3 && styles.threeButtonContainer,
          ]}>
            {defaultButtons.length === 3 ? (
              // Special layout for 3 buttons: 2 on top, 1 below
              <View style={styles.threeButtonLayout}>
                <View style={styles.buttonRow}>
                  {defaultButtons.slice(0, 2).map((button, index) => {
                    const isDestructive = button.style === 'destructive';
                    const isCancel = button.style === 'cancel';
                    const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          styles.splitButton,
                          styles.threeButtonTop,
                          isDestructive && styles.destructiveButton,
                          isCancel && styles.cancelButton,
                          isPrimary && styles.primaryButton,
                          index === 0 && styles.leftSplitButton,
                          index === 1 && styles.rightSplitButton,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}
                      >
                        {isPrimary && !isCancel ? (
                          <LinearGradient
                            colors={config.gradient}
                            style={styles.gradientButton}
                          >
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                              {button.text}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <Text 
                            style={[
                              styles.buttonText,
                              isDestructive && styles.destructiveButtonText,
                              isCancel && styles.cancelButtonText,
                            ]}
                          >
                            {button.text}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                
                <View style={styles.bottomButtonRow}>
                  {(() => {
                    const button = defaultButtons[2];
                    const isDestructive = button.style === 'destructive';
                    const isCancel = button.style === 'cancel';
                    const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

                    return (
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.fullButton,
                          styles.threeButtonBottom,
                          isDestructive && styles.destructiveButton,
                          isCancel && styles.cancelButton,
                          isPrimary && styles.primaryButton,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}
                      >
                        {isPrimary && !isCancel ? (
                          <LinearGradient
                            colors={config.gradient}
                            style={styles.gradientButton}
                          >
                            <Text style={[styles.buttonText, styles.primaryButtonText]}>
                              {button.text}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <Text 
                            style={[
                              styles.buttonText,
                              isDestructive && styles.destructiveButtonText,
                              isCancel && styles.cancelButtonText,
                            ]}
                          >
                            {button.text}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              </View>
            ) : (
              // Standard layout for 1 or 2 buttons
              <View style={styles.buttonRow}>
                {defaultButtons.map((button, index) => {
                  const isDestructive = button.style === 'destructive';
                  const isCancel = button.style === 'cancel';
                  const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        defaultButtons.length === 1 ? styles.fullButton : styles.splitButton,
                        isDestructive && styles.destructiveButton,
                        isCancel && styles.cancelButton,
                        isPrimary && styles.primaryButton,
                        defaultButtons.length === 2 && index === 0 && styles.leftSplitButton,
                        defaultButtons.length === 2 && index === 1 && styles.rightSplitButton,
                      ]}
                      onPress={() => handleButtonPress(button)}
                      activeOpacity={0.7}
                    >
                      {isPrimary && !isCancel ? (
                        <LinearGradient
                          colors={config.gradient}
                          style={styles.gradientButton}
                        >
                          <Text style={[styles.buttonText, styles.primaryButtonText]}>
                            {button.text}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text 
                          style={[
                            styles.buttonText,
                            isDestructive && styles.destructiveButtonText,
                            isCancel && styles.cancelButtonText,
                          ]}
                        >
                          {button.text}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },

  // Specific heights for different button configurations
  singleButtonAlert: {
    minHeight: 240,
  },

  twoButtonAlert: {
    minHeight: 260,
  },

  threeButtonAlert: {
    minHeight: 300,
  },

  header: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 24,
    height: 88,
  },
  
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  content: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  singleButtonContent: {
    paddingBottom: 24,
    minHeight: 80,
  },

  twoButtonContent: {
    paddingBottom: 24,
    minHeight: 96,
  },

  threeButtonContent: {
    paddingBottom: 20,
    minHeight: 80,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  longMessage: {
    fontSize: 14,
    lineHeight: 20,
  },

  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },

  singleButtonContainer: {
    height: 60,
    minHeight: 60,
  },

  twoButtonContainer: {
    height: 60,
    minHeight: 60,
  },

  threeButtonContainer: {
    height: 120,
    minHeight: 120,
  },

  threeButtonLayout: {
    height: 120,
    minHeight: 120,
  },
  
  buttonRow: {
    flexDirection: 'row',
    height: 60,
    minHeight: 60,
  },
  
  bottomButtonRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    height: 60,
    minHeight: 60,
  },

  button: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    minHeight: 60,
  },

  threeButtonTop: {
    height: 60,
    minHeight: 60,
  },

  threeButtonBottom: {
    height: 60,
    minHeight: 60,
  },
  
  fullButton: {
    flex: 1,
  },
  
  splitButton: {
    flex: 1,
  },
  
  leftSplitButton: {
    borderRightWidth: 0.5,
    borderRightColor: '#f1f5f9',
  },
  
  rightSplitButton: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#f1f5f9',
  },

  primaryButton: {
    backgroundColor: 'transparent',
  },
  
  cancelButton: {
    backgroundColor: '#f8fafc',
  },
  
  destructiveButton: {
    backgroundColor: '#fef2f2',
  },

  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 44,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  primaryButtonText: {
    color: 'white',
  },
  
  cancelButtonText: {
    color: '#64748b',
  },
  
  destructiveButtonText: {
    color: '#dc2626',
  },
});

export default CustomAlert;
