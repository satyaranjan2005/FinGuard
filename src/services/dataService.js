// FinGuard Data Service
// This file handles all data operations like fetching user data, transactions, and budget information

import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitEvent, EVENTS } from '../utils/eventEmitter';
import { createBudgetAlert, createIncomeNotification } from './notificationService';

// Helper function to get category colors
const getCategoryColor = (category) => {
  const categoryColors = {
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
  
  return categoryColors[category?.toLowerCase()] || '#636E72';
};

// Sample data - In a real app, this would be replaced with API calls or database operations
const SAMPLE_USER_DATA = {
  name: 'User',
  balance: 0.00,
  monthlyIncome: 0.00,
  monthlyExpenses: 0.00,
  savingsGoal: 0,
  currentSavings: 0,
};

const SAMPLE_TRANSACTIONS = [
  // Empty array - no sample transactions
];

const SAMPLE_BUDGET_DATA = {
  total: 0,
  spent: 0,
  categories: []
};

const SAMPLE_CATEGORIES = [
  // Expense Categories
  {
    id: 'cat1',
    name: 'Food',
    type: 'expense',
    color: '#10b981',
    icon: 'restaurant'
  },
  {
    id: 'cat2',
    name: 'Transportation',
    type: 'expense',
    color: '#8b5cf6',
    icon: 'car'
  },
  {
    id: 'cat3',
    name: 'Shopping',
    type: 'expense',
    color: '#84cc16',
    icon: 'bag'
  },
  {
    id: 'cat4',
    name: 'Entertainment',
    type: 'expense',
    color: '#ef4444',
    icon: 'film'
  },
  {
    id: 'cat5',
    name: 'Healthcare',
    type: 'expense',
    color: '#06b6d4',
    icon: 'medical'
  },
  {
    id: 'cat6',
    name: 'Utilities',
    type: 'expense',
    color: '#f59e0b',
    icon: 'flash'
  },
  {
    id: 'cat7',
    name: 'Housing',
    type: 'expense',
    color: '#3b82f6',
    icon: 'home'
  },
  {
    id: 'cat8',
    name: 'Education',
    type: 'expense',
    color: '#6366f1',
    icon: 'school'
  },
  {
    id: 'cat9',
    name: 'Health',
    type: 'expense',
    color: '#14b8a6',
    icon: 'fitness'
  },
  {
    id: 'cat10',
    name: 'Investment',
    type: 'expense',
    color: '#f97316',
    icon: 'trending-up'
  },
  // Income Categories
  {
    id: 'cat11',
    name: 'Salary',
    type: 'income',
    color: '#059669',
    icon: 'cash'
  },
  {
    id: 'cat12',
    name: 'Freelance',
    type: 'income',
    color: '#0891b2',
    icon: 'laptop'
  },
  {
    id: 'cat13',
    name: 'Investment',
    type: 'income',
    color: '#7c3aed',
    icon: 'trending-up'
  },
  {
    id: 'cat14',
    name: 'Business',
    type: 'income',
    color: '#dc2626',
    icon: 'briefcase'
  },
  {
    id: 'cat15',
    name: 'Bonus',
    type: 'income',
    color: '#16a34a',
    icon: 'gift'
  },
  {
    id: 'cat16',
    name: 'Other',
    type: 'income',
    color: '#64748b',
    icon: 'cash'
  },
];

const SAMPLE_GOALS = [
  // Empty array - no sample goals
];

const SAMPLE_BUDGETS = [
  // Empty array - no sample budgets
];

const SAMPLE_FINANCIAL_TIPS = [
  {
    id: 'tip1',
    title: 'Emergency Fund Goal',
    category: 'savings',
    content: 'Aim to save 3-6 months of expenses in an emergency fund. This provides financial security during unexpected situations.',
    action: 'Start saving today'
  },
  {
    id: 'tip2',
    title: '50/30/20 Budget Rule',
    category: 'budgeting',
    content: 'Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment for balanced financial health.',
    action: 'Review your budget'
  },
  {
    id: 'tip3',
    title: 'SIP Investment',
    category: 'investment',
    content: 'Start a Systematic Investment Plan (SIP) in mutual funds with as little as ₹500 per month for long-term wealth creation.',
    action: 'Explore SIP options'
  },
  {
    id: 'tip4',
    title: 'Credit Card Debt',
    category: 'debt',
    content: 'Pay off credit card balances in full each month to avoid high interest charges and improve your credit score.',
    action: 'Check your balances'
  },
  {
    id: 'tip5',
    title: 'Track Daily Expenses',
    category: 'budgeting',
    content: 'Monitor your daily spending habits to identify areas where you can cut costs and save more money.',
    action: 'Review transactions'
  }
];

const SAMPLE_BILL_REMINDERS = [
  // Empty array - no sample bill reminders
];

// Simulated delay to mimic API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch user data (balance, income, expenses)
 * @returns {Promise<Object>} User data object
 */
export const fetchUserData = async () => {
  try {
    // Try to get data from storage, fall back to sample data
    const storedData = await AsyncStorage.getItem('userData');
    return storedData ? JSON.parse(storedData) : SAMPLE_USER_DATA;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return SAMPLE_USER_DATA; // Fallback to sample data on error
  }
};

/**
 * Fetch recent transactions
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Promise<Array>} Array of transaction objects
 */
export const fetchRecentTransactions = async (limit = 10) => {
  try {
    const storedTransactions = await AsyncStorage.getItem('transactions');
    const transactions = storedTransactions 
      ? JSON.parse(storedTransactions) 
      : SAMPLE_TRANSACTIONS;
    
    // Sort by date (newest first) and limit to requested number
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return SAMPLE_TRANSACTIONS.slice(0, limit);
  }
};

/**
 * Fetch budget summary data
 * @returns {Promise<Object>} Budget summary object
 */
export const fetchBudgetSummary = async () => {
  try {
    // Remove delay for immediate response
    console.log('Fetching budget summary...');
    
    // First check if there are any actual budgets created by the user
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgetsList = storedBudgets ? JSON.parse(storedBudgets) : [];
    
    if (budgetsList.length === 0) {
      // If no budgets exist, return null
      console.log('No budgets found, returning null');
      return null;
    }
    
    // Always recalculate the summary to ensure it's up-to-date
    console.log(`Found ${budgetsList.length} budgets, calculating summary...`);
    
    // Get all categories to get category names and colors
    const storedCategories = await AsyncStorage.getItem('categories');
    const categories = storedCategories ? JSON.parse(storedCategories) : [];
    
    // Get all transactions to calculate spent amounts accurately
    const storedTransactions = await AsyncStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Calculate totals from all budgets
    const totalAllocated = budgetsList.reduce((sum, budget) => sum + (parseFloat(budget.amount) || 0), 0);
    
    // Create category summary data with correct category names and colors
    const categorySummaries = budgetsList.map(budget => {
      // Find matching category for this budget
      const category = categories.find(cat => cat.id === budget.categoryId) || {};
      
      // Calculate actual spent amount from transactions
      const spent = expenseTransactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      // Update the budget's spent value
      budget.spent = spent;
      
      return {
        name: category.name || 'Unknown',
        allocated: parseFloat(budget.amount) || 0,
        spent: spent,
        color: category.color || '#4F8EF7',
        icon: category.icon || 'wallet',
        categoryId: budget.categoryId
      };
    });
    
    // Calculate total spent from category summaries
    const totalSpent = categorySummaries.reduce((sum, cat) => sum + cat.spent, 0);
    
    // Update the budgets in storage with recalculated spent values
    await AsyncStorage.setItem('budgets', JSON.stringify(budgetsList));
    
    const budgetSummary = {
      total: totalAllocated,
      spent: totalSpent,
      categories: categorySummaries,
      lastUpdated: new Date().toISOString()
    };
    
    // Store this summary for future use
    await AsyncStorage.setItem('budgetData', JSON.stringify(budgetSummary));
    console.log('Budget summary calculated and stored');
    return budgetSummary;
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return null;
  }
};

/**
 * Save a new transaction
 * @param {Object} transaction - Transaction object to save
 * @returns {Promise<boolean>} Success/failure
 */
/**
 * Get current user balance
 * @returns {Promise<number>} Current balance
 */
export const getCurrentBalance = async () => {
  try {
    const storedData = await AsyncStorage.getItem('userData');
    const userData = storedData ? JSON.parse(storedData) : SAMPLE_USER_DATA;
    return Number(userData.balance) || 0;
  } catch (error) {
    console.error('Error getting current balance:', error);
    return 0;
  }
};

/**
 * Validate if a transaction can be processed
 * @param {Object} transaction - Transaction object to validate
 * @returns {Promise<Object>} Validation result { isValid, message }
 */
export const validateTransaction = async (transaction) => {
  try {
    const currentBalance = await getCurrentBalance();
    const amount = Number(transaction.amount) || 0;
    
    // Check if amount is valid
    if (amount <= 0) {
      return {
        isValid: false,
        message: 'Transaction amount must be greater than zero.'
      };
    }
    
    // For income transactions, always allow
    if (transaction.type === 'income') {
      return { isValid: true };
    }
    
    // For expense transactions, check balance constraints
    if (transaction.type === 'expense') {
      // Check if balance is zero
      if (currentBalance === 0) {
        return {
          isValid: false,
          message: 'Cannot add expenses when your balance is zero. Please add income first.'
        };
      }
      
      // Check if transaction would result in negative balance
      if (amount > currentBalance) {
        return {
          isValid: false,
          message: `Insufficient balance! Your current balance is ₹${currentBalance.toFixed(2)}, but you're trying to spend ₹${amount.toFixed(2)}.`
        };
      }
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Error validating transaction:', error);
    return {
      isValid: false,
      message: 'Unable to validate transaction. Please try again.'
    };
  }
};

export const saveTransaction = async (transaction) => {
  try {
    // Validate transaction before saving
    const validation = await validateTransaction(transaction);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    // Get existing transactions
    const storedTransactions = await AsyncStorage.getItem('transactions');
    const transactions = storedTransactions 
      ? JSON.parse(storedTransactions) 
      : [];
    
    // Add new transaction with ID and preserve the date if provided
    const newTransaction = {
      ...transaction,
      id: `t${Date.now()}`,
      date: transaction.date || new Date().toISOString(),
      createdAt: transaction.createdAt || new Date().toISOString()
    };
      // Save updated transactions array (newest first)
    const updatedTransactions = [newTransaction, ...transactions];
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));    // Update balance data
    const userData = await updateBalanceFromTransaction(newTransaction);
    
    // Update budget data when it's an expense
    if (newTransaction.type === 'expense' && newTransaction.categoryId) {
      await updateBudgetFromTransaction(newTransaction);
    }
      // Update budget summary only once at the end
    await updateBudgetSummary();
    
    // Create notification for income transactions
    if (newTransaction.type === 'income') {
      try {
        await createIncomeNotification(newTransaction.amount, newTransaction.title || 'account');
      } catch (notificationError) {
        console.log('Income notification error (non-critical):', notificationError);
      }
    }
    
    // Emit event for transaction added
    emitEvent(EVENTS.TRANSACTION_ADDED, newTransaction);
    
    // Emit balance changed event
    emitEvent(EVENTS.BALANCE_CHANGED, { newBalance: userData.balance });
    
    return newTransaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

/**
 * Save an autopay (recurring) transaction
 * @param {Object} autopayTransaction - Transaction data with autopay settings
 * @returns {Promise<Object>} Saved autopay transaction
 */
export const saveAutopayTransaction = async (autopayTransaction) => {
  try {
    // Get existing autopay transactions
    const storedAutopays = await AsyncStorage.getItem('autopayTransactions');
    const autopays = storedAutopays ? JSON.parse(storedAutopays) : [];
    
    // Create new autopay entry
    const newAutopay = {
      ...autopayTransaction,
      id: `ap${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      nextExecutionDate: autopayTransaction.autopayStartDate,
      executionCount: 0
    };
    
    // Save to autopay list
    const updatedAutopays = [newAutopay, ...autopays];
    await AsyncStorage.setItem('autopayTransactions', JSON.stringify(updatedAutopays));
    
    // Schedule the first transaction if start date is today or in the past
    const startDate = new Date(autopayTransaction.autopayStartDate);
    const today = new Date();
    
    if (startDate <= today) {
      // Create the first transaction immediately
      const firstTransaction = {
        ...autopayTransaction,
        date: startDate.toISOString(),
        autopayId: newAutopay.id,
        isAutopayGenerated: true
      };
      
      // Remove autopay-specific fields before saving as regular transaction
      delete firstTransaction.isAutopay;
      delete firstTransaction.autopayFrequency;
      delete firstTransaction.autopayStartDate;
      delete firstTransaction.autopayEndDate;
      delete firstTransaction.autopayCount;
      delete firstTransaction.nextExecutionDate;
      
      await saveTransaction(firstTransaction);
      
      // Update execution count and next execution date
      newAutopay.executionCount = 1;
      newAutopay.nextExecutionDate = calculateNextExecutionDate(
        startDate, 
        autopayTransaction.autopayFrequency
      ).toISOString().split('T')[0];
      
      // Update the autopay record
      updatedAutopays[0] = newAutopay;
      await AsyncStorage.setItem('autopayTransactions', JSON.stringify(updatedAutopays));
    }
    
    return newAutopay;
  } catch (error) {
    console.error('Error saving autopay transaction:', error);
    throw error;
  }
};

/**
 * Calculate the next execution date based on frequency
 * @param {Date} currentDate - Current execution date
 * @param {string} frequency - 'daily', 'weekly', or 'monthly'
 * @returns {Date} Next execution date
 */
const calculateNextExecutionDate = (currentDate, frequency) => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
  }
  
  return nextDate;
};

/**
 * Process pending autopay transactions
 * This should be called on app startup or periodically
 */
export const processAutopayTransactions = async () => {
  try {
    const storedAutopays = await AsyncStorage.getItem('autopayTransactions');
    const autopays = storedAutopays ? JSON.parse(storedAutopays) : [];
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    let hasUpdates = false;
    
    for (let i = 0; i < autopays.length; i++) {
      const autopay = autopays[i];
      
      if (!autopay.isActive) continue;
      
      const nextExecutionDate = new Date(autopay.nextExecutionDate);
      
      // Check if it's time to execute
      if (nextExecutionDate <= today) {
        // Check if autopay should still be active
        let shouldExecute = true;
        
        // Check end date
        if (autopay.autopayEndDate) {
          const endDate = new Date(autopay.autopayEndDate);
          if (today > endDate) {
            autopay.isActive = false;
            shouldExecute = false;
          }
        }
        
        // Check execution count
        if (autopay.autopayCount && autopay.executionCount >= autopay.autopayCount) {
          autopay.isActive = false;
          shouldExecute = false;
        }
        
        if (shouldExecute) {
          // Create the transaction
          const newTransaction = {
            description: autopay.description,
            amount: autopay.amount,
            type: autopay.type,
            category: autopay.category,
            categoryId: autopay.categoryId,
            notes: autopay.notes + ' (Auto-generated)',
            paymentMode: autopay.paymentMode,
            date: nextExecutionDate.toISOString(),
            autopayId: autopay.id,
            isAutopayGenerated: true
          };
          
          await saveTransaction(newTransaction);
          
          // Update autopay record
          autopay.executionCount += 1;
          autopay.nextExecutionDate = calculateNextExecutionDate(
            nextExecutionDate, 
            autopay.autopayFrequency
          ).toISOString().split('T')[0];
          
          hasUpdates = true;
        }
      }
    }
    
    // Save updated autopays if there were changes
    if (hasUpdates) {
      await AsyncStorage.setItem('autopayTransactions', JSON.stringify(autopays));
    }
    
    return autopays.filter(ap => ap.isActive).length;
  } catch (error) {
    console.error('Error processing autopay transactions:', error);
    return 0;
  }
};

/**
 * Process all scheduled tasks (autopays and budget resets)
 * This should be called on app startup or periodically
 * @returns {Promise<Object>} Processing results
 */
export const processScheduledTasks = async () => {
  try {
    console.log('Processing scheduled tasks...');
    
    // Process autopay transactions
    const activeAutopays = await processAutopayTransactions();
    
    // Process expired budgets
    const budgetResults = await processExpiredBudgets();
    
    const results = {
      autopays: {
        active: activeAutopays
      },
      budgets: budgetResults,
      processedAt: new Date().toISOString()
    };
    
    console.log('Scheduled tasks completed:', results);
    return results;
  } catch (error) {
    console.error('Error processing scheduled tasks:', error);
    return {
      error: error.message,
      processedAt: new Date().toISOString()
    };
  }
};

/**
 * Get all autopay transactions
 * @returns {Promise<Array>} Array of autopay transactions
 */
export const getAutopayTransactions = async () => {
  try {
    const storedAutopays = await AsyncStorage.getItem('autopayTransactions');
    const autopays = storedAutopays ? JSON.parse(storedAutopays) : [];
    console.log(`Retrieved ${autopays.length} autopay transactions from storage`);
    return autopays;
  } catch (error) {
    console.error('Error getting autopay transactions:', error);
    return [];
  }
};

/**
 * Disable an autopay transaction
 * @param {string} autopayId - ID of autopay to disable
 */
export const disableAutopay = async (autopayId) => {
  try {
    console.log(`Attempting to disable autopay with ID: ${autopayId}`);
    
    const storedAutopays = await AsyncStorage.getItem('autopayTransactions');
    const autopays = storedAutopays ? JSON.parse(storedAutopays) : [];
    
    console.log(`Found ${autopays.length} autopays in storage`);
    
    const autopayIndex = autopays.findIndex(ap => ap.id === autopayId);
    if (autopayIndex !== -1) {
      console.log(`Found autopay at index ${autopayIndex}, disabling...`);
      const oldAutopay = { ...autopays[autopayIndex] };
      
      autopays[autopayIndex].isActive = false;
      autopays[autopayIndex].disabledAt = new Date().toISOString();
      
      await AsyncStorage.setItem('autopayTransactions', JSON.stringify(autopays));
      console.log('Autopay disabled and saved to storage');
      
      // Emit event to notify other parts of the app
      emitEvent(EVENTS.AUTOPAY_DISABLED, { 
        autopayId, 
        autopay: autopays[autopayIndex],
        oldAutopay 
      });
      
      return autopays[autopayIndex];
    } else {
      console.log(`Autopay with ID ${autopayId} not found in ${autopays.length} autopays`);
      throw new Error(`Autopay with ID ${autopayId} not found`);
    }
  } catch (error) {
    console.error('Error disabling autopay:', error);
    throw error;
  }
};

/**
 * Debug function to list all autopay transactions with their status
 * @returns {Promise<Array>} Array of autopay transactions
 */
export const debugAutopays = async () => {
  try {
    const autopays = await getAutopayTransactions();
    console.log('=== AUTOPAY DEBUG ===');
    console.log(`Total autopays: ${autopays.length}`);
    
    autopays.forEach((autopay, index) => {
      console.log(`Autopay ${index + 1}:`);
      console.log(`  ID: ${autopay.id}`);
      console.log(`  Active: ${autopay.isActive}`);
      console.log(`  Amount: ₹${autopay.amount}`);
      console.log(`  Type: ${autopay.type}`);
      console.log(`  Frequency: ${autopay.autopayFrequency}`);
      console.log(`  Next execution: ${autopay.nextExecutionDate}`);
      console.log(`  Execution count: ${autopay.executionCount}`);
      console.log('---');
    });
    
    console.log('=== END AUTOPAY DEBUG ===');
    return autopays;
  } catch (error) {
    console.error('Error in debugAutopays:', error);
    return [];
  }
};

/**
 * Update an existing transaction
 * @param {string} transactionId - ID of transaction to update
 * @param {Object} updatedTransaction - Updated transaction data
 * @returns {Promise<Object>} Updated transaction
 */
export const updateTransaction = async (transactionId, updatedTransaction) => {
  try {
    const storedTransactions = await AsyncStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }
    
    const oldTransaction = transactions[transactionIndex];
    transactions[transactionIndex] = {
      ...oldTransaction,
      ...updatedTransaction,
      id: transactionId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
      // Update balance if amount or type changed
    if (oldTransaction.amount !== updatedTransaction.amount || oldTransaction.type !== updatedTransaction.type) {
      await updateBalanceFromTransaction(transactions[transactionIndex], oldTransaction);
    }
    
    // Update budget if it's an expense transaction and amount, category, or type changed
    const newTransaction = transactions[transactionIndex];
    if ((oldTransaction.type === 'expense' || newTransaction.type === 'expense') && 
        (oldTransaction.amount !== newTransaction.amount || 
         oldTransaction.categoryId !== newTransaction.categoryId || 
         oldTransaction.type !== newTransaction.type)) {
      
      // If old transaction was expense, reverse it from budget
      if (oldTransaction.type === 'expense') {
        // Create an inverse transaction to subtract the old amount
        const reverseTransaction = {
          ...oldTransaction,
          amount: -oldTransaction.amount // Negative to reverse
        };
        await updateBudgetFromTransaction(reverseTransaction);
      }
      
      // If new transaction is expense, add it to budget
      if (newTransaction.type === 'expense') {
        await updateBudgetFromTransaction(newTransaction);
      }
    }    // Emit event for transaction update
    emitEvent(EVENTS.TRANSACTION_UPDATED, { 
      transaction: transactions[transactionIndex],
      oldTransaction
    });
    
    return transactions[transactionIndex];
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Delete a transaction
 * @param {string} transactionId - ID of transaction to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const storedTransactions = await AsyncStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }
    
    const deletedTransaction = transactions[transactionIndex];
    transactions.splice(transactionIndex, 1);
    
    await AsyncStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Properly reverse the balance change
    await reverseBalanceFromTransaction(deletedTransaction);
      // If the deleted transaction was an expense, update the budget
    if (deletedTransaction.type === 'expense' && deletedTransaction.categoryId) {
      // Create a negative transaction to subtract from the budget
      const reverseBudgetTransaction = {
        ...deletedTransaction,
        amount: -deletedTransaction.amount // Negative amount to reduce budget spending
      };
      await updateBudgetFromTransaction(reverseBudgetTransaction);
      console.log(`Budget updated after deleting expense transaction with categoryId: ${deletedTransaction.categoryId}`);
    }
    
    // Update the budget summary
    await updateBudgetSummary();
    
    console.log(`Transaction ${transactionId} successfully deleted, all updates completed`);
    
    // Emit events after all operations are complete with a small delay
    setTimeout(() => {
      emitEvent(EVENTS.TRANSACTION_DELETED, { 
        transactionId, 
        transaction: deletedTransaction
      });
      emitEvent(EVENTS.BALANCE_CHANGED);
      emitEvent(EVENTS.BUDGET_UPDATED, { forcedUpdate: true });
    }, 10);
    
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Reverse user balance when a transaction is deleted
 * @param {Object} transaction - The transaction that was deleted
 */
const reverseBalanceFromTransaction = async (transaction) => {
  try {
    // Get current user data
    const storedData = await AsyncStorage.getItem('userData');
    const userData = storedData ? JSON.parse(storedData) : SAMPLE_USER_DATA;
    
    // Reverse balance and monthly totals based on transaction type
    if (transaction.type === 'income') {
      userData.balance -= Number(transaction.amount);
      userData.monthlyIncome -= Number(transaction.amount);
      
      // Ensure monthly income doesn't go negative
      if (userData.monthlyIncome < 0) {
        userData.monthlyIncome = 0;
      }
    } else if (transaction.type === 'expense') {
      userData.balance += Number(transaction.amount);
      userData.monthlyExpenses -= Number(transaction.amount);
      
      // Ensure monthly expenses doesn't go negative
      if (userData.monthlyExpenses < 0) {
        userData.monthlyExpenses = 0;
      }
    }
    
    // Save updated user data
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    console.log(`Balance reversed: ${transaction.type} of ₹${transaction.amount}, New balance: ₹${userData.balance}, Monthly income: ₹${userData.monthlyIncome}, Monthly expenses: ₹${userData.monthlyExpenses}`);
    
    return userData;
  } catch (error) {
    console.error('Error reversing balance:', error);
    throw error;
  }
};

/**
 * Update user balance when a transaction is added
 * @param {Object} transaction - The transaction that was added
 */
const updateBalanceFromTransaction = async (transaction) => {
  try {
    // Get current user data
    const storedData = await AsyncStorage.getItem('userData');
    const userData = storedData ? JSON.parse(storedData) : SAMPLE_USER_DATA;
    
    // Update balance based on transaction type
    if (transaction.type === 'income') {
      userData.balance += Number(transaction.amount);
      userData.monthlyIncome += Number(transaction.amount);
    } else if (transaction.type === 'expense') {
      // Double-check balance before deducting
      const currentBalance = Number(userData.balance) || 0;
      const transactionAmount = Number(transaction.amount) || 0;
      
      if (transactionAmount > currentBalance) {
        throw new Error('Insufficient balance for this transaction');
      }
      
      userData.balance -= transactionAmount;
      userData.monthlyExpenses += transactionAmount;
      
      // Ensure balance doesn't go negative due to floating point errors
      if (userData.balance < 0) {
        userData.balance = 0;
      }
    }
      // Save updated user data
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    
    console.log(`Balance updated: ${transaction.type} of ₹${transaction.amount}, New balance: ₹${userData.balance}`);
    
    return userData;
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error; // Re-throw to handle in calling function
  }
};

/**
 * Update budget data based on a new transaction
 * @param {Object} transaction - The transaction to factor into budget calculations
 * @returns {Promise<void>}
 */
// Export this function so it can be called from other parts of the app if needed
export const updateBudgetFromTransaction = async (transaction) => {
  try {
    if (transaction.type !== 'expense') {
      return; // Only expenses affect budget spending
    }
    
    const amount = parseFloat(transaction.amount) || 0;
    if (amount === 0) {
      return; // Ignore zero amounts (but allow negative for reversals)
    }
    
    // Get current budgets
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    
    if (budgets.length === 0) {
      return; // No budgets to update
    }
    
    // Find the budget that matches this transaction's category by categoryId
    const matchingBudget = budgets.find(budget => 
      budget.categoryId === transaction.categoryId
    );
      // If we found a matching budget, update its spent amount
    if (matchingBudget) {
      // For adding or subtracting from budget spent amount
      matchingBudget.spent = (parseFloat(matchingBudget.spent) || 0) + amount;
      
      // Make sure spent doesn't go below zero
      if (matchingBudget.spent < 0) {
        matchingBudget.spent = 0;
      }
      
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
      
      console.log(`Budget updated for category ${matchingBudget.categoryId}: spent ${matchingBudget.spent}`);
    } else {
      console.log(`No matching budget found for transaction with categoryId: ${transaction.categoryId}`);
    }
  } catch (error) {
    console.error('Error updating budget from transaction:', error);
  }
};

/**
 * Recalculate and update the overall budget summary
 * @returns {Promise<void>}
 */
// Export this function so it can be called from other parts of the app if needed
export const updateBudgetSummary = async () => {
  try {
    console.log('Starting budget summary update...');
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
      if (budgets.length === 0) {
      // If no budgets, clear the budget summary
      await AsyncStorage.removeItem('budgetData');
      console.log('No budgets found, removed budgetData from storage');
      
      // Broadcast that budget data was cleared
      emitEvent(EVENTS.BUDGET_UPDATED, { cleared: true });
      
      return;
    }
    
    // Get all categories to get category names and colors
    const storedCategories = await AsyncStorage.getItem('categories');
    const categories = storedCategories ? JSON.parse(storedCategories) : [];
    
    // Calculate totals from all budgets
    const totalAllocated = budgets.reduce((sum, budget) => sum + (parseFloat(budget.amount) || 0), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (parseFloat(budget.spent) || 0), 0);
    
    console.log(`Budget summary: Total allocated: ${totalAllocated}, Total spent: ${totalSpent}`);
    
    // Also get expense transactions to recalculate spent amounts if needed
    const storedTransactions = await AsyncStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    // Create category summary data with correct category names and colors
    const categorySummaries = budgets.map(budget => {
      // Find matching category for this budget
      const category = categories.find(cat => cat.id === budget.categoryId) || {};
      
      // Calculate actual spent amount from transactions
      const spent = expenseTransactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      // Update the budget spent value to match actual transactions
      budget.spent = spent;
      
      return {
        name: category.name || 'Unknown',
        allocated: parseFloat(budget.amount) || 0,
        spent: spent,
        color: category.color || '#4F8EF7',
        icon: category.icon || 'wallet',
        categoryId: budget.categoryId
      };
    });
    
    // Also update the budgets in storage with recalculated spent values
    await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
    
    // Create the budget summary object
    const budgetSummary = {
      total: totalAllocated,
      spent: totalSpent,
      categories: categorySummaries,
      lastUpdated: new Date().toISOString()
    };    // Save the updated budget summary
    await AsyncStorage.setItem('budgetData', JSON.stringify(budgetSummary));
    
    // Check for budget alerts and send notifications
    try {
      for (const category of categorySummaries) {
        if (category.allocated > 0) {
          const percentage = (category.spent / category.allocated) * 100;
          const remaining = category.allocated - category.spent;
            // Send notification if budget threshold is reached
          if (percentage >= 75) { // 75% threshold or above
            await createBudgetAlert(category.name, percentage, remaining, category.spent);
          }
        }
      }
    } catch (notificationError) {
      console.log('Notification error (non-critical):', notificationError);
    }
    
    // Broadcast that the budget was updated
    emitEvent(EVENTS.BUDGET_UPDATED, { 
      updated: true,
      summary: budgetSummary
    });
    console.log('Budget summary updated and event emitted');
  } catch (error) {
    console.error('Error updating budget summary:', error);
  }
};

/**
 * Get expense summary data for charts
 * @returns {Promise<Array>}
 */
export const getExpenseSummaryData = async () => {
  try {
    const budgetData = await fetchBudgetSummary();
    if (!budgetData || !budgetData.categories || !Array.isArray(budgetData.categories)) {
      return [];
    }
    return budgetData.categories.map(category => ({
      name: category.name,
      amount: category.spent,
      color: category.color
    }));
  } catch (error) {
    console.error('Error getting expense summary:', error);
    return [];
  }
};

/**
 * Fetch categories for transaction categorization
 * @param {string} type - 'income' or 'expense' to filter categories
 * @returns {Promise<Array>} Array of categories
 */
export const fetchCategories = async (type = null) => {
  try {
    // Remove delay for immediate response
    
    // Try to get categories from AsyncStorage first
    const storedCategories = await AsyncStorage.getItem('categories');
    let categories = storedCategories ? JSON.parse(storedCategories) : SAMPLE_CATEGORIES;
    
    // Filter by type if specified
    if (type) {
      categories = categories.filter(cat => cat.type === type);
    }
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return type ? SAMPLE_CATEGORIES.filter(cat => cat.type === type) : SAMPLE_CATEGORIES;
  }
};

/**
 * Add a new category
 * @param {Object} category - Category object with name, type, color, icon
 * @returns {Promise<Object>} Added category with generated ID
 */
export const addCategory = async (category) => {
  try {
    const categories = await fetchCategories();
    const newCategory = {
      ...category,
      id: `cat${Date.now()}`,
    };
    
    const updatedCategories = [...categories, newCategory];
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    
    return newCategory;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Update a category
 * @param {string} categoryId - ID of category to update
 * @param {Object} updatedCategory - Updated category data
 * @returns {Promise<Object>} Updated category
 */
export const updateCategory = async (categoryId, updatedCategory) => {
  try {
    const categories = await fetchCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      ...updatedCategory,
      id: categoryId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem('categories', JSON.stringify(categories));
    return categories[categoryIndex];
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 * @param {string} categoryId - ID of category to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteCategory = async (categoryId) => {
  try {
    // Check if category is being used in transactions
    const transactions = await fetchRecentTransactions(1000);
    const isUsed = transactions.some(t => t.category === categoryId || t.categoryId === categoryId);
    
    if (isUsed) {
      throw new Error('Cannot delete category that is being used in transactions');
    }
    
    const categories = await fetchCategories();
    const filteredCategories = categories.filter(c => c.id !== categoryId);
    
    await AsyncStorage.setItem('categories', JSON.stringify(filteredCategories));
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Calculate budget expiry date based on period
 * @param {string} period - 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
 * @param {Date} startDate - Budget start date
 * @returns {Date} Expiry date
 */
const calculateBudgetExpiry = (period, startDate = new Date()) => {
  const expiryDate = new Date(startDate);
  
  switch (period) {
    case 'daily':
      expiryDate.setDate(expiryDate.getDate() + 1);
      break;
    case 'weekly':
      expiryDate.setDate(expiryDate.getDate() + 7);
      break;
    case 'monthly':
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      break;
    case 'quarterly':
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      break;
    case 'yearly':
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      break;
    default:
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Default to monthly
  }
  
  return expiryDate;
};

/**
 * Save or update a budget
 * @param {Object} budget - Budget object
 * @returns {Promise<Object>} Saved budget
 */
export const saveBudget = async (budget) => {
  try {
    const budgets = await fetchBudgets();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const now = new Date();
    
    // Find the category to get its name
    const storedCategories = await AsyncStorage.getItem('categories');
    const categories = storedCategories ? JSON.parse(storedCategories) : [];
    const category = categories.find(c => c.id === budget.categoryId) || {};
    
    // Calculate expiry date based on budget period
    const budgetPeriod = budget.period || 'monthly';
    const startDate = budget.startDate ? new Date(budget.startDate) : now;
    const expiryDate = calculateBudgetExpiry(budgetPeriod, startDate);
    
    // Set budget fields
    const newBudget = {
      ...budget,
      id: budget.id || `budget${Date.now()}`,
      category: category.name || 'Unknown', // Store the category name for easier reference
      color: category.color, // Store color for visualization
      month: currentMonth,
      year: currentYear,
      spent: budget.spent || 0, // Initialize spent as 0 if not provided
      period: budgetPeriod, // Budget period (daily, weekly, monthly, quarterly, yearly)
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      isActive: true,
      autoReset: budget.autoReset !== false, // Default to true unless explicitly set to false
      resetCount: budget.resetCount || 0, // Track how many times this budget has been reset
      createdAt: budget.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingIndex = budgets.findIndex(b => b.id === newBudget.id);
    if (existingIndex !== -1) {
      budgets[existingIndex] = newBudget;
    } else {
      budgets.push(newBudget);
    }
    
    await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
    
    // Update budget summary data after adding/updating a budget
    await updateBudgetSummary();
    
    return newBudget;
  } catch (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
};

/**
 * Check for expired budgets and reset them if auto-reset is enabled
 * This should be called on app startup or periodically
 * @returns {Promise<Object>} Result object with reset information
 */
export const processExpiredBudgets = async () => {
  try {
    // Get raw budget data to avoid circular dependency
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    const now = new Date();
    let hasUpdates = false;
    let resetBudgets = [];
    let expiredBudgets = [];
    
    for (let i = 0; i < budgets.length; i++) {
      const budget = budgets[i];
      
      // Skip if budget doesn't have expiry date (old budgets)
      if (!budget.expiryDate || !budget.isActive) continue;
      
      const expiryDate = new Date(budget.expiryDate);
      
      // Check if budget has expired
      if (now >= expiryDate) {
        if (budget.autoReset) {
          // Reset the budget for the next period
          const newStartDate = new Date(budget.expiryDate);
          const newExpiryDate = calculateBudgetExpiry(budget.period || 'monthly', newStartDate);
          
          budget.spent = 0; // Reset spent amount
          budget.startDate = newStartDate.toISOString();
          budget.expiryDate = newExpiryDate.toISOString();
          budget.resetCount = (budget.resetCount || 0) + 1;
          budget.lastResetAt = now.toISOString();
          budget.updatedAt = now.toISOString();
          
          resetBudgets.push({
            id: budget.id,
            category: budget.category,
            period: budget.period,
            amount: budget.amount,
            newExpiryDate: newExpiryDate.toISOString()
          });
          
          hasUpdates = true;
          console.log(`Budget reset: ${budget.category} (${budget.period}) - Reset #${budget.resetCount}`);
        } else {
          // Mark budget as expired but don't reset
          budget.isActive = false;
          budget.expiredAt = now.toISOString();
          budget.updatedAt = now.toISOString();
          
          expiredBudgets.push({
            id: budget.id,
            category: budget.category,
            period: budget.period,
            amount: budget.amount
          });
          
          hasUpdates = true;
          console.log(`Budget expired: ${budget.category} (${budget.period})`);
        }
      }
    }
    
    // Save updated budgets if there were changes
    if (hasUpdates) {
      await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
      
      // Update budget summary after processing expired budgets
      await updateBudgetSummary();
      
      // Emit events for budget changes
      if (resetBudgets.length > 0) {
        emitEvent(EVENTS.BUDGETS_RESET, { budgets: resetBudgets });
      }
      if (expiredBudgets.length > 0) {
        emitEvent(EVENTS.BUDGETS_EXPIRED, { budgets: expiredBudgets });
      }
    }
    
    return {
      processed: budgets.length,
      reset: resetBudgets.length,
      expired: expiredBudgets.length,
      resetBudgets,
      expiredBudgets
    };
  } catch (error) {
    console.error('Error processing expired budgets:', error);
    return {
      processed: 0,
      reset: 0,
      expired: 0,
      resetBudgets: [],
      expiredBudgets: [],
      error: error.message
    };
  }
};

/**
 * Manually reset a budget (restart the period)
 * @param {string} budgetId - ID of budget to reset
 * @returns {Promise<Object>} Reset budget
 */
export const resetBudget = async (budgetId) => {
  try {
    // Get raw budget data to avoid circular dependency
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    const budgetIndex = budgets.findIndex(b => b.id === budgetId);
    
    if (budgetIndex === -1) {
      throw new Error(`Budget with ID ${budgetId} not found`);
    }
    
    const budget = budgets[budgetIndex];
    const now = new Date();
    const newExpiryDate = calculateBudgetExpiry(budget.period || 'monthly', now);
    
    // Reset the budget
    budget.spent = 0;
    budget.startDate = now.toISOString();
    budget.expiryDate = newExpiryDate.toISOString();
    budget.isActive = true;
    budget.resetCount = (budget.resetCount || 0) + 1;
    budget.lastResetAt = now.toISOString();
    budget.updatedAt = now.toISOString();
    
    await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
    
    // Update budget summary
    await updateBudgetSummary();
    
    // Emit event for manual budget reset
    emitEvent(EVENTS.BUDGET_RESET, { 
      budgetId, 
      budget: budget,
      manual: true 
    });
    
    console.log(`Budget manually reset: ${budget.category} (${budget.period})`);
    return budget;
  } catch (error) {
    console.error('Error resetting budget:', error);
    throw error;
  }
};

/**
 * Get budget status (active, expired, days remaining)
 * @param {string} budgetId - ID of budget to check
 * @returns {Promise<Object>} Budget status object
 */
export const getBudgetStatus = async (budgetId) => {
  try {
    // Get raw budget data to avoid circular dependency
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    const budget = budgets.find(b => b.id === budgetId);
    
    if (!budget) {
      throw new Error(`Budget with ID ${budgetId} not found`);
    }
    
    if (!budget.expiryDate) {
      return {
        status: 'legacy',
        message: 'This budget was created before time limits were added'
      };
    }
    
    const now = new Date();
    const expiryDate = new Date(budget.expiryDate);
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    let status, message;
    
    if (!budget.isActive) {
      status = 'expired';
      message = 'Budget has expired';
    } else if (daysRemaining <= 0) {
      status = 'expired';
      message = 'Budget has expired and needs processing';
    } else if (daysRemaining <= 3) {
      status = 'expiring_soon';
      message = `Budget expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
    } else {
      status = 'active';
      message = `${daysRemaining} days remaining`;
    }
    
    return {
      status,
      message,
      daysRemaining,
      expiryDate: budget.expiryDate,
      period: budget.period,
      autoReset: budget.autoReset,
      resetCount: budget.resetCount || 0
    };
  } catch (error) {
    console.error('Error getting budget status:', error);
    throw error;
  }
};

/**
 * Get all budgets with their current status
 * @returns {Promise<Array>} Array of budgets with status information
 */
export const fetchBudgets = async () => {
  try {
    // Direct fetch without delay for better performance
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    
    // Add status information to each budget without circular dependency
    const budgetsWithStatus = budgets.map((budget) => {
      try {
        // Calculate status directly here to avoid circular dependency
        const now = new Date();
        let status = 'legacy';
        let message = 'This budget was created before time limits were added';
        let daysRemaining = 0;
        
        if (budget.expiryDate) {
          const expiryDate = new Date(budget.expiryDate);
          daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          
          if (!budget.isActive) {
            status = 'expired';
            message = 'Budget has expired';
          } else if (daysRemaining <= 0) {
            status = 'expired';
            message = 'Budget has expired and needs processing';
          } else if (daysRemaining <= 3) {
            status = 'expiring_soon';
            message = `Budget expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
          } else {
            status = 'active';
            message = `${daysRemaining} days remaining`;
          }
        }
        
        return {
          ...budget,
          statusInfo: {
            status,
            message,
            daysRemaining,
            expiryDate: budget.expiryDate,
            period: budget.period,
            autoReset: budget.autoReset,
            resetCount: budget.resetCount || 0
          }
        };
      } catch (error) {
        // If status calculation fails, return budget without status
        console.error('Error calculating budget status:', error);
        return budget;
      }
    });
    
    return budgetsWithStatus;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
};

/**
 * Delete a budget
 * @param {string} budgetId - ID of budget to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteBudget = async (budgetId) => {
  try {
    // Get raw budget data to avoid circular dependency
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    const filteredBudgets = budgets.filter(b => b.id !== budgetId);
    
    await AsyncStorage.setItem('budgets', JSON.stringify(filteredBudgets));
    
    // Update budget summary data after deleting a budget
    await updateBudgetSummary();
    
    return true;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

/**
 * Update a budget
 * @param {string} budgetId - ID of budget to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated budget
 */
export const updateBudget = async (budgetId, updates) => {
  try {
    // Get raw budget data to avoid circular dependency
    const storedBudgets = await AsyncStorage.getItem('budgets');
    const budgets = storedBudgets ? JSON.parse(storedBudgets) : [];
    const budgetIndex = budgets.findIndex(b => b.id === budgetId);
    
    if (budgetIndex === -1) {
      throw new Error(`Budget with ID ${budgetId} not found`);
    }
    
    // If categoryId is changed, get the updated category information
    if (updates.categoryId && updates.categoryId !== budgets[budgetIndex].categoryId) {
      const storedCategories = await AsyncStorage.getItem('categories');
      const categories = storedCategories ? JSON.parse(storedCategories) : [];
      const category = categories.find(c => c.id === updates.categoryId);
      
      if (category) {
        updates.category = category.name || 'Unknown';
        updates.color = category.color;
      }
    }
    
    // Update the budget
    budgets[budgetIndex] = {
      ...budgets[budgetIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem('budgets', JSON.stringify(budgets));
    
    // Update budget summary data
    await updateBudgetSummary();
    
    return budgets[budgetIndex];
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

/**
 * Get spending analytics for a specific period
 * @param {number} days - Number of days to analyze
 * @returns {Promise<Object>} Spending analytics object
 */
export const getSpendingAnalytics = async (days = 30) => {
  try {
    await delay(400);
    
    const transactions = await fetchRecentTransactions(days);
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    if (!Array.isArray(expenseTransactions)) {
      return {
        totalSpent: 0,
        dailyAverage: 0,
        weeklyAverage: 0,
        transactionCount: 0,
        topCategories: []
      };
    }
    
    const totalSpent = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const dailyAverage = totalSpent / days;
    const weeklyAverage = dailyAverage * 7;
    const transactionCount = expenseTransactions.length;
    
    // Category analysis
    const categorySpending = {};
    
    // Get categories for name lookup
    const storedCategories = await AsyncStorage.getItem('categories');
    const categories = storedCategories ? JSON.parse(storedCategories) : [];
    
    expenseTransactions.forEach(t => {
      // Use categoryId to find category name, fallback to category field if exists
      let categoryName = 'Other';
      if (t.categoryId) {
        const categoryObj = categories.find(cat => cat.id === t.categoryId);
        categoryName = categoryObj ? categoryObj.name : 'Other';
      } else if (t.category) {
        categoryName = t.category;
      }
      
      categorySpending[categoryName] = (categorySpending[categoryName] || 0) + (t.amount || 0);
    });
      // Calculate percentages and sort categories
    const topCategories = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        name: category.charAt(0).toUpperCase() + category.slice(1), // For chart display
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        color: getCategoryColor(category) // Add color for chart
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Increase to 8 for better chart display
    
    return {
      totalSpent,
      dailyAverage,
      weeklyAverage,
      transactionCount,
      topCategories: Array.isArray(topCategories) ? topCategories : [],
      period: days,
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting spending analytics:', error);
    return {
      totalSpent: 0,
      dailyAverage: 0,
      weeklyAverage: 0,
      transactionCount: 0,
      topCategories: []
    };
  }
};

/**
 * Get financial insights and statistics
 * @returns {Promise<Object>} Financial insights object
 */
export const getFinancialInsights = async () => {
  try {
    await delay(500);
    
    const userData = await fetchUserData();
    const transactions = await fetchRecentTransactions(30); // Last 30 transactions
    
    // Calculate insights
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Category spending analysis
    const categorySpending = {};
    
    // Get categories for name lookup
    const storedCategories = await AsyncStorage.getItem('categories');
    const categories = storedCategories ? JSON.parse(storedCategories) : [];
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        // Use categoryId to find category name, fallback to category field if exists
        let categoryName = 'Other';
        if (t.categoryId) {
          const categoryObj = categories.find(cat => cat.id === t.categoryId);
          categoryName = categoryObj ? categoryObj.name : 'Other';
        } else if (t.category) {
          categoryName = t.category;
        }
        
        categorySpending[categoryName] = (categorySpending[categoryName] || 0) + t.amount;
      });
    
    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
    
    return {
      savingsRate,
      totalIncome,
      totalExpenses,
      topCategories: Array.isArray(topCategories) ? topCategories : [],
      monthlyAverage: {
        income: userData.monthlyIncome,
        expenses: userData.monthlyExpenses,
      },
      goalProgress: {
        target: userData.savingsGoal || 100000,
        current: userData.currentSavings || 0,
        percentage: ((userData.currentSavings || 0) / (userData.savingsGoal || 100000)) * 100,
      }
    };
  } catch (error) {
    console.error('Error getting financial insights:', error);
    return null;
  }
};

/**
 * Fetch financial goals
 * @returns {Promise<Array>} Array of financial goals
 */
export const fetchGoals = async () => {
  try {
    await delay(400);
    
    const storedGoals = await AsyncStorage.getItem('goals');
    const goals = storedGoals ? JSON.parse(storedGoals) : SAMPLE_GOALS;
    
    // Ensure goals is an array
    if (!Array.isArray(goals)) {
      return [];
    }
    
    // Calculate progress percentages
    return goals.map(goal => ({
      ...goal,
      progressPercentage: Math.min((goal.currentAmount / goal.targetAmount) * 100, 100),
      remaining: goal.targetAmount - goal.currentAmount,
      daysLeft: Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    }));
  } catch (error) {
    console.error('Error fetching goals:', error);
    return SAMPLE_GOALS;
  }
};

/**
 * Add or update a financial goal
 * @param {Object} goal - Goal object
 * @returns {Promise<Object>} Added/updated goal
 */
export const saveGoal = async (goal) => {
  try {
    const goals = await fetchGoals();
    const newGoal = {
      ...goal,
      id: goal.id || `goal${Date.now()}`,
    };
    
    const existingIndex = goals.findIndex(g => g.id === newGoal.id);
    if (existingIndex >= 0) {
      goals[existingIndex] = newGoal;    } else {
      goals.push(newGoal);
    }
    
    await AsyncStorage.setItem('goals', JSON.stringify(goals));
    return newGoal;
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

/**
 * Update an existing goal
 * @param {string} goalId - ID of goal to update
 * @param {Object} goalData - Updated goal data
 * @returns {Promise<Object>} Updated goal
 */
export const updateGoal = async (goalId, goalData) => {
  try {
    const goals = await fetchGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal = {
      ...goals[goalIndex],
      ...goalData,
      id: goalId,
      updatedAt: new Date().toISOString()
    };
    
    goals[goalIndex] = updatedGoal;
    await AsyncStorage.setItem('goals', JSON.stringify(goals));
    return updatedGoal;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Delete a goal
 * @param {string} goalId - ID of goal to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteGoal = async (goalId) => {
  try {
    const goals = await fetchGoals();
    const filteredGoals = goals.filter(g => g.id !== goalId);
    
    await AsyncStorage.setItem('goals', JSON.stringify(filteredGoals));
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

/**
 * Add money to a goal
 * @param {string} goalId - ID of goal
 * @param {number} amount - Amount to add
 * @returns {Promise<Object>} Updated goal
 */
export const addToGoal = async (goalId, amount) => {
  try {
    const goals = await fetchGoals();
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    
    const goal = goals[goalIndex];
    goal.currentAmount += amount;
    goal.progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
    goal.updatedAt = new Date().toISOString();
    
    await AsyncStorage.setItem('goals', JSON.stringify(goals));
    
    // Also save as a transaction
    await saveTransaction({
      type: 'expense',
      amount: amount,
      category: 'Savings',
      categoryId: 'savings',
      title: `Contribution to ${goal.title}`,
      description: `Added to goal: ${goal.title}`,
      date: new Date().toISOString(),
      paymentMode: 'goal_contribution',
      goalId: goalId
    });
    
    return goal;
  } catch (error) {
    console.error('Error adding to goal:', error);
    throw error;
  }
};

// Enhanced updateBalanceFromTransaction to handle reversals
const updateBalanceFromTransactionEnhanced = async (transaction, oldTransaction = null) => {
  try {
    const storedData = await AsyncStorage.getItem('userData');
    const userData = storedData ? JSON.parse(storedData) : SAMPLE_USER_DATA;
    
    if (oldTransaction) {
      // Reverse the old transaction first
      if (oldTransaction.type === 'income') {
        userData.balance -= oldTransaction.amount;
      } else {
        userData.balance += oldTransaction.amount;
      }
    }
    
    // Apply the new transaction
    if (transaction.type === 'income') {
      userData.balance += transaction.amount;
    } else {
      userData.balance -= transaction.amount;
    }
    
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error;
  }
};

/**
 * Initialize app with sample data (for first time users)
 * @returns {Promise<void>}
 */
export const initializeAppData = async () => {
  try {
    // Check if data already exists
    const existingTransactions = await AsyncStorage.getItem('transactions');
    const existingCategories = await AsyncStorage.getItem('categories');
    const existingGoals = await AsyncStorage.getItem('goals');
    
    // Initialize with sample data if none exists
    if (!existingTransactions) {
      await AsyncStorage.setItem('transactions', JSON.stringify(SAMPLE_TRANSACTIONS));
    }
    
    if (!existingCategories) {
      await AsyncStorage.setItem('categories', JSON.stringify(SAMPLE_CATEGORIES));
    }
    
    if (!existingGoals) {
      await AsyncStorage.setItem('goals', JSON.stringify(SAMPLE_GOALS));
    }
    
    // Initialize user data
    const existingUserData = await AsyncStorage.getItem('userData');
    if (!existingUserData) {
      await AsyncStorage.setItem('userData', JSON.stringify(SAMPLE_USER_DATA));
    }
    
    console.log('App data initialized with sample data');
  } catch (error) {
    console.error('Error initializing app data:', error);
  }
};

/**
 * Clear all app data (transactions, goals, budgets)
 * @returns {Promise<void>}
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.setItem('transactions', JSON.stringify([]));
    await AsyncStorage.setItem('goals', JSON.stringify([]));
    await AsyncStorage.setItem('budgets', JSON.stringify([]));
    
    console.log('All app data cleared');
  } catch (error) {
    console.error('Error clearing app data:', error);
  }
};

/**
 * Reset all app data to sample data (for demo purposes)
 * @returns {Promise<void>}
 */
export const resetToSampleData = async () => {
  try {
    await AsyncStorage.setItem('transactions', JSON.stringify(SAMPLE_TRANSACTIONS));
    await AsyncStorage.setItem('categories', JSON.stringify(SAMPLE_CATEGORIES));
    await AsyncStorage.setItem('goals', JSON.stringify(SAMPLE_GOALS));
    await AsyncStorage.setItem('userData', JSON.stringify(SAMPLE_USER_DATA));
    
    console.log('App data reset to sample data');
  } catch (error) {
    console.error('Error resetting app data:', error);
  }
};
