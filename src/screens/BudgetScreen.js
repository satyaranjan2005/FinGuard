import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, ActivityIndicator, StatusBar, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card, Input } from '../components';
import { storageService } from '../services/storageService';
import { fetchCategories, saveBudget, fetchBudgets, deleteBudget as deleteBudgetFromService, updateBudget, initializeAppData, fetchBudgetSummary } from '../services/dataService';
import colors from '../utils/colors';
import { addEventListener, removeEventListener, EVENTS } from '../utils/eventEmitter';

const BudgetScreen = ({ navigation }) => {  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Use ref for tracking load time to avoid dependency issues
  const lastLoadTimeRef = useRef(null);
  const isLoadingRef = useRef(false);
  // Fallback categories in case data loading fails - moved outside component to prevent recreation
const fallbackCategories = [
  { id: 'cat1', name: 'Food', type: 'expense', color: '#10b981', icon: 'restaurant' },
  { id: 'cat2', name: 'Transportation', type: 'expense', color: '#8b5cf6', icon: 'car' },
  { id: 'cat3', name: 'Shopping', type: 'expense', color: '#84cc16', icon: 'bag' },
  { id: 'cat4', name: 'Entertainment', type: 'expense', color: '#ef4444', icon: 'film' },
  { id: 'cat5', name: 'Healthcare', type: 'expense', color: '#06b6d4', icon: 'medical' },
  { id: 'cat6', name: 'Utilities', type: 'expense', color: '#f59e0b', icon: 'flash' },
  { id: 'cat7', name: 'Housing', type: 'expense', color: '#3b82f6', icon: 'home' }
];  useEffect(() => {
    loadData();
    
    // Listen to budget updates and transaction changes with throttling
    const budgetUpdateSubscription = addEventListener(EVENTS.BUDGET_UPDATED, () => {
      console.log("Budget updated event received in BudgetScreen");
      loadData();
    });
    
    const transactionAddedSubscription = addEventListener(EVENTS.TRANSACTION_ADDED, () => {
      console.log("Transaction added event received in BudgetScreen");
      loadData();
    });
    
    const transactionDeletedSubscription = addEventListener(EVENTS.TRANSACTION_DELETED, () => {
      console.log("Transaction deleted event received in BudgetScreen");
      loadData();
    });
    
    // Clean up subscriptions
    return () => {
      removeEventListener(budgetUpdateSubscription);
      removeEventListener(transactionAddedSubscription);
      removeEventListener(transactionDeletedSubscription);
    };
  }, []); // Empty dependency array since loadData is wrapped in useCallback  // Refresh data when screen comes into focus - optimized to prevent excessive reloads
  useFocusEffect(
    React.useCallback(() => {
      console.log('BudgetScreen: Focus effect triggered - checking if reload needed');
      // Only reload if screen has been away for a meaningful amount of time
      // This prevents reloads when navigating back from quick modal interactions
      const shouldReload = !isLoadingRef.current && (!lastLoadTimeRef.current || Date.now() - lastLoadTimeRef.current > 5000); // 5 second threshold
      if (shouldReload) {
        console.log('BudgetScreen: Reloading data due to focus effect');
        loadData();
      }
    }, [loadData]) // Include loadData dependency since it's stable
  );// Load data function - wrapped in useCallback with debouncing to prevent excessive calls
  const loadData = React.useCallback(async () => {
    // Prevent rapid successive calls
    const now = Date.now();
    if (isLoadingRef.current || (lastLoadTimeRef.current && now - lastLoadTimeRef.current < 1000)) { // 1 second debounce
      console.log('BudgetScreen: Skipping load data due to recent call or ongoing load');
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    lastLoadTimeRef.current = now;
    
    try {
      console.log('BudgetScreen: Loading budget data...');
      
      // Load data in parallel for faster performance
      const [budgetsData, categoriesData, transactionsData, budgetSummaryData] = await Promise.all([
        fetchBudgets(),
        fetchCategories(), // Load all categories, then filter in getExpenseCategories
        storageService.getTransactions(),
        fetchBudgetSummary(),
      ]);
      
      console.log(`BudgetScreen: Loaded ${budgetsData?.length || 0} budgets, ${categoriesData?.length || 0} categories, ${transactionsData?.length || 0} transactions`);
      
      setBudgets(Array.isArray(budgetsData) ? budgetsData : []);
      setBudgetSummary(budgetSummaryData);
      
      // Use fallback categories if none loaded
      const finalCategories = Array.isArray(categoriesData) && categoriesData.length > 0 
        ? categoriesData 
        : fallbackCategories;
      setCategories(finalCategories);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.error('Load budget data error:', error);
      Alert.alert('Error', 'Failed to load budget data');
      setBudgets([]);
      setBudgetSummary(null);
      setCategories(fallbackCategories); // Use fallback on error
      setTransactions([]);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
    }
  }, []); // Empty dependency array since we're using refs
  const handleRefresh = async () => {
    console.log('BudgetScreen: Manual refresh triggered');
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  const getCurrentMonthSpending = (categoryId) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date || transaction.createdAt);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear &&
               transaction.type === 'expense' &&
               transaction.categoryId === categoryId;
      })
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
  };  const getBudgetProgress = (budget) => {
    // First try to get spent amount from budget summary data for accuracy
    let spent = budget.spent !== undefined ? budget.spent : 0;
    
    // If budget summary is available, use the data from there
    if (budgetSummary && budgetSummary.categories) {
      const summaryCategory = budgetSummary.categories.find(cat => cat.categoryId === budget.categoryId);
      if (summaryCategory) {
        spent = summaryCategory.spent;
      }
    }
    
    // Fallback to calculating from transactions if no stored value
    if (spent === 0 && budget.spent === undefined) {
      spent = getCurrentMonthSpending(budget.categoryId);
    }
    
    const progress = budget.amount > 0 ? spent / budget.amount : 0;
    return {
      spent,
      progress: Math.min(progress, 1),
      remaining: Math.max(budget.amount - spent, 0),
      isOverBudget: spent > budget.amount
    };
  };const addBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount || parseFloat(newBudgetAmount) <= 0) {
      Alert.alert('Validation Error', 'Please select a category and enter a valid amount greater than 0');
      return;
    }

    const budgetAmount = parseFloat(newBudgetAmount);
    if (budgetAmount > 1000000) {
      Alert.alert('Validation Error', 'Budget amount cannot exceed ₹10,00,000');
      return;
    }

    // Check if budget already exists for this category this month (only for new budgets)
    if (!editingBudget) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const existingBudget = budgets.find(budget => 
        budget.categoryId === newBudgetCategory &&
        budget.month === currentMonth &&
        budget.year === currentYear
      );

      if (existingBudget) {
        Alert.alert('Budget Exists', 'A budget already exists for this category this month. You can edit the existing budget instead.');
        return;
      }
    }

    try {
      if (editingBudget) {
        // Update existing budget
        await updateBudget(editingBudget.id, {
          categoryId: newBudgetCategory,
          amount: budgetAmount,
          updatedAt: new Date().toISOString()
        });
        Alert.alert('Success', 'Budget updated successfully!');
      } else {
        // Create new budget
        await saveBudget({
          categoryId: newBudgetCategory,
          amount: budgetAmount,
        });
        Alert.alert('Success', 'Budget created successfully!');
      }
        resetForm();
      // Don't call loadData() here as BUDGET_UPDATED event will handle it
    } catch (error) {
      console.error('Save budget error:', error);
      Alert.alert('Error', error.message || (editingBudget ? 'Failed to update budget' : 'Failed to create budget'));
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setNewBudgetCategory(budget.categoryId);
    setNewBudgetAmount(budget.amount.toString());
    setShowAddBudget(true);
  };

  const handleDeleteBudget = (budgetId) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {            try {
              await deleteBudgetFromService(budgetId);
              Alert.alert('Success', 'Budget deleted successfully');
              // Don't call loadData() here as BUDGET_UPDATED event will handle it
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNewBudgetCategory('');
    setNewBudgetAmount('');
    setEditingBudget(null);
    setShowAddBudget(false);
  };  const getExpenseCategories = () => {
    return categories.filter(cat => cat.type === 'expense');
  };  const getTotalBudgetOverview = () => {
    // If we have budget summary data, use it for consistency
    if (budgetSummary && budgetSummary.total !== undefined) {
      return {
        totalBudget: budgetSummary.total,
        totalSpent: budgetSummary.spent,
        totalRemaining: budgetSummary.total - budgetSummary.spent,
        overallProgress: budgetSummary.total > 0 ? budgetSummary.spent / budgetSummary.total : 0
      };
    }
    
    // Fallback to calculating from individual budgets
    let totalBudget = 0;
    let totalSpent = 0;
    
    budgets.forEach(budget => {
      totalBudget += budget.amount;
      // Use the budget's stored spent value if available, otherwise calculate from transactions
      const spent = budget.spent !== undefined ? budget.spent : getCurrentMonthSpending(budget.categoryId);
      totalSpent += spent;
    });

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overallProgress: totalBudget > 0 ? totalSpent / totalBudget : 0
    };
  };

  const overview = getTotalBudgetOverview();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });    return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header with modern design */}
      <LinearGradient
        colors={colors.gradients.budget}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="wallet" size={26} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Budget Management</Text>
          </View>          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleRefresh}
            >
              <Ionicons name="refresh-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Categories')}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View></View>
        <Text style={styles.headerSubtitle}>{currentMonth}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading budget data...</Text>
        </View>
      ) : (        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary.main]}
              tintColor={colors.primary.main}
            />
          }
        >
          <View style={styles.content}>
          </View>
        
          {/* Overall Budget Summary */}
          <Card style={styles.overviewCard}>
            <LinearGradient
              colors={colors.gradients.budget}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewHeader}>
                <View style={styles.overviewIconContainer}>
                  <Ionicons name="wallet" size={30} color="white" />
                </View>
                <Text style={styles.overviewTitle}>Monthly Budget Overview</Text>
                <Text style={styles.overviewAmount}>₹{overview.totalBudget.toFixed(2)}</Text>
              </View>
            
              <View style={styles.overviewStats}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="card-outline" size={18} color="white" />
                  </View>
                  <Text style={styles.statLabel}>Spent</Text>
                  <Text style={styles.statValue}>₹{overview.totalSpent.toFixed(2)}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="cash-outline" size={18} color="white" />
                  </View>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={styles.statValue}>₹{overview.totalRemaining.toFixed(2)}</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="trending-up" size={18} color="white" />
                  </View>
                  <Text style={styles.statLabel}>Progress</Text>
                  <Text style={styles.statValue}>{(overview.overallProgress * 100).toFixed(0)}%</Text>
                </View>
              </View>
            </LinearGradient>
          </Card>
        
          {/* Add Budget Button */}
          {!showAddBudget && (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowAddBudget(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.home}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.addButtonGradient}
              >
                <View style={styles.addButtonIconContainer}>
                  <Ionicons name="add" size={20} color="white" />
                </View>
                <Text style={styles.addButtonText}>Add New Budget</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        
          {/* Add Budget Form */}
          {showAddBudget && (
            <Card style={styles.formCard}>
              <View style={styles.formHeader}>
                <View style={styles.formIconContainer}>
                  <Ionicons name="create" size={24} color="white" />
                </View>
                <Text style={styles.formTitle}>
                  {editingBudget ? 'Edit Budget' : 'Create New Budget'}
                </Text>
              </View>
            
              <Text style={styles.inputLabel}>Category</Text>              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => {
                  if (getExpenseCategories().length === 0) {
                    Alert.alert(
                      'No Categories',
                      'Please create some expense categories first to set up budgets.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Manage Categories', 
                          onPress: () => navigation.navigate('Categories')
                        }
                      ]
                    );
                  } else {
                    setShowCategoryModal(true);
                  }
                }}
                activeOpacity={0.7}
              >
                {newBudgetCategory ? (
                  <View style={styles.selectedCategoryContent}>
                    <View 
                      style={[
                        styles.selectedCategoryIcon,
                        { backgroundColor: categories.find(c => c.id === newBudgetCategory)?.color + '20' }
                      ]}
                    >
                      <Ionicons 
                        name={categories.find(c => c.id === newBudgetCategory)?.icon} 
                        size={18} 
                        color={categories.find(c => c.id === newBudgetCategory)?.color} 
                      />
                    </View>
                    <Text style={styles.selectedCategoryText}>
                      {categories.find(c => c.id === newBudgetCategory)?.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.categorySelectorPlaceholder}>
                    Select a category...
                  </Text>
                )}
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
              </TouchableOpacity>
            
              <Input
                label="Budget Amount"
                placeholder="Enter budget amount"
                value={newBudgetAmount}
                onChangeText={setNewBudgetAmount}
                type="decimal"
                style={styles.budgetInput}
              />
                <View style={styles.formButtons}>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={addBudget}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.balance}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" style={styles.saveButtonIcon} />
                    <Text style={styles.saveButtonText}>
                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>                <TouchableOpacity 
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                  onPress={resetForm}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        
          {/* Budget List */}
          <View style={styles.sectionTitleContainer}>
            <View style={styles.sectionIconContainer}>
              <Ionicons name="list" size={20} color="white" />
            </View>
            <Text style={styles.sectionTitle}>Your Budgets</Text>
          </View>
        
          {budgets.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={colors.gradients.budget}
                    style={styles.emptyIconBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="wallet-outline" size={44} color="white" />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>No budgets created</Text>
                <Text style={styles.emptySubtitle}>Create your first budget to start tracking your spending</Text>
                <TouchableOpacity 
                  style={styles.emptyAddButton}
                  activeOpacity={0.8}
                  onPress={() => setShowAddBudget(true)}
                >
                  <LinearGradient
                    colors={colors.gradients.home}
                    style={styles.emptyAddButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add" size={20} color="white" style={{marginRight: 8}} />
                    <Text style={styles.emptyAddButtonText}>Create Budget</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Card>          ) : (
            Array.isArray(budgets) ? budgets.map((budget) => {
              const category = categories.find(c => c.id === budget.categoryId);
              const progress = getBudgetProgress(budget);
              if (!category) return null;
            
              return (
                <Card key={budget.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetInfo}>
                      <View 
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: category.color + '20' }
                        ]}
                      >
                        <Ionicons name={category.icon} size={24} color={category.color} />
                      </View>
                      <View style={styles.budgetDetails}>
                        <Text style={styles.budgetCategoryName}>{category.name}</Text>
                        <Text style={styles.budgetAmount}>
                          ₹{progress.spent.toFixed(2)} of ₹{budget.amount.toFixed(2)}
                        </Text>
                      </View>                    </View>
                    <View style={styles.budgetActions}>
                      <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={() => handleEditBudget(budget)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => handleDeleteBudget(budget.id)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                
                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={progress.isOverBudget ? 
                          colors.gradients.expense : 
                          colors.gradients.home
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressFill,
                          { width: `${Math.min(progress.progress * 100, 100)}%` }
                        ]}
                      />
                    </View>
                    <View style={styles.progressStats}>
                      <View style={styles.progressStatItem}>
                        <View style={[
                          styles.progressBadge,
                          progress.isOverBudget ? styles.overBudgetBadge : styles.normalBudgetBadge
                        ]}>
                          <Text style={[
                            styles.progressText,
                            progress.isOverBudget && styles.overBudgetText
                          ]}>
                            {(progress.progress * 100).toFixed(0)}% used
                          </Text>
                        </View>
                      </View>
                      <View style={styles.progressStatItem}>
                        <View style={[
                          styles.progressBadge,
                          progress.isOverBudget ? styles.overBudgetBadge : styles.remainingBadge
                        ]}>
                          <Text style={[
                            styles.progressText,
                            progress.isOverBudget ? styles.overBudgetText : styles.remainingText
                          ]}>
                            {progress.isOverBudget ?                              `₹${(progress.spent - budget.amount).toFixed(2)} over` :
                              `₹${progress.remaining.toFixed(2)} left`
                            }
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                
                  {progress.isOverBudget && (
                    <View style={styles.warningContainer}>
                      <View style={styles.warningContent}>
                        <Ionicons name="warning" size={18} color={colors.danger.main} />
                        <Text style={styles.warningText}>
                          You've exceeded your budget for this category
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.warningActionButton}>
                        <Text style={styles.warningActionText}>View Spending</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.danger.main} />
                      </TouchableOpacity>
                    </View>                  )}
                </Card>
              );
            }) : null
          )}
          <View style={styles.bottomSpacer} />        </ScrollView>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategoryModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {getExpenseCategories().map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.modalCategoryItem,
                    newBudgetCategory === category.id && styles.modalCategoryItemSelected
                  ]}
                  onPress={() => {
                    setNewBudgetCategory(category.id);
                    setShowCategoryModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalCategoryInfo}>
                    <View 
                      style={[
                        styles.modalCategoryIcon,
                        { backgroundColor: category.color + '20' }
                      ]}
                    >
                      <Ionicons name={category.icon} size={20} color={category.color} />
                    </View>
                    <Text style={styles.modalCategoryName}>{category.name}</Text>
                  </View>
                  {newBudgetCategory === category.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
                  )}
                </TouchableOpacity>
              ))}

              {getExpenseCategories().length === 0 && (
                <View style={styles.modalEmptyState}>
                  <Ionicons name="folder-outline" size={48} color={colors.text.secondary} />
                  <Text style={styles.modalEmptyTitle}>No expense categories</Text>                  <Text style={styles.modalEmptySubtitle}>
                    Create expense categories first to set up budgets.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalEmptyButton}
                    onPress={() => {
                      setShowCategoryModal(false);
                      navigation.navigate('Categories');
                    }}
                  >
                    <Text style={styles.modalEmptyButtonText}>Manage Categories</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,  
  },  
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 17,
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '400',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16, 
    color: colors.text.secondary,
    fontSize: 16,
  },  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 85,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overviewCard: {
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 0,
    overflow: 'hidden',
    elevation: 8,
    borderRadius: 20,
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  overviewGradient: {
    padding: 16,
    borderRadius: 20,
  },
  overviewHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  overviewTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 6,
  },
  overviewAmount: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addButton: {
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.success.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addButtonIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  formCard: {
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  formIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    elevation: 3,
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  formTitle: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  label: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 6,
    fontSize: 15,
  },  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#f9fafb',
    minHeight: 56,
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCategoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
  },
  categorySelectorPlaceholder: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  budgetInput: {
    marginBottom: 14,
  },
  formButtons: {
    gap: 10,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 6,
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    marginRight: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emptyCard: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.text.tertiary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    maxWidth: '80%',
  },
  emptyAddButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: colors.success.main,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyIconContainer: {
    marginBottom: 16,
    elevation: 6,
    shadowColor: colors.primary.main,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  emptyIconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  budgetCard: {
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  budgetDetails: {
    flex: 1,
  },
  budgetCategoryName: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 17,
  },
  budgetAmount: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBar: {
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    height: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressFill: {
    height: 14,
    borderRadius: 10,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressStatItem: {
    flex: 1,
  },
  progressBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  normalBudgetBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  overBudgetBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  remainingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  overBudgetText: {
    color: colors.danger.main,
  },
  remainingText: {
    color: colors.success.main,
  },
  warningContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  warningText: {
    color: colors.danger.main,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  warningActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  warningActionText: {
    color: colors.danger.main,
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  bottomSpacer: {
    height: 36,
  },
  budgetActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
  },  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
    paddingBottom: 20,
  },  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: 4,
  },  modalList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },  modalCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    minHeight: 64,
  },
  modalCategoryItemSelected: {
    backgroundColor: colors.success.main + '10',
    borderWidth: 1,
    borderColor: colors.success.main + '30',
  },
  modalCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalCategoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalCategoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  modalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  modalEmptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalEmptyButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalEmptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BudgetScreen;
