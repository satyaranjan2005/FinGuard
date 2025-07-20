import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addEventListener, removeEventListener, EVENTS } from '../utils/eventEmitter';

const MonthlyBudgetCard = ({ budgetData: propsBudgetData, onNavigate }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [localBudgetData, setLocalBudgetData] = useState(propsBudgetData);
  const [loading, setLoading] = useState(!propsBudgetData);

  // Use props data when available, fallback to fetching only if no props provided
  useEffect(() => {
    if (propsBudgetData) {
      console.log('MonthlyBudgetCard: Using budget data from props');
      setLocalBudgetData(propsBudgetData);
      setLoading(false);
    } else {
      console.log('MonthlyBudgetCard: No props data, fetching independently');
      fetchBudgetData();
    }
  }, [propsBudgetData]);
  
  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      console.log('MonthlyBudgetCard: Fetching budget data...');
      
      // First check if there are any actual budgets created by the user - direct fetch
      const storedBudgets = await AsyncStorage.getItem('budgets');
      const budgetsList = storedBudgets ? JSON.parse(storedBudgets) : [];
      
      if (budgetsList.length === 0) {
        // If no budgets exist, don't show any budget data
        setLocalBudgetData(null);
        setLoading(false);
        console.log('MonthlyBudgetCard: No budgets found');
        return;
      }
      
      // If budgets exist, get the budget summary data directly
      const storedBudget = await AsyncStorage.getItem('budgetData');
      
      if (storedBudget) {
        const parsedBudget = JSON.parse(storedBudget);
        setLocalBudgetData(parsedBudget);
      } else if (propsBudgetData) {
        // Use props data if available
        setLocalBudgetData(propsBudgetData);
      } else {
        // Create a budget summary from the budgets list
        const totalAllocated = budgetsList.reduce((sum, budget) => sum + (budget.amount || 0), 0);
        const totalSpent = budgetsList.reduce((sum, budget) => sum + (budget.spent || 0), 0);
        
        const budgetSummary = {
          total: totalAllocated,
          spent: totalSpent,
          categories: budgetsList.map(budget => ({
            name: budget.category || 'Unknown',
            allocated: budget.amount || 0,
            spent: budget.spent || 0,
            color: budget.color || '#4F8EF7',
            icon: budget.icon || 'wallet'
          }))
        };
        
        setLocalBudgetData(budgetSummary);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      // If error, fallback to props data only (no sample data)
      setLocalBudgetData(propsBudgetData);
    } finally {
      setLoading(false);
    }
  };
  
  const updateBudget = async (updatedBudget) => {
    try {
      await AsyncStorage.setItem('budgetData', JSON.stringify(updatedBudget));
      setLocalBudgetData(updatedBudget);
      return true;
    } catch (error) {
      console.error('Error updating budget:', error);
      return false;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading budget data...</Text>
        </View>
      </View>
    );
  }
  
  if (!localBudgetData || !localBudgetData.total || !localBudgetData.categories || localBudgetData.categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={40} color={colors.neutral[400]} />
          <Text style={styles.emptyText}>No budget data available</Text>
          <TouchableOpacity 
            style={styles.setupButton} 
            onPress={() => onNavigate && onNavigate('Budget')}
          >
            <Text style={styles.setupButtonText}>Setup Budget</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const spentAmount = localBudgetData.spent || 0;
  const totalAmount = localBudgetData.total || 1;  const remainingAmount = totalAmount - spentAmount;
  const isOverBudget = spentAmount > totalAmount;
  const percentUsed = Math.min(Math.round((spentAmount / totalAmount) * 100), 100);
  
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Food': 'restaurant',
      'Housing': 'home',
      'Transportation': 'car',
      'Utilities': 'flash',
      'Entertainment': 'film',
      'Shopping': 'cart',
      'Healthcare': 'medkit',
      'Personal': 'person',
      'Education': 'school',
      'Travel': 'airplane',
    };
    
    return iconMap[category.name] || 'wallet';
  };
  
  // Sort categories by percentage spent
  const sortedCategories = [...localBudgetData.categories].sort((a, b) => {
    const aPercent = a.spent / a.allocated;
    const bPercent = b.spent / b.allocated;
    return bPercent - aPercent;
  });
  // Function to manually refresh budget data
  const refreshBudgetData = () => {
    fetchBudgetData();
  };

  return (
    <View style={styles.container}>
      {/* Overall Budget Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryTextContainer}>
          <Text style={[
            styles.budgetInfoText, 
            isOverBudget ? styles.warningBudgetText : null
          ]}>
            {isOverBudget ? 'Budget exceeded by ' : 'Remaining budget: '}
            <Text style={
              isOverBudget ? styles.negativeAmount : styles.positiveAmount
            }>
              {formatCurrency(Math.abs(remainingAmount))}
            </Text>
          </Text>
          <Text style={styles.budgetRatioText}>
            {formatCurrency(spentAmount)} of {formatCurrency(totalAmount)}
          </Text>
        </View>
        
        <View style={styles.percentContainer}>
          <View style={styles.percentCircle}>
            <Text style={[
              styles.percentText,
              percentUsed > 90 ? styles.highPercentText : null
            ]}>
              {percentUsed}%
            </Text>
          </View>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${percentUsed}%`,
              backgroundColor: isOverBudget ? '#F44336' : 
                percentUsed > 80 ? '#FF9800' : '#4CAF50'
            }
          ]} 
        />
      </View>
      
      {/* Category Breakdown */}
      <Text style={styles.breakdownTitle}>Category Breakdown</Text>
      <View style={styles.categoriesContainer}>
        {sortedCategories.slice(0, 3).map((category, index) => {
          const catPercentUsed = Math.round((category.spent / category.allocated) * 100);
          const isOverCategory = category.spent > category.allocated;
          
          return (
            <TouchableOpacity 
              key={index} 
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons 
                  name={getCategoryIcon(category)} 
                  size={18} 
                  color={'white'} 
                  style={{
                    backgroundColor: category.color || colors.primary.main, 
                    padding: 6, 
                    borderRadius: 20
                  }} 
                />
              </View>
              <View style={styles.categoryDetails}>
                <View style={styles.categoryNameContainer}>
                  <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
                  <Text style={[
                    styles.categoryPercentage,
                    isOverCategory ? styles.overCategoryText : null
                  ]}>
                    {catPercentUsed}%
                  </Text>
                </View>
                <View style={styles.categoryProgressContainer}>
                  <View 
                    style={[
                      styles.categoryProgress, 
                      { 
                        width: `${Math.min(catPercentUsed, 100)}%`,
                        backgroundColor: isOverCategory ? '#F44336' : 
                          catPercentUsed > 80 ? '#FF9800' : '#4CAF50'
                      }
                    ]} 
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
          {localBudgetData.categories.length > 3 && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => onNavigate && onNavigate('Budget')}
          >
            <Text style={styles.viewAllText}>
              View all {localBudgetData.categories.length} categories
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Category Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedCategory?.name || 'Category'} Details
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            
            {selectedCategory && (
              <View style={styles.modalBody}>
                <View style={styles.modalStatRow}>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {formatCurrency(selectedCategory.allocated)}
                    </Text>
                    <Text style={styles.modalStatLabel}>Budget</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={styles.modalStatValue}>
                      {formatCurrency(selectedCategory.spent)}
                    </Text>
                    <Text style={styles.modalStatLabel}>Spent</Text>
                  </View>
                  <View style={styles.modalStat}>
                    <Text style={[
                      styles.modalStatValue,
                      selectedCategory.spent > selectedCategory.allocated ? 
                        styles.negativeAmount : styles.positiveAmount
                    ]}>
                      {formatCurrency(Math.abs(selectedCategory.allocated - selectedCategory.spent))}
                    </Text>
                    <Text style={styles.modalStatLabel}>
                      {selectedCategory.spent > selectedCategory.allocated ? 'Overspent' : 'Remaining'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.modalProgressContainer}>
                  <View style={styles.modalProgressBarContainer}>
                    <View 
                      style={[
                        styles.modalProgressBar, 
                        { 
                          width: `${Math.min((selectedCategory.spent / selectedCategory.allocated) * 100, 100)}%`,
                          backgroundColor: selectedCategory.spent > selectedCategory.allocated ? '#F44336' : 
                            (selectedCategory.spent / selectedCategory.allocated) > 0.8 ? '#FF9800' : '#4CAF50'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.modalProgressText}>
                    {Math.round((selectedCategory.spent / selectedCategory.allocated) * 100)}% of budget used
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.manageButton}
                  onPress={() => {
                    setModalVisible(false);
                    onNavigate && onNavigate('Budget');
                  }}
                >
                  <Text style={styles.manageButtonText}>Manage Budget</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({  container: {
    width: '100%',
    marginTop: 8
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral[500],
    marginTop: 12,
  },
  setupButton: {
    marginTop: 16,
    backgroundColor: colors.primary.main,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  setupButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  percentContainer: {
    marginLeft: 12,
  },
  percentCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  highPercentText: {
    color: '#F44336',
  },
  budgetInfoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  warningBudgetText: {
    fontWeight: '500',
  },
  positiveAmount: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  negativeAmount: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  budgetRatioText: {
    fontSize: 13,
    color: '#666',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text.primary,
  },
  categoriesContainer: {
    marginTop: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryIconContainer: {
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
  },
  categoryPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  overCategoryText: {
    color: '#F44336',
  },
  categoryProgressContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 10,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary.main,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalStat: {
    alignItems: 'center',
    flex: 1,
  },
  modalStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  modalProgressContainer: {
    marginBottom: 24,
  },
  modalProgressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  modalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  manageButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  manageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default MonthlyBudgetCard;
