import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';

const TransactionHistoryScreen = ({ navigation }) => {
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('all');

const categories = ['all', 'food', 'transport', 'entertainment', 'shopping', 'bills', 'health', 'other'];

useEffect(() => {
  loadTransactions();
}, []);

const loadTransactions = async () => {
  try {
    const storedTransactions = await AsyncStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      // Sort by date (newest first)
      const sortedTransactions = parsedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedTransactions);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to load transactions');
  } finally {
    setLoading(false);
  }
};

const onRefresh = async () => {
  setRefreshing(true);
  await loadTransactions();
  setRefreshing(false);
};

const deleteTransaction = async (transactionId) => {
  Alert.alert(
    'Delete Transaction',
    'Are you sure you want to delete this transaction?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedTransactions = transactions.filter(t => t.id !== transactionId);
            setTransactions(updatedTransactions);
            await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete transaction');
          }
        },
      },
    ]
  );
};

const filteredTransactions = selectedCategory === 'all' 
  ? transactions 
  : transactions.filter(t => t.category === selectedCategory);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatAmount = (amount, type) => {
  const formattedAmount = Math.abs(amount).toFixed(2);
  return type === 'expense' ? `-₹${formattedAmount}` : `+₹${formattedAmount}`;
};

const getCategoryIcon = (category) => {
  const iconMap = {
    food: 'restaurant',
    transport: 'car',
    entertainment: 'game-controller',
    shopping: 'bag',
    bills: 'receipt',
    health: 'medical',
    other: 'ellipse',
  };
  return iconMap[category] || 'ellipse';
};

const renderTransaction = ({ item }) => (
  <View style={styles.transactionCard}>
    <View style={styles.transactionHeader}>
      <View style={styles.iconContainer}>
        <Ionicons 
          name={getCategoryIcon(item.category)} 
          size={24} 
          color="#4A90E2" 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.title}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text 
          style={[
            styles.transactionAmount,
            { color: item.type === 'expense' ? '#E74C3C' : '#27AE60' }
          ]}
        >
          {formatAmount(item.amount, item.type)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTransaction(item.id)}
        accessibilityLabel="Delete transaction"
      >
        <Ionicons name="trash-outline" size={20} color="#E74C3C" />
      </TouchableOpacity>
    </View>
    {item.description && (
      <Text style={styles.transactionDescription}>{item.description}</Text>
    )}
  </View>
);

const renderCategoryFilter = () => (
  <View style={styles.filterContainer}>
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === item && styles.filterButtonActive
          ]}
          onPress={() => setSelectedCategory(item)}
        >
          <Text
            style={[
              styles.filterText,
              selectedCategory === item && styles.filterTextActive
            ]}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </Text>
        </TouchableOpacity>
      )}
    />
  </View>
);

const renderEmptyState = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="receipt-outline" size={64} color="#BDC3C7" />
    <Text style={styles.emptyTitle}>No Transactions Found</Text>
    <Text style={styles.emptySubtitle}>
      {selectedCategory === 'all' 
        ? 'Start adding transactions to see your history'
        : `No transactions found in ${selectedCategory} category`
      }
    </Text>
  </View>
);

return (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
    
    {/* Modern gradient header */}
    <LinearGradient
      colors={colors?.gradients?.transactions || ['#f59e0b', '#d97706']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Ionicons name="time" size={28} color="white" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>Transaction History</Text>
        </View>        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('Add')}
            accessibilityLabel="Add new transaction"
          >
            <Ionicons name="add-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>      <Text style={styles.headerSubtitle}>Track and manage your transactions</Text>
    </LinearGradient>

    {renderCategoryFilter()}

    <FlatList
      data={filteredTransactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={!loading && renderEmptyState()}
    />
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: colors?.background || '#f8fafc',
},
header: {
  paddingHorizontal: 16,
  paddingVertical: 16,
  paddingTop: 20,
  paddingBottom: 24,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  elevation: 8,
  shadowColor: colors?.warning?.main || '#f59e0b',
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
  fontSize: 22,
  fontWeight: '700',
},
headerSubtitle: {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: 14,
  fontWeight: '400',
},
filterContainer: {
  paddingVertical: 16,
  paddingHorizontal: 16,
  backgroundColor: colors?.surface || '#ffffff',
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
  marginTop: -12,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},
filterButton: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  marginHorizontal: 4,
  marginLeft: 16,
  borderRadius: 20,
  backgroundColor: '#f1f5f9',
  borderWidth: 1,
  borderColor: '#e2e8f0',
},
filterButtonActive: {
  backgroundColor: colors?.warning?.main || '#f59e0b',
  borderColor: colors?.warning?.main || '#f59e0b',
},
filterText: {
  fontSize: 14,
  color: colors?.text?.secondary || '#6b7280',
  fontWeight: '500',
},
filterTextActive: {
  color: 'white',
  fontWeight: '600',
},
listContainer: {
  padding: 16,
  paddingBottom: 100, // Add extra space for bottom tab navigation
  flexGrow: 1,
},
transactionCard: {
  backgroundColor: colors?.surface || '#ffffff',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},
transactionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},
iconContainer: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#E3F2FD',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},
transactionDetails: {
  flex: 1,
},
transactionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#2C3E50',
  marginBottom: 2,
},
transactionCategory: {
  fontSize: 12,
  color: '#7F8C8D',
  textTransform: 'capitalize',
  marginBottom: 2,
},
transactionDate: {
  fontSize: 12,
  color: '#95A5A6',
},
amountContainer: {
  alignItems: 'flex-end',
  marginRight: 8,
},
transactionAmount: {
  fontSize: 16,
  fontWeight: '700',
},
deleteButton: {
  padding: 8,
},
transactionDescription: {
  fontSize: 14,
  color: '#7F8C8D',
  marginTop: 8,
  marginLeft: 60,
},
emptyContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 32,
},
emptyTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#2C3E50',
  marginTop: 16,
  marginBottom: 8,
},
emptySubtitle: {
  fontSize: 14,
  color: '#7F8C8D',
  textAlign: 'center',
  lineHeight: 20,
},
});

export default TransactionHistoryScreen;