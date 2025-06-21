import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { addEventListener, removeEventListener, EVENTS } from '../utils/eventEmitter';
import { 
  fetchUserData, 
  fetchRecentTransactions, 
  fetchBudgetSummary, 
  getCurrentBalance,
  fetchBudgets,
  fetchGoals,
  getSpendingAnalytics,
  getFinancialInsights
} from '../services/dataService';
import TransactionItem from '../components/TransactionItem';
import { TransactionSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { ExpenseAnalysisSummary, MonthlyBudgetCard } from '../components';
import { colors } from '../utils/colors';
import {
StyleSheet, 
View, 
Text, 
ScrollView, 
TouchableOpacity, 
ActivityIndicator,
RefreshControl,
Alert,
StatusBar
} from 'react-native';

const DashboardScreen = ({ navigation }) => {
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [userData, setUserData] = useState(null);
const [transactions, setTransactions] = useState([]);
const [budgetData, setBudgetData] = useState({ categories: [] });
const [budgets, setBudgets] = useState([]);
const [goals, setGoals] = useState([]);
const [spendingAnalytics, setSpendingAnalytics] = useState(null);
const [financialInsights, setFinancialInsights] = useState(null);
const [currentBalance, setCurrentBalance] = useState(0);
const [error, setError] = useState(null);
// Wrap in useCallback to maintain stable reference
const fetchDashboardData = React.useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Fetch all dashboard data in parallel for better performance
    const [
      user,
      recentTransactions,
      budgetSummary,
      balance,
      budgetsList,
      goalsList,
      analytics,
      insights
    ] = await Promise.all([
      fetchUserData(),
      fetchRecentTransactions(100), // Get more transactions for expense analysis
      fetchBudgetSummary(),
      getCurrentBalance(),
      fetchBudgets(),
      fetchGoals(),
      getSpendingAnalytics(30), // Use 30 days period
      getFinancialInsights()
    ]);
    
    setUserData(user);
    setTransactions(recentTransactions || []);
    setBudgetData(budgetSummary || { categories: [] });
    setCurrentBalance(balance);
    setBudgets(budgetsList || []);
    setGoals(goalsList || []);
    setSpendingAnalytics(analytics);
    setFinancialInsights(insights);
    
  } catch (err) {
    setError('Failed to load dashboard data');
    console.error('Dashboard data fetch error:', err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

// Load data on initial render
useEffect(() => {
  fetchDashboardData();
  
  // Listen to relevant events with reduced frequency
  const transactionSubscription = addEventListener(EVENTS.TRANSACTION_ADDED, () => {
    console.log('DashboardScreen: Transaction added, refreshing data');
    fetchDashboardData();
  });
  
  const transactionDeletedSubscription = addEventListener(EVENTS.TRANSACTION_DELETED, () => {
    console.log('DashboardScreen: Transaction deleted, refreshing data');
    fetchDashboardData();
  });
  
  return () => {
    removeEventListener(transactionSubscription);
    removeEventListener(transactionDeletedSubscription);
  };
}, []); // Empty dependency array to prevent recreation of event listeners

const onRefresh = () => {
  setRefreshing(true);
  fetchDashboardData();
};

if (loading && !refreshing) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4F8EF7" />
      <Text style={styles.loadingText}>Loading your financial summary...</Text>
    </View>
  );
}

return (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    {/* Modern blue gradient header with balance card */}
    <LinearGradient
      colors={colors.gradients.balance}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Ionicons name="analytics" size={26} color="white" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>Your financial summary</Text>
      
      {/* Balance Card integrated in header */}
      <View style={styles.headerBalanceCard}>
        <View style={styles.headerBalanceSection}>
          <Text style={styles.headerBalanceLabel}>Current Balance</Text>          <Text style={styles.headerBalanceAmount}>
            ₹{currentBalance?.toFixed(2) || '0.00'}
          </Text>
        </View>
        
        <View style={styles.headerBalanceDivider} />
        
        <View style={styles.headerIncomeExpense}>
          <View style={styles.headerIncomeSection}>
            <Ionicons name="arrow-down-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.headerIncomeLabel}>Income</Text>
            <Text style={styles.headerIncomeAmount}>₹{userData?.monthlyIncome?.toFixed(2) || '0.00'}</Text>
          </View>
          
          <View style={styles.headerExpenseSection}>
            <Ionicons name="arrow-up-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.headerExpenseLabel}>Expenses</Text>
            <Text style={styles.headerExpenseAmount}>₹{userData?.monthlyExpenses?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>      </View>
    </LinearGradient>
    
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >{error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
        {/* Quick action buttons */}
      <View style={styles.quickActions}>        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('AddTransaction');
          }}
        >
          <View style={styles.actionButtonIcon}>
            <FontAwesome5 name="plus" size={16} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>Add Transaction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Budget');
          }}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#4CAF50' }]}>
            <FontAwesome5 name="chart-pie" size={16} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>Budgets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Goals');
          }}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#FF9800' }]}>
            <FontAwesome5 name="bullseye" size={16} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>Goals</Text>
        </TouchableOpacity>
          <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Analytics');
          }}
        >
          <View style={[styles.actionButtonIcon, { backgroundColor: '#9C27B0' }]}>
            <FontAwesome5 name="chart-line" size={16} color="#fff" />
          </View>
          <Text style={styles.actionButtonText}>Analytics</Text>
        </TouchableOpacity>      </View>      {/* Monthly Budget Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
            <Text style={styles.seeAllText}>Manage</Text>
          </TouchableOpacity>
        </View>        <MonthlyBudgetCard 
          budgetData={budgets && budgets.length > 0 ? budgetData : null} 
          onNavigate={(screen) => navigation.navigate(screen)}
          key="monthly-budget"
        />
      </View>

      {/* Financial Health Indicators */}
      {financialInsights && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Health</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.seeAllText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.healthIndicatorsContainer}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthIndicatorIcon, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="trending-up" size={20} color="white" />
              </View>              <View style={styles.healthIndicatorContent}>
                <Text style={styles.healthIndicatorLabel}>Savings Rate</Text>
                <Text style={styles.healthIndicatorValue}>
                  {(financialInsights.savingsRate || 0).toFixed(2)}%
                </Text>
              </View>
            </View>
            
            <View style={styles.healthIndicator}>
              <View style={[styles.healthIndicatorIcon, { backgroundColor: '#FF9800' }]}>
                <Ionicons name="speedometer" size={20} color="white" />
              </View>
              <View style={styles.healthIndicatorContent}>
                <Text style={styles.healthIndicatorLabel}>Expense Ratio</Text>
                <Text style={styles.healthIndicatorValue}>
                  {(financialInsights.expenseRatio || 0).toFixed(2)}%
                </Text>
              </View>
            </View>
          </View>
          
          {financialInsights.tip && (
            <View style={styles.financialTipContainer}>
              <Ionicons name="bulb" size={16} color="#FFA726" />
              <Text style={styles.financialTipText}>{financialInsights.tip}</Text>
            </View>
          )}
        </View>
      )}

      {/* Goals Progress */}
      {goals && goals.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Goals Progress</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {goals.slice(0, 2).map((goal) => (
            <View key={goal.id} style={styles.goalProgressItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalProgress}>
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                </Text>
              </View>
              <View style={styles.goalProgressBarContainer}>
                <View 
                  style={[
                    styles.goalProgressBar, 
                    { 
                      width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                      backgroundColor: goal.currentAmount >= goal.targetAmount ? '#4CAF50' : '#4F8EF7'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.goalAmountText}>
                ₹{goal.currentAmount.toFixed(2)} of ₹{goal.targetAmount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Budget Alerts */}
      {budgets && budgets.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Alerts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>
          
          {budgets
            .filter(budget => {
              const spent = budget.spent || 0;
              const limit = budget.amount || 1;
              return spent / limit > 0.8; // Show budgets over 80% usage
            })
            .slice(0, 3)
            .map((budget) => {
              const percentUsed = Math.round((budget.spent / budget.amount) * 100);
              const isOverBudget = percentUsed > 100;
              
              return (
                <View key={budget.id} style={styles.budgetAlertItem}>
                  <View style={styles.budgetAlertHeader}>
                    <Text style={styles.budgetAlertCategory}>{budget.category}</Text>
                    <Text style={[
                      styles.budgetAlertPercentage,
                      { color: isOverBudget ? '#F44336' : '#FF9800' }
                    ]}>
                      {percentUsed}%
                    </Text>
                  </View>
                  <Text style={styles.budgetAlertText}>
                    {isOverBudget 
                      ? `Over budget by ₹${(budget.spent - budget.amount).toFixed(2)}`
                      : `₹${(budget.amount - budget.spent).toFixed(2)} remaining`
                    }
                  </Text>
                </View>
              );
            })
          }
            {budgets.filter(budget => (budget.spent / budget.amount) > 0.8).length === 0 && (
            <Text style={styles.emptyStateText}>All budgets are on track! 🎉</Text>
          )}
        </View>
      )}
      
      <View style={styles.sectionSeparator} />
      
      {/* Expense Analysis Summary */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Analysis</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.seeAllText}>Details</Text>
          </TouchableOpacity>
        </View>
        <ExpenseAnalysisSummary 
          analytics={spendingAnalytics} 
          loading={loading} 
        />
      </View>
      
      <View style={styles.sectionSeparator} />
      
      {/* Recent transactions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>          {loading ? (
          // Show loading skeletons with safety check
          Array.isArray(Array.from({ length: 4 })) ? Array.from({ length: 4 }).map((_, index) => (
            <TransactionSkeleton key={`skeleton-${index}`} />
          )) : null
        ) : !transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
          <Text style={styles.emptyStateText}>No recent transactions</Text>
        ) : (
          // Ensure transactions is an array before mapping
          Array.isArray(transactions) ? transactions.filter(t => t != null).map((transaction) => (
            transaction && transaction.id ? (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('TransactionHistory');
                }}
              />
            ) : null
          )) : null
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#F5F7FA',
  position: 'relative',
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F5F7FA',
},
loadingText: {
  marginTop: 12,
  fontSize: 16,
  color: '#4F8EF7',
},
header: {
  paddingHorizontal: 16,
  paddingVertical: 16,
  paddingTop: 14,
  paddingBottom: 24,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  elevation: 8,
  shadowColor: colors.info.dark,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  position: 'relative',
  zIndex: 10,
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
  marginBottom: 12,
},
headerBalanceCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 16,
  padding: 16,
  marginTop: 8,
},
headerBalanceSection: {
  alignItems: 'center',
  marginBottom: 12,
},
headerBalanceLabel: {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 14,
  marginBottom: 4,
},
headerBalanceAmount: {
  color: 'white',
  fontSize: 32,
  fontWeight: 'bold',
},
headerBalanceDivider: {
  height: 1,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  marginVertical: 10,
},
headerIncomeExpense: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},
headerIncomeSection: {
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
},
headerExpenseSection: {
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
},
headerIncomeLabel: {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 12,
  marginTop: 4,
  marginBottom: 2,
},
headerExpenseLabel: {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 12,
  marginTop: 4,
  marginBottom: 2,
},
headerIncomeAmount: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
headerExpenseAmount: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
scrollView: {
  flex: 1,
  backgroundColor: colors.background,
},
scrollViewContent: {
  paddingBottom: 100,
  paddingTop: 20,
  paddingHorizontal: 0,
},
errorContainer: {
  margin: 16,
  padding: 16,
  backgroundColor: '#FFEBEE',
  borderRadius: 8,
  alignItems: 'center',
},
errorText: {
  color: '#D32F2F',
  marginBottom: 8,
},
retryButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#D32F2F',
  borderRadius: 4,
},
retryButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
quickActions: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  marginHorizontal: 20,
  marginBottom: 24,
  marginTop: 8,
},
actionButton: {
  width: '48%',
  alignItems: 'center',
  marginBottom: 12,
  backgroundColor: '#fff',
  padding: 16,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 3,
},
actionButtonIcon: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#4F8EF7',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8,
},
actionButtonText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#333',
},
sectionContainer: {
  marginHorizontal: 20,
  marginBottom: 24,
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  elevation: 3,
},
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 18,
},
sectionTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: colors.text.primary,
},
seeAllText: {
  fontSize: 14,
  color: colors.info.main,
  fontWeight: '600',
},
sectionSeparator: {
  height: 8,
  marginVertical: 12,
},
budgetProgressContainer: {
  marginBottom: 8,
},
budgetInfoText: {
  fontSize: 14,
  color: '#666',
  marginBottom: 8,
},
positiveAmount: {
  color: '#4CAF50',
  fontWeight: 'bold',
},
negativeAmount: {
  color: '#F44336',
  fontWeight: 'bold',
},
progressBarContainer: {
  height: 8,
  backgroundColor: '#E0E0E0',
  borderRadius: 4,
  marginBottom: 8,
  overflow: 'hidden',
},
progressBar: {
  height: '100%',
  borderRadius: 4,
},
budgetRatioText: {
  fontSize: 12,
  color: '#666',
  textAlign: 'right',
},
chartContainer: {
  height: 200,
  marginVertical: 8,
},
emptyStateText: {
  textAlign: 'center',
  color: '#666',
  fontSize: 14,
  paddingVertical: 16,
},

// Financial Health Styles
healthIndicatorsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},
healthIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
  backgroundColor: '#F8F9FA',
  padding: 12,
  borderRadius: 12,
  marginHorizontal: 4,
},
healthIndicatorIcon: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
healthIndicatorContent: {
  flex: 1,
},
healthIndicatorLabel: {
  fontSize: 12,
  color: '#666',
  marginBottom: 2,
},
healthIndicatorValue: {
  fontSize: 16,
  fontWeight: '700',
  color: '#333',
},
financialTipContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFF3E0',
  padding: 12,
  borderRadius: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#FFA726',
},
financialTipText: {
  fontSize: 14,
  color: '#F57C00',
  marginLeft: 8,
  flex: 1,
  lineHeight: 18,
},

// Goals Progress Styles
goalProgressItem: {
  marginBottom: 16,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},
goalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
goalName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  flex: 1,
},
goalProgress: {
  fontSize: 14,
  fontWeight: '700',
  color: '#4F8EF7',
},
goalProgressBarContainer: {
  height: 6,
  backgroundColor: '#E0E0E0',
  borderRadius: 3,
  marginBottom: 8,
  overflow: 'hidden',
},
goalProgressBar: {
  height: '100%',
  borderRadius: 3,
},
goalAmountText: {
  fontSize: 12,
  color: '#666',
  textAlign: 'right',
},

// Budget Alerts Styles
budgetAlertItem: {
  backgroundColor: '#FFF3E0',
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
  borderLeftWidth: 4,
  borderLeftColor: '#FF9800',
},
budgetAlertHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 4,
},
budgetAlertCategory: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  textTransform: 'capitalize',
},
budgetAlertPercentage: {
  fontSize: 14,
  fontWeight: '700',
},
budgetAlertText: {
  fontSize: 12,
  color: '#666',
},

// Enhanced Expense Summary Styles
expenseDetailsContainer: {
  marginTop: 16,
  padding: 16,
  backgroundColor: colors.surface,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.neutral[200],
},
expenseDetailsTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: colors.text.primary,
  marginBottom: 16,
},
expenseDetailsSubtitle: {
  fontSize: 14,
  fontWeight: '600',
  color: colors.text.primary,
  marginBottom: 12,
  marginTop: 8,
},
topCategoriesContainer: {
  marginBottom: 20,
},
topCategoryItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 8,
  backgroundColor: colors.neutral[50],
  borderRadius: 8,
  marginBottom: 8,
},
topCategoryRank: {
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: colors.primary.main,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
topCategoryRankText: {
  fontSize: 12,
  fontWeight: 'bold',
  color: 'white',
},
topCategoryInfo: {
  flex: 1,
},
topCategoryName: {
  fontSize: 14,
  fontWeight: '600',
  color: colors.text.primary,
},
topCategoryAmount: {
  fontSize: 12,
  color: colors.text.secondary,
  marginTop: 2,
},
topCategoryPercentage: {
  alignItems: 'flex-end',
},
topCategoryPercentageText: {
  fontSize: 14,
  fontWeight: 'bold',
  color: colors.primary.main,
},
periodSummaryContainer: {
  marginBottom: 20,
},
periodSummaryGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
periodSummaryItem: {
  width: '48%',
  backgroundColor: colors.neutral[50],
  borderRadius: 8,
  padding: 12,
  marginBottom: 8,
  alignItems: 'center',
},
periodSummaryLabel: {
  fontSize: 12,
  color: colors.text.secondary,
  marginBottom: 4,
},
periodSummaryValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: colors.text.primary,
},
spendingTrendContainer: {
  marginBottom: 8,
},
spendingTrendItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: colors.neutral[50],
  borderRadius: 8,
  marginBottom: 8,
},
spendingTrendText: {
  fontSize: 13,
  color: colors.text.secondary,
  marginLeft: 12,
  flex: 1,
}
});

export default DashboardScreen;