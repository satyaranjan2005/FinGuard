import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSpendingAnalytics, getFinancialInsights } from '../services/dataService';
import colors from '../utils/colors';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert, 
  showInfoAlert 
} from '../services/alertService';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const periods = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ];
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAnalytics();
    }, [selectedPeriod])
  );

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsData, insightsData] = await Promise.all([
        getSpendingAnalytics(selectedPeriod),
        getFinancialInsights()
      ]);
      
      // Ensure we have valid data structures
      setAnalytics(analyticsData || {
        totalSpent: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        transactionCount: 0,
        topCategories: []
      });
      
      setInsights(insightsData || {
        savingsRate: 0,
        totalIncome: 0,
        totalExpenses: 0,
        monthlyAverage: { income: 0, expenses: 0 },
        goalProgress: { target: 100000, current: 0, percentage: 0 },
        topCategories: []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data. Please try again.');
      
      // Set default empty state
      setAnalytics({
        totalSpent: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        transactionCount: 0,
        topCategories: []
      });
      setInsights({
        savingsRate: 0,
        totalIncome: 0,
        totalExpenses: 0,
        monthlyAverage: { income: 0, expenses: 0 },
        goalProgress: { target: 100000, current: 0, percentage: 0 },
        topCategories: []
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {Array.isArray(periods) && periods.map((period) => (
        <TouchableOpacity
          key={period.value}
          style={[
            styles.periodButton,
            selectedPeriod === period.value && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period.value)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.value && styles.periodButtonTextActive
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  const renderInsightsCard = () => {
    if (!insights) {
      return (
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.insightsCard}
        >
          <View style={styles.insightsHeader}>
            <Ionicons name="trending-up" size={28} color="white" />
            <Text style={styles.insightsTitle}>Financial Health</Text>
          </View>
          
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: 'white' }]}>Loading financial insights...</Text>
          </View>
        </LinearGradient>
      );
    }

    return (
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.insightsCard}
      >
        <View style={styles.insightsHeader}>
          <Ionicons name="trending-up" size={28} color="white" />
          <Text style={styles.insightsTitle}>Financial Health</Text>
        </View>
        
        <View style={styles.insightsGrid}>
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {(insights.savingsRate || 0).toFixed(1)}%
            </Text>
            <Text style={styles.insightLabel}>Savings Rate</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {formatCurrency(insights.monthlyAverage?.income || 0)}
            </Text>
            <Text style={styles.insightLabel}>Avg Income</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {formatCurrency(insights.monthlyAverage?.expenses || 0)}
            </Text>
            <Text style={styles.insightLabel}>Avg Expenses</Text>
          </View>
        </View>
        
        <View style={styles.goalProgress}>
          <Text style={styles.goalTitle}>Savings Goal Progress</Text>
          <View style={styles.goalProgressBar}>
            <View 
              style={[
                styles.goalProgressFill,
                { width: `${Math.min(insights.goalProgress?.percentage || 0, 100)}%` }
              ]}
            />
          </View>
          <Text style={styles.goalText}>
            {formatCurrency(insights.goalProgress?.current || 0)} of {formatCurrency(insights.goalProgress?.target || 100000)}
          </Text>
        </View>
      </LinearGradient>
    );
  };
  const renderTopCategories = () => {
    if (!analytics?.topCategories || !Array.isArray(analytics.topCategories) || analytics.topCategories.length === 0) {
      return (
        <View style={styles.categoriesCard}>
          <Text style={styles.cardTitle}>Top Spending Categories</Text>
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color={colors.neutral[400]} />
            <Text style={styles.emptyStateText}>No spending data available</Text>
            <Text style={styles.emptyStateSubtext}>Start adding transactions to see analytics</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.categoriesCard}>
        <Text style={styles.cardTitle}>Top Spending Categories</Text>
        {analytics.topCategories.map((category, index) => {
          // Safety check for category object
          if (!category || typeof category !== 'object') {
            return null;
          }
          
          return (
            <View key={`category-${index}`} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={styles.categoryRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <Text style={styles.categoryName}>{category.category || 'Unknown'}</Text>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.categoryAmountText}>
                  {formatCurrency(category.amount || 0)}
                </Text>
                <Text style={styles.categoryPercentage}>
                  {(category.percentage || 0).toFixed(1)}%
                </Text>
              </View>
            </View>
          );
        }).filter(Boolean)}
      </View>
    );
  };
  const renderSpendingOverview = () => {
    if (!analytics) {
      return (
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Spending Overview</Text>
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={colors.neutral[400]} />
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>Add some transactions to see your spending overview</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.overviewCard}>
        <Text style={styles.cardTitle}>Spending Overview</Text>
        
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <Ionicons name="card" size={24} color="#3b82f6" />
            <Text style={styles.overviewValue}>
              {formatCurrency(analytics.totalSpent || 0)}
            </Text>
            <Text style={styles.overviewLabel}>Total Spent</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Ionicons name="calendar" size={24} color="#10b981" />
            <Text style={styles.overviewValue}>
              {formatCurrency(analytics.dailyAverage || 0)}
            </Text>
            <Text style={styles.overviewLabel}>Daily Average</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Ionicons name="receipt" size={24} color="#f59e0b" />
            <Text style={styles.overviewValue}>
              {analytics.transactionCount || 0}
            </Text>
            <Text style={styles.overviewLabel}>Transactions</Text>
          </View>
          
          <View style={styles.overviewItem}>
            <Ionicons name="stats-chart" size={24} color="#8b5cf6" />
            <Text style={styles.overviewValue}>
              {formatCurrency(analytics.weeklyAverage || 0)}
            </Text>
            <Text style={styles.overviewLabel}>Weekly Avg</Text>
          </View>
        </View>
      </View>
    );
  };if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Analyzing your spending...</Text>
        </View>
      </SafeAreaView>
    );
  }  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => navigation.navigate('Goals')}
          >
            <Ionicons name="flag-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.gradients.goals[0]]}
            tintColor={colors.gradients.goals[0]}
          />
        }
      >
        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Financial Insights Card */}
        {renderInsightsCard()}

        {/* Spending Overview */}
        {renderSpendingOverview()}

        {/* Top Categories */}
        {renderTopCategories()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  insightsCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  insightItem: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  insightLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  goalProgress: {
    marginTop: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  overviewCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  categoriesCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },  categoryPercentage: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[600],
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.neutral[400],
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;
