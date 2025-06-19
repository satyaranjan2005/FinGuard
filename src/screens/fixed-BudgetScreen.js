import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressChart } from 'react-native-chart-kit';
import { Button, Card, Input } from '../components';
import { storageService } from '../services/storageService';
import colors from '../utils/colors';

const BudgetScreen = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        storageService.getBudgets(),
        storageService.getCategories(),
        storageService.getTransactions(),
      ]);
      
      setBudgets(budgetsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthSpending = (categoryId) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate.getMonth() === currentMonth &&
               transactionDate.getFullYear() === currentYear &&
               transaction.type === 'expense' &&
               transaction.categoryId === categoryId;
      })
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
  };

  const getBudgetProgress = (budget) => {
    const spent = getCurrentMonthSpending(budget.categoryId);
    const progress = budget.amount > 0 ? spent / budget.amount : 0;
    return {
      spent,
      progress: Math.min(progress, 1),
      remaining: Math.max(budget.amount - spent, 0),
      isOverBudget: spent > budget.amount
    };
  };

  const addBudget = async () => {
    if (!newBudgetCategory || !newBudgetAmount || parseFloat(newBudgetAmount) <= 0) {
      Alert.alert('Error', 'Please select a category and enter a valid amount');
      return;
    }

    // Check if budget already exists for this category this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const existingBudget = budgets.find(budget => 
      budget.categoryId === newBudgetCategory &&
      budget.month === currentMonth &&
      budget.year === currentYear
    );

    if (existingBudget) {
      Alert.alert('Error', 'Budget already exists for this category this month');
      return;
    }

    try {
      await storageService.saveBudget({
        categoryId: newBudgetCategory,
        amount: parseFloat(newBudgetAmount),
      });
      
      setNewBudgetCategory('');
      setNewBudgetAmount('');
      setShowAddBudget(false);
      loadData();
      Alert.alert('Success', 'Budget created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const deleteBudget = (budgetId) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            // Note: You'll need to implement deleteBudget in storageService
            // For now, we'll just reload data
            loadData();
          }
        }
      ]
    );
  };

  const getExpenseCategories = () => {
    return categories.filter(cat => cat.type === 'expense');
  };

  const getTotalBudgetOverview = () => {
    let totalBudget = 0;
    let totalSpent = 0;
    
    budgets.forEach(budget => {
      totalBudget += budget.amount;
      totalSpent += getCurrentMonthSpending(budget.categoryId);
    });

    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overallProgress: totalBudget > 0 ? totalSpent / totalBudget : 0
    };
  };

  const overview = getTotalBudgetOverview();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });  
    return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>{currentMonth}</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading budget data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.statLabel}>Spent</Text>                  <Text style={styles.statValue}>₹{overview.totalSpent.toFixed(2)}</Text>
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
                <Text style={styles.formTitle}>Create New Budget</Text>
              </View>
            
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity 
                style={styles.categorySelector}
                onPress={() => {
                  Alert.alert('Select Category', 'Category picker would be here');
                }}
              >
                <Text style={styles.categorySelectorText}>
                  {newBudgetCategory ? 
                    categories.find(c => c.id === newBudgetCategory)?.name : 
                    'Select a category...'
                  }
                </Text>
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
                    <Text style={styles.saveButtonText}>Create Budget</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowAddBudget(false);
                    setNewBudgetCategory('');
                    setNewBudgetAmount('');
                  }}
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
                        <Text style={styles.budgetCategoryName}>{category.name}</Text>                        <Text style={styles.budgetAmount}>
                          ₹{progress.spent.toFixed(2)} of ₹{budget.amount.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => deleteBudget(budget.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger.main} />
                    </TouchableOpacity>
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
                          ]}>                            {progress.isOverBudget ? 
                              `₹${(progress.spent - budget.amount).toFixed(2)} over` :
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
                    </View>
                  )}                </Card>
              );
            }) : null
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
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
  },
  scrollView: {
    flex: 1,
  },  
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#f9fafb',
  },
  categorySelectorText: {
    color: '#6b7280',
    fontSize: 15,
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
  deleteButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
  }
});

export default BudgetScreen;
