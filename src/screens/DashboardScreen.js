import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { fetchUserData, fetchRecentTransactions, fetchBudgetSummary } from '../services/dataService';
import ExpenseSummaryChart from '../components/ExpenseSummaryChart';
import TransactionItem from '../components/TransactionItem';
import { TransactionSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import colors from '../utils/colors';
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
const [error, setError] = useState(null);

const fetchDashboardData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // In a real app, these would be API calls or AsyncStorage reads
    const user = await fetchUserData();
    const recentTransactions = await fetchRecentTransactions(5); // Get 5 most recent transactions
    const budgetSummary = await fetchBudgetSummary();
    
    setUserData(user);
    setTransactions(recentTransactions);
    setBudgetData(budgetSummary);
  } catch (err) {
    setError('Failed to load dashboard data');
    console.error(err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

// Load data on initial render
useEffect(() => {
  fetchDashboardData();
}, []);

// Refresh data when screen comes into focus
useFocusEffect(
  React.useCallback(() => {
    fetchDashboardData();
    return () => {};
  }, [])
);

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
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.headerSubtitle}>Your financial summary</Text>
      
      {/* Balance Card integrated in header */}
      <View style={styles.headerBalanceCard}>
        <View style={styles.headerBalanceSection}>
          <Text style={styles.headerBalanceLabel}>Current Balance</Text>          <Text style={styles.headerBalanceAmount}>
            ₹{userData?.balance?.toFixed(2) || '0.00'}
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
            navigation.navigate('Add');
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
        </TouchableOpacity>
      </View>      {/* Budget progress section */}
      {budgetData && budgetData.total !== undefined && budgetData.spent !== undefined && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly Budget</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BudgetDetails')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.budgetProgressContainer}>
            <Text style={styles.budgetInfoText}>
              {(budgetData.spent || 0) > (budgetData.total || 0) 
                ? 'Budget exceeded by ' 
                : 'Remaining budget: '
              }
              <Text style={
                (budgetData.spent || 0) > (budgetData.total || 0) 
                  ? styles.negativeAmount 
                  : styles.positiveAmount
              }>
                ₹{Math.abs((budgetData.total || 0) - (budgetData.spent || 0)).toFixed(2)}
              </Text>
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${Math.min(((budgetData.spent || 0) / (budgetData.total || 1)) * 100, 100)}%`,
                    backgroundColor: (budgetData.spent || 0) > (budgetData.total || 0) ? '#F44336' : '#4CAF50'
                  }
                ]} 
              />
            </View>            <Text style={styles.budgetRatioText}>
              ₹{(budgetData.spent || 0).toFixed(2)} of ₹{(budgetData.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>      )}

      <View style={styles.sectionSeparator} />
      
      {/* Expense summary chart */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Summary</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ExpenseAnalytics')}>
            <Text style={styles.seeAllText}>Details</Text>
          </TouchableOpacity>
        </View>        <View style={styles.chartContainer}>
          <ExpenseSummaryChart data={budgetData?.categories || []} />
        </View></View>

      <View style={styles.sectionSeparator} />
      
      {/* Recent transactions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
          {loading ? (
          // Show loading skeletons with safety check
          Array.isArray(Array.from({ length: 4 })) ? Array.from({ length: 4 }).map((_, index) => (
            <TransactionSkeleton key={`skeleton-${index}`} />
          )) : null        ) : !transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
          <Text style={styles.emptyStateText}>No recent transactions</Text>
        ) : (
          // Ensure transactions is an array before mapping
          Array.isArray(transactions) ? transactions.filter(t => t != null).map((transaction) => (
            transaction && transaction.id ? (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                onPress={() => {
                  Alert.alert(
                    'Transaction Details',
                    `Transaction ID: ${transaction.id}\nAmount: ₹${parseFloat(transaction.amount || 0).toFixed(2)}\nType: ${transaction.type || 'unknown'}`,
                    [{ text: 'OK' }]
                  );
                }}
              />            ) : null
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
}
});

export default DashboardScreen;