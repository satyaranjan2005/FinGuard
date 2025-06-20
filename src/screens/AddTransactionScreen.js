import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import RNPickerSelect from 'react-native-picker-select';
import { Button, Card, Input } from '../components';
import { storageService } from '../services/storageService';
import { fetchCategories, saveTransaction, updateTransaction, getCurrentBalance, validateTransaction } from '../services/dataService';

const AddTransactionScreen = ({ navigation, route }) => {
  const { transaction: editTransaction } = route?.params || {};
  const isEditing = !!editTransaction;
  
  const [type, setType] = useState(editTransaction?.type || 'expense');
  const [amount, setAmount] = useState(editTransaction?.amount?.toString() || '');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  // Format and validate amount input
  const handleAmountChange = (text) => {
    // Remove any non-numeric characters except decimal point
    const cleanText = text.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return; // Don't update if more than one decimal point
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return; // Don't update if more than 2 decimal places
    }
    
    // Limit total length (including decimal)
    if (cleanText.length > 10) {
      return; // Don't update if too long
    }
    
    setAmount(cleanText);
  };  const [categoryId, setCategoryId] = useState(editTransaction?.categoryId || '');
  const [notes, setNotes] = useState(editTransaction?.notes || '');
  const [paymentMode, setPaymentMode] = useState(editTransaction?.paymentMode || 'cash');  const [date, setDate] = useState(editTransaction?.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  
  useEffect(() => {
    loadCategories();
    loadCurrentBalance();
  }, []);

  // Load current balance
  const loadCurrentBalance = async () => {
    try {
      const balance = await getCurrentBalance();
      setCurrentBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
      setCurrentBalance(0);
    }
  };

  // Reset category selection when type changes
  useEffect(() => {
    if (!isEditing) {
      setCategoryId('');
    }
  }, [type, isEditing]);
  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      // If editing and no category is selected, set from edit transaction
      if (isEditing && editTransaction?.categoryId && !categoryId) {
        setCategoryId(editTransaction.categoryId);
      }
    } catch (error) {
      console.error('Load categories error:', error);
      Alert.alert('Error', 'Failed to load categories. Please check your connection and try again.');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === type);

  const paymentModes = [
    { label: 'Cash', value: 'cash', icon: 'cash-outline' },
    { label: 'UPI', value: 'upi', icon: 'phone-portrait-outline' },
    { label: 'Credit Card', value: 'credit_card', icon: 'card-outline' },
    { label: 'Debit Card', value: 'debit_card', icon: 'card-outline' },
    { label: 'Bank Transfer', value: 'bank_transfer', icon: 'swap-horizontal-outline' },
  ];  const validateForm = () => {
    // Validate amount
    const cleanAmount = amount.replace(/[^\d.]/g, '');
    const numAmount = parseFloat(cleanAmount);
    
    if (!amount.trim() || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
      return false;
    }
    
    if (numAmount > 999999.99) {
      Alert.alert('Validation Error', 'Amount cannot exceed ₹9,99,999.99');
      return false;
    }
    
    // Validate category selection
    if (!categoryId) {
      Alert.alert('Validation Error', 'Please select a category');
      return false;
    }
    
    // Validate category exists in current type
    const selectedCategory = categories.find(cat => cat.id === categoryId && cat.type === type);
    if (!selectedCategory) {
      Alert.alert('Validation Error', 'Selected category is not valid for this transaction type');
      return false;
    }
    
    // Validate date
    if (!date) {
      Alert.alert('Validation Error', 'Please select a transaction date');
      return false;
    }
    
    const selectedDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    if (selectedDate > today) {
      Alert.alert('Validation Error', 'Transaction date cannot be in the future');
      return false;
    }
      if (selectedDate < oneYearAgo) {
      Alert.alert('Validation Error', 'Transaction date cannot be more than one year ago');
      return false;
    }
    
    // Validate balance for expense transactions (for new transactions only)
    if (!isEditing && type === 'expense') {
      if (currentBalance === 0) {
        Alert.alert('Transaction Blocked', 'Cannot add expenses when your balance is zero. Please add income first.');
        return false;
      }
      
      if (numAmount > currentBalance) {
        Alert.alert(
          'Insufficient Balance', 
          `You don't have enough balance for this transaction.\n\nAvailable: ₹${currentBalance.toFixed(2)}\nRequired: ₹${numAmount.toFixed(2)}\nShortfall: ₹${(numAmount - currentBalance).toFixed(2)}`
        );
        return false;
      }
    }
    
    return true;};const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    try {
      // Find the selected category to get its name
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      
      const transactionData = {
        description: notes || `${type === 'income' ? 'Income' : 'Expense'} - ${selectedCategory?.name || 'Unknown'}`,
        amount: parseFloat(amount.replace(/[^\d.]/g, '')) || 0,
        type,
        category: selectedCategory?.name?.toLowerCase() || 'other',
        categoryId,
        notes,
        paymentMode,
        date: date + 'T' + new Date().toTimeString().split(' ')[0], // Add time to date
        createdAt: isEditing ? editTransaction.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // For new expense transactions, validate balance
      if (!isEditing && type === 'expense') {
        const validation = await validateTransaction(transactionData);
        if (!validation.isValid) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Transaction Blocked', validation.message);
          return;
        }
      }if (isEditing) {
        await updateTransaction(editTransaction.id, transactionData);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Transaction updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);      } else {
        const savedTransaction = await saveTransaction(transactionData);
        console.log('Transaction saved:', savedTransaction);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Refresh balance after successful transaction
        await loadCurrentBalance();
        
        Alert.alert(
          'Success', 
          `Transaction of ₹${transactionData.amount} added successfully!`, 
          [
            { 
              text: 'Add Another', 
              onPress: () => {
                resetForm();
              }
            },
            { 
              text: 'View All', 
              onPress: () => navigation.navigate('TransactionHistory') 
            },
            { 
              text: 'Done', 
              style: 'cancel',
              onPress: () => navigation.navigate('Dashboard') 
            }
          ]
        );
      }
    } catch (error) {
      console.error('Save transaction error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setType('expense');
    setAmount('');
    setCategoryId('');
    setNotes('');
    setPaymentMode('cash');
    setDate(new Date().toISOString().split('T')[0]);
    setIsAmountFocused(false);
  };return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />      <LinearGradient
        colors={['#4338ca', '#6366f1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</Text>
            {!isEditing && (
              <Text style={styles.balanceText}>
                Current Balance: ₹{currentBalance.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={{width: 24}} /> {/* Empty view for balance */}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Transaction Type Toggle */}
          <Card style={styles.card} elevation="medium">
            <Text style={styles.sectionTitle}>Transaction Type</Text>
            <View style={styles.toggleContainer}>              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (currentBalance === 0) {
                    Alert.alert(
                      'No Balance Available',
                      'You cannot add expenses when your balance is zero. Please add income first.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  setType('expense');
                  setCategoryId('');
                }}
                style={[
                  styles.toggleButton,
                  type === 'expense' ? styles.toggleButtonActiveExpense : styles.toggleButtonInactive
                ]}
              >
                <Ionicons 
                  name="trending-down" 
                  size={20} 
                  color={type === 'expense' ? 'white' : '#6b7280'} 
                  style={styles.toggleIcon}
                />
                <Text style={[
                  styles.toggleText,
                  type === 'expense' ? styles.toggleTextActive : styles.toggleTextInactive
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setType('income');
                  setCategoryId('');
                }}
                style={[
                  styles.toggleButton,
                  type === 'income' ? styles.toggleButtonActiveIncome : styles.toggleButtonInactive
                ]}
              >
                <Ionicons 
                  name="trending-up" 
                  size={20} 
                  color={type === 'income' ? 'white' : '#6b7280'} 
                  style={styles.toggleIcon}
                />
                <Text style={[
                  styles.toggleText,
                  type === 'income' ? styles.toggleTextActive : styles.toggleTextInactive
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </Card>          {/* Amount Input */}
          <Card style={styles.card} elevation="medium">
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={[
              styles.amountInputContainer,
              isAmountFocused && styles.amountInputContainerFocused
            ]}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Input
                placeholder="0.00"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                style={styles.amountInput}
                placeholderTextColor="#9ca3af"
                maxLength={10}
                selectTextOnFocus={true}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
              />            </View>
            {amount && parseFloat(amount) > 0 && (
              <Text style={styles.amountHelper}>
                Amount: ₹{parseFloat(amount).toFixed(2)}
              </Text>
            )}
            {/* Balance validation helper for expenses */}
            {type === 'expense' && amount && parseFloat(amount) > 0 && (
              (() => {
                const enteredAmount = parseFloat(amount);
                if (currentBalance === 0) {
                  return (
                    <Text style={styles.balanceWarning}>
                      ⚠️ Cannot add expenses when balance is zero
                    </Text>
                  );
                } else if (enteredAmount > currentBalance) {
                  return (
                    <Text style={styles.balanceError}>
                      ❌ Insufficient balance! (Available: ₹{currentBalance.toFixed(2)})
                    </Text>
                  );
                } else {
                  return (
                    <Text style={styles.balanceOk}>
                      ✅ Remaining balance: ₹{(currentBalance - enteredAmount).toFixed(2)}
                    </Text>
                  );
                }
              })()
            )}
          </Card>

          {/* Category Selection */}
          <Card style={styles.card} elevation="medium">
            <Text style={styles.sectionTitle}>Category</Text>            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPreview}>
              {Array.isArray(filteredCategories) && filteredCategories.map((category) => {
                if (!category || !category.id) return null;
                
                return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setCategoryId(category.id)}
                  style={[
                    styles.categoryItem,
                    categoryId === category.id && styles.categoryItemActive
                  ]}
                >
                  <View 
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: category.color + '20' }
                    ]}
                  >
                    <Ionicons name={category.icon} size={24} color={category.color} />
                  </View>                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
                );
              }).filter(Boolean)}
            </ScrollView>
          </Card>

          {/* Notes Input */}
          <Card style={styles.card} elevation="medium">
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input
              placeholder="What was this for?"
              value={notes}
              onChangeText={setNotes}
              multiline={true}
              numberOfLines={3}
              style={styles.notesInput}
              placeholderTextColor="#9ca3af"
            />
          </Card>

          {/* Payment Mode */}
          <Card style={styles.card} elevation="medium">
            <Text style={styles.sectionTitle}>Payment Mode</Text>            <View style={styles.paymentModeContainer}>
              {Array.isArray(paymentModes) && paymentModes.map((mode) => {
                if (!mode || !mode.value) return null;
                
                return (
                <TouchableOpacity
                  key={mode.value}
                  onPress={() => setPaymentMode(mode.value)}
                  style={[
                    styles.paymentModeButton,
                    paymentMode === mode.value ? styles.paymentModeButtonActive : styles.paymentModeButtonInactive
                  ]}
                >
                  <Ionicons
                    name={mode.icon}
                    size={20}
                    color={paymentMode === mode.value ? '#4f46e5' : '#6b7280'}
                    style={styles.paymentModeIcon}
                  />                  <Text style={[
                    styles.paymentModeText,
                    paymentMode === mode.value ? styles.paymentModeTextActive : styles.paymentModeTextInactive
                  ]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
                );
              }).filter(Boolean)}
            </View>
          </Card>

          {/* Submit Button */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={type === 'expense' ? ['#ef4444', '#dc2626'] : ['#10b981', '#059669']}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons 
                      name={type === 'expense' ? 'trending-down' : 'trending-up'} 
                      size={20} 
                      color="white"
                      style={{marginRight: 8}}
                    />
                    <Text style={styles.submitButtonText}>Add {type === 'expense' ? 'Expense' : 'Income'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#312e81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  balanceText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  toggleIcon: {
    marginRight: 6,
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
  },
  toggleButtonActiveExpense: {
    backgroundColor: '#ef4444',
  },
  toggleButtonActiveIncome: {
    backgroundColor: '#10b981',
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 16,
  },
  toggleTextActive: {
    color: 'white',
  },
  toggleTextInactive: {
    color: '#6b7280',
  },  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  amountInputContainerFocused: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 12,
    paddingRight: 16,
  },  amountHelper: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  balanceWarning: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  balanceError: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  balanceOk: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 10,
    width: 80,
    borderRadius: 12,
  },
  categoryItemActive: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 12,
  },
  paymentModeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  paymentModeButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#4f46e5',
  },
  paymentModeButtonInactive: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
  },
  paymentModeIcon: {
    marginRight: 8,
  },
  paymentModeText: {
    fontWeight: '500',
  },
  paymentModeTextActive: {
    color: '#4f46e5',
  },
  paymentModeTextInactive: {
    color: '#4b5563',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddTransactionScreen;