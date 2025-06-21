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
          bgColor: 'rgba(16, 185, 129, 0.1)',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: colors.warning.main,
          gradient: ['#f59e0b', '#d97706'],
          bgColor: 'rgba(245, 158, 11, 0.1)',
        };
      case 'error':
        return {
          icon: 'close-circle',
          iconColor: colors.danger.main,
          gradient: ['#ef4444', '#dc2626'],
          bgColor: 'rgba(239, 68, 68, 0.1)',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          iconColor: colors.info.main,
          gradient: ['#3b82f6', '#2563eb'],
          bgColor: 'rgba(59, 130, 246, 0.1)',
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
  const needsExtraHeight = isConfirmationAlert || isDestructiveAlert;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>        <Animated.View 
          style={[
            styles.alertContainer,
            defaultButtons.length === 1 && styles.singleButtonAlert,
            defaultButtons.length === 2 && styles.twoButtonAlert,
            defaultButtons.length === 3 && styles.threeButtonAlert,
            needsExtraHeight && defaultButtons.length === 1 && styles.confirmationSingleButtonAlert,
            needsExtraHeight && defaultButtons.length === 2 && styles.confirmationTwoButtonAlert,
            needsExtraHeight && defaultButtons.length === 3 && styles.confirmationThreeButtonAlert,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header with icon */}
          <View style={[styles.header, { backgroundColor: config.bgColor }]}>            <View style={[styles.iconContainer, { backgroundColor: config.iconColor }]}>
              <Ionicons name={config.icon} size={32} color="white" />
            </View>
          </View>          {/* Content */}
          <View style={[
            styles.content,
            defaultButtons.length === 1 && styles.singleButtonContent,
            defaultButtons.length === 2 && styles.twoButtonContent,
            defaultButtons.length === 3 && styles.threeButtonContent
          ]}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>          {/* Buttons */}
          <View style={[
            styles.buttonContainer,
            defaultButtons.length === 1 && styles.singleButtonContainer,
            defaultButtons.length === 2 && styles.twoButtonContainer,
            defaultButtons.length === 3 && styles.threeButtonContainer,
            needsExtraHeight && styles.confirmationButtonContainer
          ]}>
            {defaultButtons.length === 3 ? (
              // Special layout for 3 buttons: 2 on top, 1 below
              <View>
                <View style={styles.buttonRow}>
                  {defaultButtons.slice(0, 2).map((button, index) => {
                    const isDestructive = button.style === 'destructive';
                    const isCancel = button.style === 'cancel';
                    const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

                    return (                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          styles.twoButtonLayout,
                          needsExtraHeight && styles.confirmationButton,
                          isDestructive && styles.destructiveButton,
                          isCancel && styles.cancelButton,
                          isPrimary && styles.primaryButton,
                          index === 0 && styles.firstButtonInRow,
                          index === 1 && styles.lastButtonInRow,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.8}
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
                </View>                <View style={styles.singleButtonRow}>
                  {(() => {
                    const button = defaultButtons[2];
                    const isDestructive = button.style === 'destructive';
                    const isCancel = button.style === 'cancel';
                    const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

                    return (                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.fullWidthButton,
                          needsExtraHeight && styles.confirmationButton,
                          isDestructive && styles.destructiveButton,
                          isCancel && styles.cancelButton,
                          isPrimary && styles.primaryButton,
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.8}
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
              defaultButtons.map((button, index) => {
                const isDestructive = button.style === 'destructive';
                const isCancel = button.style === 'cancel';
                const isPrimary = button.style === 'default' || (!isDestructive && !isCancel);

                return (                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      needsExtraHeight && styles.confirmationButton,
                      isDestructive && styles.destructiveButton,
                      isCancel && styles.cancelButton,
                      isPrimary && styles.primaryButton,
                      defaultButtons.length === 1 && styles.singleButton,
                      index === 0 && defaultButtons.length > 1 && styles.firstButton,
                      index === defaultButtons.length - 1 && defaultButtons.length > 1 && styles.lastButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
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
              })
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24, // Increased horizontal padding
    paddingVertical: 32, // Added vertical padding for better spacing
  },  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 18, // Slightly increased border radius
    width: '100%',
    maxWidth: Math.min(360, width * 0.92), // Increased width for better button visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 }, // Enhanced shadow
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
    marginVertical: 16, // Added vertical margin for better spacing
  },  singleButtonAlert: {
    minHeight: 240, // Standard height for single button alerts
  },
  twoButtonAlert: {
    minHeight: 260, // Standard height for two button alerts
  },
  threeButtonAlert: {
    minHeight: 320, // Standard height for three button alerts
  },
  confirmationSingleButtonAlert: {
    minHeight: 300, // Extra height for confirmation/destructive single button alerts
  },
  confirmationTwoButtonAlert: {
    minHeight: 320, // Extra height for confirmation/destructive two button alerts
  },
  confirmationThreeButtonAlert: {
    minHeight: 400, // Extra height for confirmation/destructive three button alerts
  },header: {
    alignItems: 'center',
    paddingVertical: 24, // Increased vertical padding
    paddingHorizontal: 24, // Increased horizontal padding
  },  iconContainer: {
    width: 60, // Slightly increased size
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Enhanced shadow
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 4, // Added bottom margin
  },  content: {
    paddingHorizontal: 20, // Standard horizontal padding
    paddingBottom: 20, // Standard bottom padding
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 60, // Standard minimum height for content area
  },
  singleButtonContent: {
    paddingBottom: 24, // Standard spacing for single button
  },
  twoButtonContent: {
    paddingBottom: 22, // Standard spacing for two buttons
  },
  threeButtonContent: {
    paddingBottom: 20, // Standard spacing for three buttons
  },title: {
    fontSize: 19, // Slightly increased font size
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8, // Increased margin for better spacing
    lineHeight: 24, // Added line height for better text spacing
  },
  message: {
    fontSize: 15, // Slightly increased font size
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22, // Increased line height for better readability
    paddingHorizontal: 4, // Added horizontal padding
  },  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 8, // Standard top margin
  },
  singleButtonContainer: {
    paddingBottom: 16, // Standard bottom padding for single button
  },
  twoButtonContainer: {
    paddingBottom: 14, // Standard bottom padding for two buttons
  },
  threeButtonContainer: {
    paddingBottom: 12, // Standard bottom padding for three buttons
  },
  confirmationButtonContainer: {
    marginTop: 12, // Extra top margin for confirmation/destructive alerts
    paddingBottom: 8, // Additional bottom padding for confirmation/destructive alerts
  },  buttonRow: {
    flexDirection: 'row',
  },
  singleButtonRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },button: {
    flex: 1,
    paddingVertical: 14, // Standard vertical padding
    paddingHorizontal: 12, // Standard horizontal padding
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // Standard minimum height for all buttons
  },
  confirmationButton: {
    paddingVertical: 18, // Enhanced padding for confirmation/destructive buttons
    paddingHorizontal: 16, // Enhanced horizontal padding
    minHeight: 64, // Increased height for confirmation/destructive buttons
  },twoButtonLayout: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  firstButtonInRow: {
    borderRightWidth: 0.5,
    borderRightColor: '#f1f5f9',
  },
  lastButtonInRow: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#f1f5f9',
  },
  singleButton: {
    borderRadius: 0,
  },
  firstButton: {
    borderRightWidth: 0.5,
    borderRightColor: '#f1f5f9',
  },
  lastButton: {
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
  },  gradientButton: {
    paddingVertical: 10, // Standard padding for gradient buttons
    paddingHorizontal: 20, // Standard horizontal padding
    borderRadius: 10, // Standard border radius
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70, // Standard minimum width
  },
  buttonText: {
    fontSize: 15, // Slightly increased font size for better readability
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20, // Added line height
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
