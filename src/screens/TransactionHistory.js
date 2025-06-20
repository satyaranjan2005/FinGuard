import { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const TransactionHistory = ({ navigation }) => {
const [transactions, setTransactions] = useState([]);
const [refreshing, setRefreshing] = useState(false);
const [loading, setLoading] = useState(false);
const [selectedTransaction, setSelectedTransaction] = useState(null);
const [modalVisible, setModalVisible] = useState(false);

useEffect(() => {
  loadTransactions();
}, []);

const loadTransactions = async () => {
  try {
    const storedTransactions = await AsyncStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      // Sort by date (newest first)
      const sortedTransactions = parsedTransactions.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setTransactions(sortedTransactions);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to load transactions');
  }
};

const onRefresh = async () => {
  setRefreshing(true);
  await loadTransactions();
  setRefreshing(false);
};

const editTransaction = (transaction) => {
  setModalVisible(false);
  navigation.navigate('AddTransaction', { 
    transaction: transaction,
    isEditing: true 
  });
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
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedTransactions = transactions.filter(
              (transaction) => transaction.id !== transactionId
            );
            await AsyncStorage.setItem(
              'transactions',
              JSON.stringify(updatedTransactions)
            );
            setTransactions(updatedTransactions);
          } catch (error) {
            Alert.alert('Error', 'Failed to delete transaction');
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

const getPaymentModeIcon = (paymentMode) => {
  const icons = {
    cash: 'cash',
    card: 'card',
    upi: 'phone-portrait',
    bank: 'business',
    other: 'ellipsis-horizontal',
  };
  return icons[paymentMode] || 'ellipsis-horizontal';
};

const renderTransaction = ({ item }) => (
  <TouchableOpacity 
    style={styles.transactionItem}
    onPress={() => handleTransactionPress(item)}
    activeOpacity={0.75}
  >
    <LinearGradient
      colors={['#FFFFFF', '#FCFCFF']}
      style={styles.transactionInner}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Category Badge & Icon */}
      <View style={styles.categoryContainer}>
        <LinearGradient
          colors={[getCategoryColor(item.category), shadeColor(getCategoryColor(item.category), -15)]}
          style={styles.categoryIconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={getCategoryIcon(item.category)}
            size={24}
            color="white"
            style={styles.categoryIconImage}
          />
        </LinearGradient>
      </View>
      
      {/* Transaction Details */}      <View style={styles.transactionDetails}>
        <View style={styles.titleRow}>
          <Text style={styles.transactionTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.description}
          </Text>
          <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(item.category)}15` }]}>
            <Ionicons 
              name={getCategoryIcon(item.category)} 
              size={10} 
              color={getCategoryColor(item.category)} 
              style={styles.categoryBadgeIcon} 
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionMeta}>
          <Ionicons name="calendar-outline" size={12} color="#888" style={styles.metaIcon} />
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          
          {item.paymentMode && (
            <>
              <View style={styles.metaDot} />
              <Ionicons name={getPaymentModeIcon(item.paymentMode)} size={12} color="#888" style={styles.metaIcon} />
              <Text style={styles.paymentModeText}>
                {item.paymentMode.charAt(0).toUpperCase() + item.paymentMode.slice(1)}
              </Text>
            </>
          )}
        </View>
      </View>
      
      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={[
          styles.transactionAmount,
          { color: item.type === 'expense' ? '#FF4757' : '#2ED573' }
        ]}>
          {formatAmount(item.amount, item.type)}
        </Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const renderEmptyState = () => (
  <View style={styles.emptyState}>
    <LinearGradient
      colors={['#F8F9FA', '#E9ECEF']}
      style={styles.emptyIconContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name="receipt-outline" size={64} color="#6C757D" />
    </LinearGradient>
    <Text style={styles.emptyStateText}>No transactions yet</Text>
    <Text style={styles.emptyStateSubtext}>
      Start adding transactions to build your financial history and track your spending patterns
    </Text>
    <TouchableOpacity
      style={styles.addTransactionButton}
      onPress={() => navigation.navigate('AddTransaction')}
    >
      <LinearGradient
        colors={['#4ECDC4', '#44A08D']}
        style={styles.addTransactionButtonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.addButtonIcon}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.addTransactionButtonText}>Add Your First Transaction</Text>
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
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="receipt" size={24} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Transaction History</Text>
          </View>
        </View>        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {/* Add filter functionality */}}
          >
            <Ionicons name="filter" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>      <Text style={styles.headerSubtitle}>
        {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
      </Text>
      
      {/* Transaction Summary Card */}
      {transactions.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryIncomeAmount}>
              ₹{transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summarySection}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={styles.summaryExpenseAmount}>
              ₹{transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </Text>
          </View>
        </View>
      )}
    </LinearGradient>    {/* Transaction List with Heading */}
    <View style={styles.transactionSection}>
      {transactions.length > 0 && (
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionHeading}>Recent Transactions</Text>
          <Text style={styles.transactionCount}>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={transactions.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>

    {/* Transaction Action Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>          {selectedTransaction && (
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
                </View>

                <View style={styles.modalDetailRow}>
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

                {selectedTransaction.paymentMode && (
                  <View style={styles.modalDetailRow}>
                    <View style={styles.modalDetailItem}>
                      <Ionicons name={getPaymentModeIcon(selectedTransaction.paymentMode)} size={20} color="#666" />
                      <View style={styles.modalDetailText}>
                        <Text style={styles.modalDetailLabel}>Payment Mode</Text>
                        <Text style={styles.modalDetailValue}>
                          {selectedTransaction.paymentMode.charAt(0).toUpperCase() + selectedTransaction.paymentMode.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

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
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalEditButton]}
                  onPress={() => editTransaction(selectedTransaction)}
                >
                  <Ionicons name="pencil" size={20} color="#4ECDC4" />
                  <Text style={[styles.modalActionText, { color: '#4ECDC4' }]}>Edit Transaction</Text>
                </TouchableOpacity>

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
        </View>
      </View>
    </Modal>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#F8F9FA',
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
  marginLeft: 16,
},
headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
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
backButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  alignItems: 'center',
  justifyContent: 'center',
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
},
transactionItem: {
  backgroundColor: '#FFFFFF',
  marginBottom: 16,
  marginHorizontal: 16,
  borderRadius: 20,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: 'rgba(230, 230, 250, 0.5)',
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
paymentModeText: {
  fontSize: 12,
  color: '#777',
  fontWeight: '500',
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
},
emptyState: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 80,
  backgroundColor: '#F8FAFC',
},
emptyIconContainer: {
  width: 120,
  height: 120,
  borderRadius: 30,
  backgroundColor: 'rgba(79, 142, 247, 0.05)',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
  borderWidth: 0,
  shadowColor: '#4F8EF7',
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 5,
},
emptyStateText: {
  fontSize: 20,
  fontWeight: '700',
  color: '#1A1A2E',
  marginBottom: 12,
  textAlign: 'center',
  letterSpacing: 0.3,
},
emptyStateSubtext: {
  fontSize: 15,
  color: '#666',
  textAlign: 'center',
  lineHeight: 22,
  marginBottom: 32,
},
addTransactionButton: {
  alignItems: 'center',
  borderRadius: 25,
  shadowColor: '#4ECDC4',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 8,
},
addTransactionButtonGradient: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 28,
  paddingVertical: 16,
  borderRadius: 30,
  gap: 12,
},
addButtonIcon: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  justifyContent: 'center',
  alignItems: 'center',
},
addTransactionButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
  letterSpacing: 0.3,
},
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
  gap: 12,
  borderTopWidth: 1,
  borderTopColor: '#F0F0F0',
  marginTop: 10,
},
modalActionButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 12,
  borderWidth: 1.5,
},
modalEditButton: {
  backgroundColor: '#E8F8F5',
  borderColor: '#4ECDC4',
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
  maxHeight: 300,
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
});

export default TransactionHistory;