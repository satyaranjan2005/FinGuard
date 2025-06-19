import React from 'react';
import { View, StyleSheet } from 'react-native';

const Card = ({ 
  children, 
  variant = 'default',
  elevation = 'medium',
  style,
  ...props 
}) => {
  const getCardStyle = () => {
    let cardStyle = [styles.card];
    
    // Apply variant style
    switch (variant) {
      case 'primary':
        cardStyle.push(styles.primary);
        break;
      case 'success':
        cardStyle.push(styles.success);
        break;
      case 'warning':
        cardStyle.push(styles.warning);
        break;
      case 'danger':
        cardStyle.push(styles.danger);
        break;
      case 'gradient':
        cardStyle.push(styles.gradient);
        break;
      default:
        cardStyle.push(styles.default);
    }
    
    // Apply elevation style
    switch (elevation) {
      case 'none':
        cardStyle.push(styles.elevationNone);
        break;
      case 'low':
        cardStyle.push(styles.elevationLow);
        break;
      case 'high':
        cardStyle.push(styles.elevationHigh);
        break;
      default:
        cardStyle.push(styles.elevationMedium);
    }
    
    if (style) {
      cardStyle.push(style);
    }
    
    return cardStyle;
  };

  return (
    <View style={getCardStyle()} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  default: {
    backgroundColor: '#FFFFFF',
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  success: {
    backgroundColor: '#10B981',
  },
  warning: {
    backgroundColor: '#F59E0B',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  gradient: {
    backgroundColor: '#3B82F6',
  },
  elevationNone: {
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  elevationLow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  elevationMedium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elevationHigh: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
});

export default Card;
