// FinGuard Data Service
// This file handles all data operations like fetching user data, transactions, and budget information

import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample data - In a real app, this would be replaced with API calls or database operations
const SAMPLE_USER_DATA = {
  name: 'Rajesh Kumar',
  balance: 45780.25,
  monthlyIncome: 75000.00,
  monthlyExpenses: 42650.75,
  savingsGoal: 100000,
  currentSavings: 65400,
};

const SAMPLE_TRANSACTIONS = [
  // Recent transactions (June 2025)
  {
    id: 't1',
    title: 'Big Basket Grocery',
    amount: 2850.50,
    type: 'expense',
    category: 'Food',
    date: new Date(2025, 5, 17), // June 17, 2025 (today)
    icon: 'cart',
    paymentMode: 'upi'
  },
  {
    id: 't2',
    title: 'Monthly Salary',
    amount: 75000.00,
    type: 'income',
    category: 'Salary',
    date: new Date(2025, 5, 1), // June 1, 2025
    icon: 'cash',
    paymentMode: 'bank_transfer'
  },
  {
    id: 't3',
    title: 'Zomato Food Delivery',
    amount: 450.00,
    type: 'expense',
    category: 'Food',
    date: new Date(2025, 5, 16), // June 16, 2025
    icon: 'restaurant',
    paymentMode: 'credit_card'
  },
  {
    id: 't4',
    title: 'Electricity Bill - BESCOM',
    amount: 1875.00,
    type: 'expense',
    category: 'Utilities',
    date: new Date(2025, 5, 15), // June 15, 2025
    icon: 'flash',
    paymentMode: 'upi'
  },
  {
    id: 't5',
    title: 'Uber Ride',
    amount: 285.50,
    type: 'expense',
    category: 'Transportation',
    date: new Date(2025, 5, 15), // June 15, 2025
    icon: 'car',
    paymentMode: 'digital_wallet'
  },
  {
    id: 't6',
    title: 'Netflix Subscription',
    amount: 649.00,
    type: 'expense',
    category: 'Entertainment',
    date: new Date(2025, 5, 14), // June 14, 2025
    icon: 'film',
    paymentMode: 'credit_card'
  },
  {
    id: 't7',
    title: 'Freelance Project Payment',
    amount: 15000.00,
    type: 'income',
    category: 'Freelance',
    date: new Date(2025, 5, 13), // June 13, 2025
    icon: 'laptop',
    paymentMode: 'bank_transfer'
  },
  {
    id: 't8',
    title: 'Petrol - HP',
    amount: 3200.00,
    type: 'expense',
    category: 'Transportation',
    date: new Date(2025, 5, 12), // June 12, 2025
    icon: 'car',
    paymentMode: 'credit_card'
  },
  {
    id: 't9',
    title: 'Medical Checkup',
    amount: 2500.00,
    type: 'expense',
    category: 'Healthcare',
    date: new Date(2025, 5, 11), // June 11, 2025
    icon: 'medical',
    paymentMode: 'cash'
  },
  {
    id: 't10',
    title: 'Amazon Shopping',
    amount: 1850.75,
    type: 'expense',
    category: 'Shopping',
    date: new Date(2025, 5, 10), // June 10, 2025
    icon: 'bag',
    paymentMode: 'credit_card'
  },
  {
    id: 't11',
    title: 'Internet Bill - Airtel',
    amount: 999.00,
    type: 'expense',
    category: 'Utilities',
    date: new Date(2025, 5, 9), // June 9, 2025
    icon: 'wifi',
    paymentMode: 'upi'
  },
  {
    id: 't12',
    title: 'Cafe Coffee Day',
    amount: 320.00,
    type: 'expense',
    category: 'Food',
    date: new Date(2025, 5, 8), // June 8, 2025
    icon: 'cafe',
    paymentMode: 'debit_card'
  },
  {
    id: 't13',
    title: 'Stock Dividend',
    amount: 2400.00,
    type: 'income',
    category: 'Investment',
    date: new Date(2025, 5, 7), // June 7, 2025
    icon: 'trending-up',
    paymentMode: 'bank_transfer'
  },
  {
    id: 't14',
    title: 'Gym Membership',
    amount: 1500.00,
    type: 'expense',
    category: 'Health',
    date: new Date(2025, 5, 6), // June 6, 2025
    icon: 'fitness',
    paymentMode: 'upi'
  },
  {
    id: 't15',
    title: 'Book Purchase',
    amount: 750.00,
    type: 'expense',
    category: 'Education',
    date: new Date(2025, 5, 5), // June 5, 2025
    icon: 'book',
    paymentMode: 'cash'
  },
  {
    id: 't16',
    title: 'Mobile Recharge',
    amount: 399.00,
    type: 'expense',
    category: 'Utilities',
    date: new Date(2025, 5, 4), // June 4, 2025
    icon: 'phone-portrait',
    paymentMode: 'upi'
  },
  {
    id: 't17',
    title: 'Rent Payment',
    amount: 18000.00,
    type: 'expense',
    category: 'Housing',
    date: new Date(2025, 5, 3), // June 3, 2025
    icon: 'home',
    paymentMode: 'bank_transfer'
  },
  {
    id: 't18',
    title: 'Mutual Fund SIP',
    amount: 5000.00,
    type: 'expense',
    category: 'Investment',
    date: new Date(2025, 5, 2), // June 2, 2025
    icon: 'trending-up',
    paymentMode: 'bank_transfer'
  },
  // Previous month transactions (May 2025)
  {
    id: 't19',
    title: 'May Salary',
    amount: 75000.00,
    type: 'income',
    category: 'Salary',
    date: new Date(2025, 4, 31), // May 31, 2025
    icon: 'cash',
    paymentMode: 'bank_transfer'
  },
  {
    id: 't20',
    title: 'Mother\'s Day Gift',
    amount: 3500.00,
    type: 'expense',
    category: 'Shopping',
    date: new Date(2025, 4, 12), // May 12, 2025
    icon: 'gift',
    paymentMode: 'credit_card'
  },
];

const SAMPLE_BUDGET_DATA = {
  total: 50000,
  spent: 42650.75,
  categories: [
    { 
      name: 'Food', 
      allocated: 8000, 
      spent: 3620.50, 
      color: '#10b981',
      icon: 'restaurant'
    },
    { 
      name: 'Housing', 
      allocated: 18000, 
      spent: 18000, 
      color: '#3b82f6',
      icon: 'home'
    },
    { 
      name: 'Transportation', 
      allocated: 5000, 
      spent: 3485.50, 
      color: '#8b5cf6',
      icon: 'car'
    },
    { 
      name: 'Utilities', 
      allocated: 4000, 
      spent: 2873.00, 
      color: '#f59e0b',
      icon: 'flash'
    },
    { 
      name: 'Entertainment', 
      allocated: 3000, 
      spent: 649.00, 
      color: '#ef4444',
      icon: 'film'
    },
    { 
      name: 'Healthcare', 
      allocated: 4000, 
      spent: 2500.00, 
      color: '#06b6d4',
      icon: 'medical'
    },
    { 
      name: 'Shopping', 
      allocated: 5000, 
      spent: 5350.75, 
      color: '#84cc16',
      icon: 'bag'
    },
    { 
      name: 'Investment', 
      allocated: 3000, 
      spent: 5000.00, 
      color: '#f97316',
      icon: 'trending-up'
    },
  ]
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
  {
    id: 'goal1',
    title: 'Emergency Fund',
    targetAmount: 300000,
    currentAmount: 185000,
    deadline: new Date(2025, 11, 31), // December 31, 2025
    category: 'Savings',
    priority: 'high',
    color: '#ef4444'
  },
  {
    id: 'goal2',
    title: 'New Car Purchase',
    targetAmount: 800000,
    currentAmount: 245000,
    deadline: new Date(2026, 5, 15), // June 15, 2026
    category: 'Transportation',
    priority: 'medium',
    color: '#3b82f6'
  },
  {
    id: 'goal3',
    title: 'Vacation to Europe',
    targetAmount: 150000,
    currentAmount: 45000,
    deadline: new Date(2025, 9, 1), // October 1, 2025
    category: 'Travel',
    priority: 'low',
    color: '#10b981'
  },
  {
    id: 'goal4',
    title: 'Home Down Payment',
    targetAmount: 1500000,
    currentAmount: 420000,
    deadline: new Date(2027, 2, 15), // March 15, 2027
    category: 'Housing',
    priority: 'high',
    color: '#f59e0b'
  }
];

const SAMPLE_BUDGETS = [
  {
    id: 'budget1',
    categoryId: 'cat1',
    amount: 8000,
    period: 'monthly',
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 30),
    spent: 3620.50,
    alertThreshold: 80
  },
  {
    id: 'budget2',
    categoryId: 'cat2',
    amount: 5000,
    period: 'monthly',
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 30),
    spent: 3485.50,
    alertThreshold: 90
  },
  {
    id: 'budget3',
    categoryId: 'cat7',
    amount: 18000,
    period: 'monthly',
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 30),
    spent: 18000,
    alertThreshold: 95
  },
  {
    id: 'budget4',
    categoryId: 'cat6',
    amount: 4000,
    period: 'monthly',
    startDate: new Date(2025, 5, 1),
    endDate: new Date(2025, 5, 30),
    spent: 2873.00,
    alertThreshold: 85
  }
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
  {
    id: 'bill1',
    title: 'Electricity Bill',
    amount: 1875.00,
    dueDate: new Date(2025, 5, 20), // June 20, 2025
    category: 'Utilities',
    provider: 'BESCOM',
    status: 'pending',
    recurring: true,
    icon: 'flash'
  },
  {
    id: 'bill2',
    title: 'Internet Bill',
    amount: 999.00,
    dueDate: new Date(2025, 5, 25), // June 25, 2025
    category: 'Utilities',
    provider: 'Airtel',
    status: 'pending',
    recurring: true,
    icon: 'wifi'
  },
  {
    id: 'bill3',
    title: 'Mobile Recharge',
    amount: 399.00,
    dueDate: new Date(2025, 5, 22), // June 22, 2025
    category: 'Utilities',
    provider: 'Vodafone',
    status: 'pending',
    recurring: true,
    icon: 'phone-portrait'
  },
  {
    id: 'bill4',
    title: 'Netflix Subscription',
    amount: 649.00,
    dueDate: new Date(2025, 6, 14), // July 14, 2025
    category: 'Entertainment',
    provider: 'Netflix',
    status: 'upcoming',
    recurring: true,
    icon: 'film'
  },
  {
    id: 'bill5',
    title: 'Gym Membership',
    amount: 1500.00,
    dueDate: new Date(2025, 6, 6), // July 6, 2025
    category: 'Health',
    provider: 'FitGym',
    status: 'upcoming',
    recurring: true,
    icon: 'fitness'
  }
];

// Simulated delay to mimic API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch user data (balance, income, expenses)
 * @returns {Promise<Object>} User data object
 */
export const fetchUserData = async () => {
  try {
    // In a real app, this would be an API call or AsyncStorage read
    // For now, we'll simulate an API call with a small delay
    await delay(500);
    
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
    await delay(700);
    
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
    await delay(600);
    
    const storedBudget = await AsyncStorage.getItem('budgetData');
    return storedBudget ? JSON.parse(storedBudget) : SAMPLE_BUDGET_DATA;
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    return SAMPLE_BUDGET_DATA;
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
    await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    // Update balance data
    await updateBalanceFromTransaction(newTransaction);
    
    return newTransaction;
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
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
    
    // Reverse the balance change
    const reverseTransaction = {
      ...deletedTransaction,
      type: deletedTransaction.type === 'income' ? 'expense' : 'income'
    };
    await updateBalanceFromTransaction(reverseTransaction);
    
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
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
  } catch (error) {
    console.error('Error updating balance:', error);
    throw error; // Re-throw to handle in calling function
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
    await delay(300); // Simulate API delay
    
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
 * Save or update a budget
 * @param {Object} budget - Budget object
 * @returns {Promise<Object>} Saved budget
 */
export const saveBudget = async (budget) => {
  try {
    const budgets = await fetchBudgets();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newBudget = {
      ...budget,
      id: budget.id || `budget${Date.now()}`,
      month: currentMonth,
      year: currentYear,
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
    return newBudget;
  } catch (error) {
    console.error('Error saving budget:', error);
    throw error;
  }
};

/**
 * Get all budgets
 * @returns {Promise<Array>} Array of budgets
 */
export const fetchBudgets = async () => {
  try {
    const storedBudgets = await AsyncStorage.getItem('budgets');
    return storedBudgets ? JSON.parse(storedBudgets) : [];
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
    const budgets = await fetchBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== budgetId);
    
    await AsyncStorage.setItem('budgets', JSON.stringify(filteredBudgets));
    return true;
  } catch (error) {
    console.error('Error deleting budget:', error);
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
    expenseTransactions.forEach(t => {
      const category = t.category || 'Other';
      categorySpending[category] = (categorySpending[category] || 0) + (t.amount || 0);
    });
    
    // Calculate percentages and sort categories
    const topCategories = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
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
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
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
