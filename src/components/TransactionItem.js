import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TransactionItem = React.memo(({ transaction, onPress, hideChevron }) => {
  // Enhanced check if transaction is defined before destructuring
  if (!transaction || typeof transaction !== 'object') {
    console.warn('Invalid transaction object provided to TransactionItem');
    return null; // Don't render anything if transaction is undefined or invalid
  }
  
  // Safely extract properties with defaults
  const { 
    title = transaction.description || 'Unknown Transaction',
    description = transaction.description || 'Unknown Transaction',
    amount = 0,
    type = 'expense',
    category = 'Other',
    date = new Date(),
    icon = null,
    notes = '',
    categoryId = ''
  } = transaction;
  
  // Use description as the main display text if title is not available
  const displayTitle = title !== 'Unknown Transaction' ? title : description;
  
  // Format date to readable string
  const formatDate = (dateObj) => {
    if (!dateObj) {
      return 'Unknown date';
    }
    
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const transactionDate = new Date(dateObj);
    transactionDate.setHours(0, 0, 0, 0);
    
    if (transactionDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (transactionDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
    // Determine icon and colors based on transaction type
  const getIconName = () => {
    if (icon) return icon;
    
    // Check if category is defined and is a string before using toLowerCase
    if (!category || typeof category !== 'string') {
      return 'help-circle'; // Default fallback icon
    }
    
    switch (category.toLowerCase()) {
      case 'food':
        return 'fast-food';
      case 'transportation':
        return 'car';
      case 'utilities':
        return 'flash';
      case 'housing':
        return 'home';
      case 'entertainment':
        return 'film';
      case 'healthcare':
        return 'medical';
      case 'salary':
      case 'income':
        return 'cash';
      default:
        return type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle';
    }
  };
  
  const getIconBackgroundColor = () => {
    switch (type) {
      case 'income':
        return '#E6F7E9'; // Light green
      case 'expense':
        return '#FEECEC'; // Light red
      default:
        return '#E6E6E6';
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'income':
        return '#4CAF50'; // Green
      case 'expense':
        return '#F44336'; // Red
      default:
        return '#757575';
    }
  };
  
  const getAmountColor = () => {
    return type === 'income' ? '#4CAF50' : '#F44336';
  };
    try {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => {
          if (typeof onPress === 'function') {
            onPress(transaction);
          }
        }}
        activeOpacity={0.6}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconBackgroundColor() }]}>
          <Ionicons name={getIconName()} size={18} color={getIconColor()} />
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
          <Text style={styles.category}>{category || 'Other'} • {formatDate(date)}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: getAmountColor() }]}>
            {type === 'income' ? '+' : '-'}₹{Number(isNaN(amount) ? 0 : amount).toFixed(2)}
          </Text>
          {/* {!hideChevron && (
            <Ionicons name="chevron-forward" size={16} color="#9E9E9E" style={styles.chevron} />
          )} */}
        </View>
      </TouchableOpacity>
    );
  } catch (error) {
    console.error('Error rendering TransactionItem:', error);
    return null;
  }
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#757575',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  chevron: {
    opacity: 0.6,
  }
});

export default TransactionItem;
