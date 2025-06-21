import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

const ExpenseAnalysisSummary = ({ analytics, loading }) => {
  const formatCurrency = (amount) => {
    return `₹${typeof amount === 'number' ? amount.toLocaleString('en-IN') : '0'}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading analysis...</Text>
      </View>
    );
  }

  if (!analytics || !Object.keys(analytics).length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={24} color={colors.neutral[400]} />
        <Text style={styles.emptyText}>No expense data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Ionicons name="card" size={22} color="#3b82f6" />
          <Text style={styles.summaryValue}>
            {formatCurrency(analytics.totalSpent || 0)}
          </Text>
          <Text style={styles.summaryLabel}>Total Spent</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Ionicons name="calendar" size={22} color="#10b981" />
          <Text style={styles.summaryValue}>
            {formatCurrency(analytics.dailyAverage || 0)}
          </Text>
          <Text style={styles.summaryLabel}>Daily Avg</Text>
        </View>
      </View>
      
      {analytics.topCategories && analytics.topCategories.length > 0 && (
        <View style={styles.topCategoriesContainer}>
          <Text style={styles.sectionLabel}>Top Categories</Text>
          {analytics.topCategories.slice(0, 2).map((category, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(index) }]} />
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.category || 'Unknown'}
              </Text>
              <Text style={styles.categoryAmount}>
                {formatCurrency(category.amount || 0)}
              </Text>
              <Text style={styles.categoryPercentage}>
                {typeof category.percentage === 'number' ? category.percentage.toFixed(1) : '0'}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Helper function to get colors for different categories
const getCategoryColor = (index) => {
  const categoryColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899'  // pink
  ];
  
  return categoryColors[index % categoryColors.length];
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.neutral[500],
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.neutral[600],
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  topCategoriesContainer: {
    marginTop: 8,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: 8,
  },
  categoryPercentage: {
    fontSize: 12,
    color: colors.text.secondary,
    width: 42,
    textAlign: 'right',
  }
});

export default ExpenseAnalysisSummary;
