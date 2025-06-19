import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchGoals, saveGoal } from '../services/dataService';
import colors from '../utils/colors';

const GoalsScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await fetchGoals();
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Error', 'Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDaysLeft = (days) => {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day left';
    if (days < 30) return `${days} days left`;
    if (days < 365) return `${Math.ceil(days / 30)} months left`;
    return `${Math.ceil(days / 365)} years left`;
  };

  const renderGoalCard = (goal) => (
    <View key={goal.id} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleRow}>
          <Text style={styles.goalTitle}>{goal.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(goal.priority) }]}>
            <Text style={styles.priorityText}>{goal.priority.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.goalCategory}>{goal.category}</Text>
      </View>

      <View style={styles.goalContent}>
        <View style={styles.amountRow}>
          <Text style={styles.currentAmount}>{formatCurrency(goal.currentAmount)}</Text>
          <Text style={styles.targetAmount}>of {formatCurrency(goal.targetAmount)}</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${Math.min(goal.progressPercentage, 100)}%`,
                  backgroundColor: getProgressColor(goal.progressPercentage)
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {goal.progressPercentage.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.goalFooter}>
          <View style={styles.remainingAmount}>
            <Ionicons name="flag-outline" size={16} color="#6b7280" />
            <Text style={styles.remainingText}>
              {formatCurrency(goal.remaining)} remaining
            </Text>
          </View>
          
          <View style={styles.deadline}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={[
              styles.deadlineText,
              goal.daysLeft < 30 && styles.urgentText
            ]}>
              {formatDaysLeft(goal.daysLeft)}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.addMoneyButton}>
        <Ionicons name="add" size={20} color="#3b82f6" />
        <Text style={styles.addMoneyText}>Add Money</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSummaryCard = () => {
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    return (
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.summaryCard}
      >
        <View style={styles.summaryHeader}>
          <Ionicons name="trophy" size={28} color="white" />
          <Text style={styles.summaryTitle}>Goals Overview</Text>
        </View>
        
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Progress</Text>
            <Text style={styles.summaryValue}>{overallProgress.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Saved</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalCurrent)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Target</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalTarget)}</Text>
          </View>
        </View>
        
        <View style={styles.summaryProgressBar}>
          <View 
            style={[
              styles.summaryProgressFill,
              { width: `${Math.min(overallProgress, 100)}%` }
            ]}
          />
        </View>
      </LinearGradient>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Financial Goals</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="white" />
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
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Summary Card */}
        {renderSummaryCard()}

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Goals Yet</Text>
              <Text style={styles.emptyMessage}>
                Start by setting your first financial goal
              </Text>
            </View>          ) : (
            Array.isArray(goals) ? goals.map(renderGoalCard) : null
          )}
        </View>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  summaryCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  summaryContent: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  summaryProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  goalsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    marginBottom: 16,
  },
  goalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  goalCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  goalContent: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  targetAmount: {
    fontSize: 16,
    color: '#64748b',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    minWidth: 45,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remainingAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  urgentText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  addMoneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addMoneyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default GoalsScreen;
