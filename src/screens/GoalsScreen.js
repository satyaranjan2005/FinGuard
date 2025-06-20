import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchGoals, saveGoal, addToGoal, updateGoal, deleteGoal } from '../services/dataService';
import { storageService } from '../services/storageService';
import colors from '../utils/colors';

const GoalsScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showContribute, setShowContribute] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState('medium');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  useEffect(() => {
    loadGoals();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGoals();
    }, [])
  );  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await fetchGoals();
      
      // Ensure we have an array of goals
      if (!Array.isArray(goalsData)) {
        console.warn('Goals data is not an array, using empty array');
        setGoals([]);
        return;
      }
      
      // Process goals data to add calculated fields
      const processedGoals = goalsData.map(goal => ({
        ...goal,
        progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        remaining: Math.max(goal.targetAmount - goal.currentAmount, 0),
        daysLeft: goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 365
      }));
      
      setGoals(processedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Error', 'Failed to load goals. Please try again.');
      setGoals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleAddGoal = async () => {
    // Validation
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }
    
    if (!newGoalTarget || parseFloat(newGoalTarget) <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount greater than 0');
      return;
    }

    try {
      const goalData = {
        title: newGoalTitle.trim(),
        targetAmount: parseFloat(newGoalTarget),
        currentAmount: 0,
        category: newGoalCategory || 'General',
        priority: newGoalPriority,
        deadline: newGoalDeadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Save ₹${newGoalTarget} for ${newGoalTitle}`,
        createdAt: editingGoal ? editingGoal.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        Alert.alert('Success', 'Goal updated successfully!');
      } else {
        await saveGoal(goalData);
        Alert.alert('Success', 'Goal created successfully!');
      }

      resetForm();
      setShowAddGoal(false);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };
  const handleContribute = async () => {
    // Validation
    if (!contributionAmount || contributionAmount.trim() === '') {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!selectedGoal) {
      Alert.alert('Error', 'No goal selected');
      return;
    }
    
    // Check if contribution exceeds remaining amount
    const remaining = selectedGoal.targetAmount - selectedGoal.currentAmount;
    if (amount > remaining) {
      Alert.alert(
        'Amount Exceeds Target',
        `You're trying to add ₹${amount.toLocaleString('en-IN')} but only ₹${remaining.toLocaleString('en-IN')} is needed to reach the goal. Do you want to continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => proceedWithContribution(amount) }
        ]
      );
      return;
    }
    
    proceedWithContribution(amount);
  };
  
  const proceedWithContribution = async (amount) => {
    try {
      await addToGoal(selectedGoal.id, amount);
      Alert.alert('Success', `₹${amount.toLocaleString('en-IN')} added to ${selectedGoal.title}!`);
      setContributionAmount('');
      setShowContribute(false);
      setSelectedGoal(null);
      loadGoals();
    } catch (error) {
      console.error('Error adding contribution:', error);
      Alert.alert('Error', 'Failed to add contribution. Please try again.');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoalTitle(goal.title);
    setNewGoalTarget(goal.targetAmount.toString());
    setNewGoalCategory(goal.category);
    setNewGoalPriority(goal.priority);
    setNewGoalDeadline(goal.deadline);
    setShowAddGoal(true);
  };

  const handleDeleteGoal = (goal) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goal.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goal.id);
              Alert.alert('Success', 'Goal deleted successfully');
              loadGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };  const resetForm = () => {
    setNewGoalTitle('');
    setNewGoalTarget('');
    setNewGoalCategory('');
    setNewGoalPriority('medium');
    setNewGoalDeadline('');
    setEditingGoal(null);
    setShowAddGoal(false);
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
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

  const getPriorityGradient = (priority) => {
    switch (priority) {
      case 'high': return ['#ef4444', '#dc2626'];
      case 'medium': return ['#f59e0b', '#d97706'];
      case 'low': return ['#10b981', '#059669'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const getProgressGradient = (percentage) => {
    if (percentage >= 100) return ['#10b981', '#059669']; // Green for complete
    if (percentage >= 75) return ['#3b82f6', '#2563eb']; // Blue for high progress
    if (percentage >= 50) return ['#f59e0b', '#d97706']; // Orange for medium progress
    return ['#8b5cf6', '#7c3aed']; // Purple for low progress
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
  };  const renderGoalCard = (goal) => (
    <View key={goal.id} style={styles.goalCard}>
      {/* Goal Header with Gradient */}
      <LinearGradient
        colors={getPriorityGradient(goal.priority)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.goalHeader}
      >
        <View style={styles.goalHeaderContent}>
          <View style={styles.goalTitleSection}>
            <View style={styles.goalIconContainer}>
              <Ionicons name="trophy" size={18} color="white" />
            </View>
            <View style={styles.goalTitleInfo}>
              <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
              <Text style={styles.goalCategory} numberOfLines={1}>{goal.category}</Text>
            </View>
          </View>
          
          <View style={styles.priorityBadge}>
            <View style={styles.priorityDot} />
            <Text style={styles.priorityText}>{goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Goal Content */}
      <View style={styles.goalContent}>
        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <View style={styles.amountInfo}>
              <Text style={styles.currentAmount}>
                ₹{goal.currentAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.targetAmount}>
                of ₹{goal.targetAmount.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressPercentage}>
                {Math.round(goal.progressPercentage)}%
              </Text>
            </View>
          </View>

          {/* Enhanced Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={getProgressGradient(goal.progressPercentage)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(goal.progressPercentage, 100)}%` }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Goal Stats */}
        <View style={styles.goalStats}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="wallet-outline" size={14} color="#059669" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={styles.statValue}>₹{goal.remaining.toLocaleString('en-IN')}</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={[
              styles.statIconContainer, 
              { backgroundColor: goal.daysLeft < 30 ? '#fef2f2' : '#eff6ff' }
            ]}>
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={goal.daysLeft < 30 ? '#dc2626' : '#2563eb'} 
              />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>Timeline</Text>
              <Text style={[
                styles.statValue,
                goal.daysLeft < 30 && styles.urgentText
              ]}>
                {formatDaysLeft(goal.daysLeft)}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.goalActions}>          <TouchableOpacity 
            style={[
              styles.addMoneyButton,
              goal.progressPercentage >= 100 && styles.completedButton
            ]}
            onPress={() => {
              if (goal.progressPercentage >= 100) {
                Alert.alert(
                  'Goal Completed!',
                  `Congratulations! You've already reached your goal of ₹${goal.targetAmount.toLocaleString('en-IN')} for ${goal.title}.`,
                  [{ text: 'OK' }]
                );
                return;
              }
              setSelectedGoal(goal);
              setShowContribute(true);
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.goals}
              style={styles.addMoneyGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={16} color="white" />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditGoal(goal)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={colors.primary.main} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteGoal(goal)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger.main} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  };  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading your goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />        <LinearGradient
        colors={colors.gradients.goals}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Ionicons name="trophy" size={26} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Financial Goals</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowAddGoal(true)}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Track your savings progress</Text>
      </LinearGradient>

      <ScrollView 
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
            </View>
          ) : (
            Array.isArray(goals) ? goals.map(renderGoalCard) : null
          )}
        </View>
      </ScrollView>      {/* Add/Edit Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddGoal}
        onRequestClose={() => resetForm()}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <LinearGradient
                  colors={colors.gradients.goals}
                  style={styles.modalIconBackground}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="trophy" size={24} color="white" />
                </LinearGradient>
              </View>
              <Text style={styles.modalTitle}>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={resetForm}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Goal Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  value={newGoalTitle}
                  onChangeText={setNewGoalTitle}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Amount</Text>
                <View style={styles.inputWithIcon}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={[styles.input, styles.inputWithCurrency]}
                    placeholder="50,000"
                    value={newGoalTarget}
                    onChangeText={setNewGoalTarget}
                    keyboardType="numeric"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Travel, Education, Emergency"
                  value={newGoalCategory}
                  onChangeText={setNewGoalCategory}
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>
              
              <View style={styles.priorityContainer}>
                <Text style={styles.inputLabel}>Priority Level</Text>
                <View style={styles.priorityButtons}>
                  {[
                    { key: 'low', label: 'Low', color: '#10b981' },
                    { key: 'medium', label: 'Medium', color: '#f59e0b' },
                    { key: 'high', label: 'High', color: '#ef4444' }
                  ].map((priority) => (
                    <TouchableOpacity
                      key={priority.key}
                      style={[
                        styles.priorityButton,
                        newGoalPriority === priority.key && { 
                          backgroundColor: priority.color + '20',
                          borderColor: priority.color,
                        }
                      ]}
                      onPress={() => setNewGoalPriority(priority.key)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.priorityIndicator,
                        { backgroundColor: priority.color }
                      ]} />
                      <Text style={[
                        styles.priorityText,
                        newGoalPriority === priority.key && { 
                          color: priority.color,
                          fontWeight: '600'
                        }
                      ]}>
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddGoal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.goals}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons 
                    name={editingGoal ? "checkmark-circle" : "add-circle"} 
                    size={18} 
                    color="white" 
                    style={styles.saveButtonIcon} 
                  />
                  <Text style={styles.saveButtonText}>
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showContribute}
        onRequestClose={() => {
          setShowContribute(false);
          setSelectedGoal(null);
          setContributionAmount('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Money to {selectedGoal?.title}
            </Text>
            
            <View style={styles.goalInfo}>
              <Text style={styles.goalInfoText}>
                Current: ₹{selectedGoal?.currentAmount?.toLocaleString('en-IN') || '0'}
              </Text>
              <Text style={styles.goalInfoText}>
                Target: ₹{selectedGoal?.targetAmount?.toLocaleString('en-IN') || '0'}
              </Text>
              <Text style={styles.goalInfoText}>
                Remaining: ₹{(selectedGoal?.targetAmount - selectedGoal?.currentAmount)?.toLocaleString('en-IN') || '0'}
              </Text>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Amount to add (₹)"
              value={contributionAmount}
              onChangeText={setContributionAmount}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowContribute(false);
                  setSelectedGoal(null);
                  setContributionAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleContribute}
              >
                <LinearGradient
                  colors={colors.gradients.goals}
                  style={styles.saveButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons 
                    name="add-circle" 
                    size={20} 
                    color="white" 
                    style={styles.saveButtonIcon} 
                  />
                  <Text style={styles.saveButtonText}>Add Money</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: colors.background,
  },header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 17,
    marginRight: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  headerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 17,
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
  },  goalsContainer: {
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },  goalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  goalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  goalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  goalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  goalTitleInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  goalCategory: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    marginRight: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  goalContent: {
    padding: 16,
  },
  amountSection: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountInfo: {
    flex: 1,
  },
  currentAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  targetAmount: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  progressBadge: {
    backgroundColor: colors.primary.main + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.main,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalStats: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
    marginBottom: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.neutral[300],
    marginHorizontal: 10,
  },
  urgentText: {
    color: colors.danger.main,
    fontWeight: '700',
  },
  goalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  addMoneyButton: {
    flex: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addMoneyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },  addMoneyText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginLeft: 5,
  },
  completedButton: {
    opacity: 0.6,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
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
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalIconBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.neutral[50],
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 12,
    backgroundColor: colors.neutral[50],
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: 8,
  },
  inputWithCurrency: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingLeft: 0,
  },
  priorityContainer: {
    marginBottom: 24,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },  goalInfo: {
    backgroundColor: colors.neutral[50],
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  goalInfoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GoalsScreen;
