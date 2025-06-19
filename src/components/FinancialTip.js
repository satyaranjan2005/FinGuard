import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FinancialTip = ({ tip, onClose }) => {
  const getTipIcon = (category) => {
    switch (category) {
      case 'savings': return 'piggy-bank';
      case 'investment': return 'trending-up';
      case 'budgeting': return 'calculator';
      case 'debt': return 'card';
      default: return 'bulb';
    }
  };

  const getTipColor = (category) => {
    switch (category) {
      case 'savings': return '#10b981';
      case 'investment': return '#3b82f6';
      case 'budgeting': return '#f59e0b';
      case 'debt': return '#ef4444';
      default: return '#6366f1';
    }
  };

  return (
    <View style={[styles.tipContainer, { borderLeftColor: getTipColor(tip.category) }]}>
      <View style={styles.tipHeader}>
        <View style={styles.tipIconContainer}>
          <Ionicons 
            name={getTipIcon(tip.category)} 
            size={20} 
            color={getTipColor(tip.category)} 
          />
        </View>
        <View style={styles.tipTitleContainer}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipCategory}>{tip.category.toUpperCase()}</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.tipContent}>{tip.content}</Text>
      {tip.action && (
        <TouchableOpacity style={styles.tipAction}>
          <Text style={[styles.tipActionText, { color: getTipColor(tip.category) }]}>
            {tip.action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tipContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipTitleContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  tipCategory: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  tipContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    marginBottom: 8,
  },
  tipAction: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  tipActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FinancialTip;
