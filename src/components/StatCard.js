import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  iconColor = '#6B7280',
  iconBgColor = '#F3F4F6',
  style
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return '#10B981';
      case 'negative':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return 'trending-up';
      case 'negative':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  return (
    <Card style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconBg, { backgroundColor: iconBgColor }]}>
          {icon && (
            <Ionicons name={icon} size={20} color={iconColor} />
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <Text style={styles.value}>
        {value}
      </Text>
      
      {change && (
        <View style={styles.changeContainer}>
          <Ionicons 
            name={getChangeIcon()} 
            size={16} 
            color={getChangeColor()} 
          />
          <Text style={[styles.changeText, { color: getChangeColor() }]}>
            {change}
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default StatCard;
