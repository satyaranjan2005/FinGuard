import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchRecentTransactions, deleteTransaction as deleteTransactionService } from '../services/dataService';
import colors from '../utils/colors';
import { emitEvent, EVENTS } from '../utils/eventEmitter';

// Helper function to darken/lighten colors
const shadeColor = (color, percent) => {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  R = Math.round(R);
  G = Math.round(G);
  B = Math.round(B);

  const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
  const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
  const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

  return "#" + RR + GG + BB;
};

const TransactionHistory = ({ navigation, route }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');  useEffect(() => {
    loadTransactions();
  }, []);

  // Handle route parameters for initial filtering (e.g., from BudgetScreen)
  useEffect(() => {
    if (route?.params) {
      const { categoryFilter, timeFilter } = route.params;
      if (categoryFilter) {
        setSelectedCategoryFilter(categoryFilter);
      }
      if (timeFilter) {
        setSelectedTimeFilter(timeFilter);
      }
    }
  }, [route?.params]);

  useEffect(() => {
    applyFilters(transactions);
  }, [transactions, selectedTimeFilter, selectedCategoryFilter]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );
  const loadTransactions = async () => {
    try {
      setLoading(true);
      // Fetch more transactions for better analysis
      const transactionData = await fetchRecentTransactions(100);
      
      if (Array.isArray(transactionData)) {
        // Sort by date (newest first) and ensure proper date parsing
        const sortedTransactions = transactionData
          .map(transaction => ({
            ...transaction,
            date: typeof transaction.date === 'string' ? transaction.date : new Date(transaction.date).toISOString()
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(sortedTransactions);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(sortedTransactions.map(t => t.category))];
        setCategories(uniqueCategories);
      } else {
        console.warn('Invalid transaction data received');
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const onRefresh = async () => {
  setRefreshing(true);
  await loadTransactions();
  setRefreshing(false);
};

const applyFilters = (transactionList) => {
  let filtered = [...transactionList];
  
  // Apply time filter
  if (selectedTimeFilter !== 'all') {
    const now = new Date();
    let cutoffDate;
    
    if (selectedTimeFilter === '7days') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (selectedTimeFilter === '1month') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    if (cutoffDate) {
      filtered = filtered.filter(transaction => new Date(transaction.date) >= cutoffDate);
    }
  }
  
  // Apply category filter
  if (selectedCategoryFilter !== 'all') {
    filtered = filtered.filter(transaction => transaction.category === selectedCategoryFilter);
  }
  
  setFilteredTransactions(filtered);
};

const handleFilterPress = () => {
  setFilterModalVisible(true);
};

const applyTimeFilter = (timeFilter) => {
  setSelectedTimeFilter(timeFilter);
};

const applyCategoryFilter = (categoryFilter) => {
  setSelectedCategoryFilter(categoryFilter);
};

const clearFilters = () => {
  setSelectedTimeFilter('all');
  setSelectedCategoryFilter('all');
};

  const deleteTransaction = async (transactionId) => {
    setModalVisible(false);
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',          onPress: async () => {
            try {
              await deleteTransactionService(transactionId);
              
              // Ensure budgets are updated by directly importing and calling the function
              const { updateBudgetSummary } = require('../services/dataService');
              console.log('TransactionHistory: Manually updating budget summary after delete');
              await updateBudgetSummary();
              
              // Broadcast that a transaction was deleted
              emitEvent(EVENTS.TRANSACTION_DELETED, { transactionId });
              emitEvent(EVENTS.BALANCE_CHANGED);
              emitEvent(EVENTS.BUDGET_UPDATED, { forcedUpdate: true });
              
              Alert.alert('Success', 'Transaction deleted successfully');
              // Reload transactions to reflect changes
              loadTransactions();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

const formatAmount = (amount, type) => {
  const formattedAmount = Math.abs(amount).toFixed(2);
  return type === 'expense' ? `-₹${formattedAmount}` : `+₹${formattedAmount}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getCategoryIcon = (category) => {
  const icons = {
    food: 'restaurant',
    transportation: 'car',
    shopping: 'bag',
    entertainment: 'game-controller',
    bills: 'receipt',
    healthcare: 'medical',
    income: 'cash',
    education: 'school',
    investment: 'trending-up',
    savings: 'wallet',
    utilities: 'home',
    travel: 'airplane',
    subscriptions: 'repeat',
    gifts: 'gift',
    clothing: 'shirt',
    technology: 'hardware-chip',
    fitness: 'fitness',
    personal: 'person',
    household: 'home',
    pets: 'paw',
    charity: 'heart',
    taxes: 'document-text',
    insurance: 'shield-checkmark',
    maintenance: 'construct',
    childcare: 'people',
    beauty: 'cut',
    other: 'apps',
  };
  // Return the specific icon or a category icon instead of ellipsis
  return icons[category] || 'apps';
};

const getCategoryColor = (category) => {
  const colors = {
    food: '#FF6B6B',
    transportation: '#4ECDC4',
    shopping: '#45B7D1',
    entertainment: '#9B59B6',
    bills: '#F39C12',
    healthcare: '#E74C3C',
    income: '#27AE60',
    education: '#3498DB',
    investment: '#8E44AD',
    savings: '#16A085',
    utilities: '#E67E22',
    travel: '#2ECC71',
    subscriptions: '#6C5CE7',
    gifts: '#FD79A8',
    clothing: '#FDA7DF',
    technology: '#0984E3',
    fitness: '#00CEC9',
    personal: '#6C5CE7',
    household: '#74B9FF',
    pets: '#A29BFE',
    charity: '#D980FA',
    taxes: '#C0392B',
    insurance: '#3498DB',
    maintenance: '#EE5A24',
    childcare: '#F78FB3',
    beauty: '#9980FA',
    other: '#636E72',
  };
  // Return the specific color or a nice default color
  return colors[category] || '#636E72';
};
  const renderTransaction = ({ item, index }) => {
    const isIncome = item.type === 'income';
    const categoryColor = getCategoryColor(item.category);
    
    return (
      <TouchableOpacity 
        style={[styles.transactionCard, { marginTop: index === 0 ? 20 : 12 }]}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.transactionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.transactionContent}>
            {/* Left Section - Icon and Details */}
            <View style={styles.leftSection}>
              <LinearGradient
                colors={[categoryColor, shadeColor(categoryColor, -15)]}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={getCategoryIcon(item.category)}
                  size={24}
                  color="white"
                />
              </LinearGradient>
              
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle} numberOfLines={1}>
                  {item.description || item.title || 'Transaction'}
                </Text>
                  <View style={styles.metaRow}>
                  <View style={[styles.categoryChip, { backgroundColor: `${categoryColor}15` }]}>
                    <Text style={[styles.categoryChipText, { color: categoryColor }]}>
                      {item.category?.charAt(0).toUpperCase() + item.category?.slice(1) || 'Other'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.transactionDate}>
                  {formatDate(item.date)}
                </Text>
              </View>
            </View>
            
            {/* Right Section - Amount */}
            <View style={styles.rightSection}>
              <Text style={[
                styles.transactionAmount,
                { color: isIncome ? '#27AE60' : '#E74C3C' }
              ]}>
                {isIncome ? '+' : '-'}₹{Math.abs(item.amount || 0).toLocaleString('en-IN')}
              </Text>
              
              <LinearGradient
                colors={isIncome ? ['#27AE60', '#219A52'] : ['#E74C3C', '#C0392B']}
                style={styles.typeIndicator}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name={isIncome ? 'arrow-up' : 'arrow-down'} 
                  size={12} 
                  color="white" 
                />
              </LinearGradient>
            </View>
          </View>
          
          {/* Bottom accent with subtle gradient */}
          <LinearGradient
            colors={[categoryColor, shadeColor(categoryColor, -20)]}
            style={styles.categoryAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['rgba(79, 142, 247, 0.05)', 'rgba(108, 99, 255, 0.05)']}
        style={styles.emptyIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="receipt-outline" size={64} color="rgba(79, 142, 247, 0.6)" />
      </LinearGradient>
      <Text style={styles.emptyStateTitle}>No transactions yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Start adding transactions to track your spending and build your financial history
      </Text>
      <TouchableOpacity
        style={styles.addTransactionCTA}
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4F8EF7', '#6C63FF']}
          style={styles.addTransactionCTAGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add-circle" size={20} color="white" style={styles.ctaIcon} />
          <Text style={styles.addTransactionCTAText}>Add Your First Transaction</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

const handleTransactionPress = (transaction) => {
  setSelectedTransaction(transaction);
  setModalVisible(true);
};

return (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor="#4F8EF7" />
    
    {/* Modern gradient header */}
    <LinearGradient
      colors={['#4F8EF7', '#6C63FF']}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="receipt" size={24} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Transaction History</Text>
          </View>
        </View>        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleFilterPress}
          >
            <Ionicons name="filter" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>      <Text style={styles.headerSubtitle}>
        {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
      </Text>
      
      {/* Transaction Summary Card */}
      {filteredTransactions.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryIncomeAmount}>
              ₹{filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryExpenseAmount}>
              ₹{filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>    {/* Transaction List with Heading */}    <View style={styles.transactionSection}>
      {filteredTransactions.length > 0 && (
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionHeading}>Recent Transactions</Text>
          <Text style={styles.transactionCount}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
        <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={filteredTransactions.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.gradients.transactions[0]]}
            tintColor={colors.gradients.transactions[0]}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </View>

    {/* Transaction Action Modal */}    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {selectedTransaction && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTop}>
                  <View style={[
                    styles.modalIconContainer,
                    { backgroundColor: `${getCategoryColor(selectedTransaction.category)}20` }
                  ]}>
                    <Ionicons
                      name={getCategoryIcon(selectedTransaction.category)}
                      size={36}
                      color={getCategoryColor(selectedTransaction.category)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                  <View style={styles.modalHeaderInfo}>
                  <Text style={styles.modalTitle}>{selectedTransaction.description}</Text>
                  <Text style={[
                    styles.modalAmount,
                    { color: selectedTransaction.type === 'expense' ? '#FF6B6B' : '#4ECDC4' }
                  ]}>
                    {formatAmount(selectedTransaction.amount, selectedTransaction.type)}
                  </Text>
                  <View style={styles.badgesContainer}>
                    <View style={[
                      styles.modalTypeBadge,
                      { backgroundColor: selectedTransaction.type === 'expense' ? '#FFEDED' : '#E8F8F5' }
                    ]}>
                      <Ionicons 
                        name={selectedTransaction.type === 'expense' ? 'arrow-down' : 'arrow-up'} 
                        size={12}
                        color={selectedTransaction.type === 'expense' ? '#FF6B6B' : '#4ECDC4'} 
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[
                        styles.modalTypeText,
                        { color: selectedTransaction.type === 'expense' ? '#FF6B6B' : '#4ECDC4' }
                      ]}>
                        {selectedTransaction.type.toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.modalCategoryBadge,
                      { backgroundColor: `${getCategoryColor(selectedTransaction.category)}15` }
                    ]}>
                      <Ionicons 
                        name={getCategoryIcon(selectedTransaction.category)} 
                        size={12} 
                        color={getCategoryColor(selectedTransaction.category)}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[
                        styles.modalCategoryText,
                        { color: getCategoryColor(selectedTransaction.category) }
                      ]}>
                        {selectedTransaction.category.charAt(0).toUpperCase() + selectedTransaction.category.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Transaction Details */}
              <View style={styles.modalDetails}>
                <Text style={styles.modalSectionTitle}>Transaction Details</Text>
                  <View style={styles.modalDetailRow}>
                  <View style={[
                    styles.modalDetailItem,
                    { borderLeftColor: getCategoryColor(selectedTransaction.category) }
                  ]}>
                    <Ionicons
                      name={getCategoryIcon(selectedTransaction.category)}
                      size={20} 
                      color={getCategoryColor(selectedTransaction.category)} 
                    />
                    <View style={styles.modalDetailText}>
                      <Text style={styles.modalDetailLabel}>Category</Text>
                      <Text style={[
                        styles.modalDetailValue,
                        { color: getCategoryColor(selectedTransaction.category) }
                      ]}>
                        {selectedTransaction.category.charAt(0).toUpperCase() + selectedTransaction.category.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailItem}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <View style={styles.modalDetailText}>
                      <Text style={styles.modalDetailLabel}>Date</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedTransaction.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedTransaction.notes && (
                  <View style={styles.modalDetailRow}>
                    <View style={styles.modalDetailItem}>
                      <Ionicons name="document-text-outline" size={20} color="#666" />
                      <View style={styles.modalDetailText}>
                        <Text style={styles.modalDetailLabel}>Notes</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedTransaction.notes}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.modalDetailRow}>
                  <View style={styles.modalDetailItem}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <View style={styles.modalDetailText}>
                      <Text style={styles.modalDetailLabel}>Added</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedTransaction.date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalDeleteButton]}
                  onPress={() => deleteTransaction(selectedTransaction.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.modalActionText, { color: '#FF6B6B' }]}>Delete Transaction</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* Filter Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModalContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Transactions</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Time Period Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Period</Text>
              <View style={styles.filterOptionsContainer}>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: '7days', label: 'Last 7 Days' },
                  { key: '1month', label: 'Last Month' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.filterOption,
                      selectedTimeFilter === option.key && styles.filterOptionSelected
                    ]}
                    onPress={() => applyTimeFilter(option.key)}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedTimeFilter === option.key && styles.filterOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedCategoryFilter === 'all' && styles.filterOptionSelected
                  ]}
                  onPress={() => applyCategoryFilter('all')}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedCategoryFilter === 'all' && styles.filterOptionTextSelected
                  ]}>
                    All Categories
                  </Text>
                </TouchableOpacity>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterOption,
                      selectedCategoryFilter === category && styles.filterOptionSelected
                    ]}
                    onPress={() => applyCategoryFilter(category)}
                  >
                    <View style={styles.filterCategoryRow}>
                      <Ionicons 
                        name={getCategoryIcon(category)} 
                        size={20} 
                        color={getCategoryColor(category)} 
                        style={styles.filterCategoryIcon}
                      />
                      <Text style={[
                        styles.filterOptionText,
                        selectedCategoryFilter === category && styles.filterOptionTextSelected
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Filter Actions */}
          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
header: {
  paddingHorizontal: 20,
  paddingVertical: 16,
  paddingTop: 16,
  paddingBottom: 24,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  elevation: 8,
  shadowColor: '#4F8EF7',
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
  flex: 1,
},
headerTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
},
headerButton: {
  width: 36,
  height: 36,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 18,
},
headerIcon: {
  marginRight: 10,
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
  marginTop: 8,
},
listContainer: {
  paddingBottom: 100,
},
transactionSection: {
  flex: 1,
  backgroundColor: '#F8FAFC',
},
transactionHeader: {
  paddingHorizontal: 20,
  paddingTop: 24,
  paddingBottom: 12,
  backgroundColor: '#F8FAFC',
},
transactionHeading: {
  fontSize: 20,
  fontWeight: '700',
  color: '#1A1A2E',
  marginBottom: 4,
  letterSpacing: 0.2,
},
transactionCount: {
  fontSize: 13,
  color: '#666680',
  fontWeight: '500',
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 40,
},  // Modern Transaction Card Styles
  transactionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  transactionGradient: {
    borderRadius: 20,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 142, 247, 0.1)',
  },  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  transactionDate: {
    fontSize: 13,
    color: '#666680',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  typeIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryAccent: {
    height: 4,
    width: '100%',
  },
transactionInner: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  position: 'relative',
},
categoryContainer: {
  marginRight: 16,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.15,
  shadowRadius: 5,
  elevation: 4,
},
categoryIconGradient: {
  width: 54,
  height: 54,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 12,
},
categoryIconImage: {
  textShadowColor: 'rgba(0, 0, 0, 0.2)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 3,
},
transactionDetails: {
  flex: 1,
  paddingRight: 8,
},
titleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
},
transactionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#303030',
  flex: 1,
  paddingRight: 8,
  letterSpacing: 0.2,
},
categoryBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: 'rgba(240, 240, 255, 0.8)',
},
categoryBadgeIcon: {
  marginRight: 4,
},
categoryText: {
  fontSize: 11,
  fontWeight: '600',
  textTransform: 'capitalize',
},
transactionMeta: {
  flexDirection: 'row',
  alignItems: 'center',
},
metaIcon: {
  marginRight: 4,
},
metaDot: {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: '#CCCCCC',
  marginHorizontal: 6,
},
transactionDate: {
  fontSize: 12,
  color: '#777',
  fontWeight: '500',
  marginRight: 6,
},
amountContainer: {
  paddingLeft: 12,
  borderLeftWidth: 1,
  borderLeftColor: 'rgba(230, 230, 250, 0.5)',
  minWidth: 90,
},
transactionAmount: {
  fontSize: 17,
  fontWeight: '700',
  textAlign: 'right',
  letterSpacing: 0.5,
},  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
    backgroundColor: '#F8FAFC',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#666680',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
    letterSpacing: 0.2,
  },
  addTransactionCTA: {
    borderRadius: 25,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addTransactionCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  ctaIcon: {
    marginRight: 10,
  },  addTransactionCTAText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Modal and other existing styles...
  summaryCard: {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},
summarySection: {
  flex: 1,
  alignItems: 'center',
},
summaryDivider: {
  width: 1,
  height: 40,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  marginHorizontal: 16,
},
summaryLabel: {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 12,
  marginBottom: 4,
},
summaryIncomeAmount: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
summaryExpenseAmount: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},
// Modal Styles
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
},
modalContainer: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 8,
  paddingHorizontal: 20,
  paddingBottom: 34,
  maxHeight: '85%',
  flex: 1,
},
modalHeader: {
  paddingVertical: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},
modalHeaderTop: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
modalIconContainer: {
  width: 64,
  height: 64,
  borderRadius: 32,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 3,
  borderColor: 'rgba(255, 255, 255, 0.8)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
modalHeaderInfo: {
  alignItems: 'center',
  marginTop: 8,
},
modalTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: '#1A1A1A',
  marginBottom: 8,
  textAlign: 'center',
},
modalAmount: {
  fontSize: 28,
  fontWeight: '800',
  marginBottom: 8,
  textAlign: 'center',
},
badgesContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  marginTop: 4,
},
modalTypeBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
},
modalTypeText: {
  fontSize: 12,
  fontWeight: '700',
  letterSpacing: 0.5,
},
modalCategoryBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  backgroundColor: 'rgba(240, 240, 255, 0.8)',
},
modalCategoryText: {
  fontSize: 12,
  fontWeight: '600',
  textTransform: 'capitalize',
},
modalCloseButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#F8F9FA',
  alignItems: 'center',
  justifyContent: 'center',
},
modalActions: {
  paddingTop: 20,
  alignItems: 'center',
  borderTopWidth: 1,
  borderTopColor: '#F0F0F0',
  marginTop: 10,
},
modalActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 16,
  paddingHorizontal: 32,
  borderRadius: 12,
  borderWidth: 1.5,
  minWidth: 200,
},
modalDeleteButton: {
  backgroundColor: '#FFE8E8',
  borderColor: '#FF6B6B',
},
modalActionText: {
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 12,
},
modalDetails: {
  paddingVertical: 20,
},
modalScrollView: {
  flex: 1,
},
modalSectionTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1A1A1A',
  marginBottom: 16,
  textAlign: 'center',
},
modalDetailRow: {
  marginBottom: 16,
},
modalDetailItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: '#F8F9FA',
  borderRadius: 12,
  borderLeftWidth: 4,
  borderLeftColor: '#E5E5E5',
},
modalDetailText: {
  marginLeft: 12,
  flex: 1,
},
modalDetailLabel: {
  fontSize: 12,
  color: '#666',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 2,
},
modalDetailValue: {
  fontSize: 16,
  color: '#1A1A1A',
  fontWeight: '500',
  lineHeight: 20,
},

// Filter Modal Styles
filterModalContainer: {
  backgroundColor: '#FFFFFF',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 8,
  paddingHorizontal: 20,
  paddingBottom: 34,
  maxHeight: '80%',
  flex: 1,
},
filterHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F0F0',
},
filterTitle: {
  fontSize: 22,
  fontWeight: '700',
  color: '#1A1A1A',
},
filterContent: {
  flex: 1,
  paddingVertical: 20,
},
filterSection: {
  marginBottom: 32,
},
filterSectionTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1A1A1A',
  marginBottom: 16,
},
filterOptionsContainer: {
  gap: 12,
},
filterOption: {
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E5E5E5',
  backgroundColor: '#FFFFFF',
},
filterOptionSelected: {
  borderColor: '#4F8EF7',
  backgroundColor: '#F0F7FF',
},
filterOptionText: {
  fontSize: 16,
  fontWeight: '500',
  color: '#1A1A1A',
},
filterOptionTextSelected: {
  color: '#4F8EF7',
  fontWeight: '600',
},
filterCategoryRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
filterCategoryIcon: {
  marginRight: 12,
},
filterActions: {
  flexDirection: 'row',
  gap: 12,
  paddingTop: 20,
  borderTopWidth: 1,
  borderTopColor: '#F0F0F0',
},
clearFiltersButton: {
  flex: 1,
  paddingVertical: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#FF6B6B',
  backgroundColor: '#FFF5F5',
  alignItems: 'center',
},
clearFiltersText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#FF6B6B',
},
applyFiltersButton: {
  flex: 1,
  paddingVertical: 16,
  borderRadius: 12,
  backgroundColor: '#4F8EF7',
  alignItems: 'center',
},
applyFiltersText: {
  fontSize: 16,
  fontWeight: '600',
  color: 'white',
}
});

export default TransactionHistory;