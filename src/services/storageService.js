import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TRANSACTIONS: '@finguard_transactions',
  CATEGORIES: '@finguard_categories',
  BUDGETS: '@finguard_budgets',
  USER_PROFILE: '@finguard_profile',
};

export const storageService = {
  // Generic storage methods
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error; // Propagate error to caller
    }
  },
  
  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  
  // Get item with array fallback - enhanced safety
  async getItemAsArray(key) {
    try {
      const value = await this.getItem(key);
      // Extra validation to ensure we return an array
      if (Array.isArray(value)) {
        // Filter out any null/undefined items for safety
        return value.filter(item => item != null);
      }
      return [];
    } catch (error) {
      console.error(`Storage getItemAsArray error for key ${key}:`, error);
      return []; // Always return an empty array as fallback
    }
  },

  // Transaction methods with enhanced safety
  async saveTransaction(transaction) {
    if (!transaction) {
      console.error('Cannot save undefined transaction');
      throw new Error('Invalid transaction data');
    }
    
    try {
      const transactions = await this.getTransactions();
      const newTransaction = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...transaction,
      };
      transactions.push(newTransaction);
      await this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  },
  
  async getTransactions() {
    try {
      return await this.getItemAsArray(STORAGE_KEYS.TRANSACTIONS);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return []; // Return empty array on error
    }
  },

  async updateTransaction(id, updates) {
    const transactions = await this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      await this.setItem(STORAGE_KEYS.TRANSACTIONS, transactions);
    }
  },

  async deleteTransaction(id) {
    const transactions = await this.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);    await this.setItem(STORAGE_KEYS.TRANSACTIONS, filtered);
  },

  // Category methods
  async getCategories() {
    const categories = await this.getItemAsArray(STORAGE_KEYS.CATEGORIES);
    if (categories.length === 0) {
      // Initialize default categories
      const defaultCategories = [
        { id: '1', name: 'Food', icon: 'restaurant', color: '#ff6b6b', type: 'expense' },
        { id: '2', name: 'Travel', icon: 'car', color: '#4ecdc4', type: 'expense' },
        { id: '3', name: 'Rent', icon: 'home', color: '#45b7d1', type: 'expense' },
        { id: '4', name: 'Shopping', icon: 'bag', color: '#96ceb4', type: 'expense' },
        { id: '5', name: 'Entertainment', icon: 'musical-notes', color: '#ffeaa7', type: 'expense' },
        { id: '6', name: 'Healthcare', icon: 'medical', color: '#fd79a8', type: 'expense' },
        { id: '7', name: 'Salary', icon: 'card', color: '#6c5ce7', type: 'income' },
        { id: '8', name: 'Freelance', icon: 'laptop', color: '#a29bfe', type: 'income' },
        { id: '9', name: 'Investment', icon: 'trending-up', color: '#fd79a8', type: 'income' },
      ];
      await this.setItem(STORAGE_KEYS.CATEGORIES, defaultCategories);
      return defaultCategories;
    }
    return categories;
  },

  async saveCategory(category) {
    const categories = await this.getCategories();
    const newCategory = {
      id: Date.now().toString(),
      ...category,
    };
    categories.push(newCategory);
    await this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },

  async updateCategory(id, updates) {
    const categories = await this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      await this.setItem(STORAGE_KEYS.CATEGORIES, categories);
    }
  },

  async deleteCategory(id) {
    const categories = await this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    await this.setItem(STORAGE_KEYS.CATEGORIES, filtered);
  },

  // Budget methods
  async getBudgets() {
    return (await this.getItem(STORAGE_KEYS.BUDGETS)) || [];
  },

  async saveBudget(budget) {
    const budgets = await this.getBudgets();
    const newBudget = {
      id: Date.now().toString(),
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      ...budget,
    };
    budgets.push(newBudget);
    await this.setItem(STORAGE_KEYS.BUDGETS, budgets);
    return newBudget;
  },

  async updateBudget(id, updates) {
    const budgets = await this.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      await this.setItem(STORAGE_KEYS.BUDGETS, budgets);
    }
  },

  async deleteBudget(id) {
    const budgets = await this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    await this.setItem(STORAGE_KEYS.BUDGETS, filtered);
  },
};

export default storageService;
