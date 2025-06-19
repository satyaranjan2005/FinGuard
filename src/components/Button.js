import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  style,
  accessibilityLabel,
  ...props 
}) => {
  const getButtonStyle = () => {
    let baseStyle = [styles.button, styles[size]];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    } else {
      baseStyle.push(styles[variant]);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    let textStyle = [styles.text];
    
    if (variant === 'secondary' && !disabled) {
      textStyle.push(styles.secondaryText);
    } else if (disabled) {
      textStyle.push(styles.disabledText);
    } else {
      textStyle.push(styles.primaryText);
    }
    
    return textStyle;
  };
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={getButtonStyle()}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      {...props}
    >
      <Text style={getTextStyle()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  success: {
    backgroundColor: '#10B981',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  disabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#3B82F6',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default Button;
