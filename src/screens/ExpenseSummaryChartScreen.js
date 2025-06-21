import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchRecentTransactions } from '../services/dataService';
import ExpenseSummaryChart from '../components/ExpenseSummaryChart';
import { colors } from '../utils/colors';

const screenWidth = Dimensions.get('window').width;

const ExpenseSummaryChartScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // Default to monthly view

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch more transactions to have comprehensive data for the chart
      const recentTransactions = await fetchRecentTransactions(200);
      setTransactions(recentTransactions || []);
      
    } catch (err) {
      setError('Failed to load expense data');
      console.error('Expense data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { key: 'week', label: '1 Week' },
    { key: 'month', label: '1 Month' },
    { key: 'quarter', label: '3 Months' },
    { key: 'year', label: 'Year' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Analytics</Text>
        <View style={styles.placeholderButton} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading expense data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.periodSelector}>
              {periods.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.periodButton,
                    period === p.key && styles.activePeriodButton
                  ]}
                  onPress={() => setPeriod(p.key)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      period === p.key && styles.activePeriodButtonText
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.chartContainer}>
              <ExpenseSummaryChart 
                expenses={transactions} 
                period={period}
              />
            </View>
            
            <Text style={styles.infoText}>
              This chart shows your expenses broken down by category for the selected time period.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  placeholderButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  periodButtonText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  chartContainer: {
    marginVertical: 20,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
  }
});

export default ExpenseSummaryChartScreen;
