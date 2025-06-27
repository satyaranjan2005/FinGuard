import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input } from '../components';
import { storageService } from '../services/storageService';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../services/dataService';
import colors from '../utils/colors';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert, 
  showInfoAlert 
} from '../services/alertService';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('expense');
  const [selectedIcon, setSelectedIcon] = useState('wallet');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const availableIcons = [
    'wallet', 'restaurant', 'car', 'home', 'bag', 'medical', 'airplane',
    'musical-notes', 'fitness', 'book', 'gift', 'phone', 'laptop',
    'card', 'trending-up', 'business', 'school', 'paw', 'game-controller',
    'camera', 'train', 'bus', 'bicycle', 'bed', 'shirt'
  ];

  const availableColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
    '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#f43f5e',
    '#22c55e', '#a855f7', '#0ea5e9', '#eab308', '#d946ef', '#059669'
  ];
  useEffect(() => {
    loadCategories();
  }, []);

  // Reload categories when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Load categories error:', error);
      showErrorAlert('Error', 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const categoriesData = await fetchCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Refresh categories error:', error);
      showErrorAlert('Error', 'Failed to refresh categories');
    } finally {
      setRefreshing(false);
    }
  };
  const validateForm = () => {
    if (!newCategoryName.trim()) {
      showWarningAlert('Error', 'Please enter a category name');
      return false;
    }

    if (newCategoryName.trim().length < 2) {
      showWarningAlert('Error', 'Category name must be at least 2 characters long');
      return false;
    }

    if (newCategoryName.trim().length > 20) {
      showWarningAlert('Error', 'Category name cannot exceed 20 characters');
      return false;
    }

    // Check for duplicate names
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === newCategoryName.trim().toLowerCase() &&
      cat.type === newCategoryType &&
      cat.id !== editingCategory?.id
    );

    if (existingCategory) {
      showWarningAlert('Error', 'A category with this name already exists for this type');
      return false;
    }

    return true;
  };
  const handleSaveCategory = async () => {
    if (!validateForm()) return;

    try {
      const categoryData = {
        name: newCategoryName.trim(),
        type: newCategoryType,
        icon: selectedIcon,
        color: selectedColor,
      };

      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, categoryData);
        showSuccessAlert('Success', 'Category updated successfully!');
      } else {
        // Add new category
        await addCategory(categoryData);
        showSuccessAlert('Success', 'Category added successfully!');
      }

      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Save category error:', error);
      showErrorAlert('Error', error.message || 'Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryType(category.type);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setShowAddCategory(true);
  };  const handleDeleteCategory = (categoryId, categoryName) => {
    showWarningAlert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(categoryId);
              loadCategories();
              showSuccessAlert('Success', 'Category deleted successfully!');
            } catch (error) {
              console.error('Delete category error:', error);
              if (error.message.includes('being used in transactions')) {
                showWarningAlert(
                  'Cannot Delete Category', 
                  'This category is currently being used in transactions. Please remove or change the category in those transactions first.'
                );
              } else {
                showErrorAlert('Error', error.message || 'Failed to delete category');
              }
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setNewCategoryName('');
    setNewCategoryType('expense');
    setSelectedIcon('wallet');
    setSelectedColor('#3b82f6');
    setShowAddCategory(false);
    setEditingCategory(null);
  };
  const getExpenseCategories = () => Array.isArray(categories) ? categories.filter(cat => cat.type === 'expense') : [];
  const getIncomeCategories = () => Array.isArray(categories) ? categories.filter(cat => cat.type === 'income') : [];const renderCategory = (category) => (
    <TouchableOpacity
      key={category.id}
      onPress={() => handleEditCategory(category)}
      style={styles.categoryItem}
      activeOpacity={0.7}
    >
      <Card style={styles.categoryCard}>
        <View style={styles.categoryContent}>
          <View style={styles.categoryInfo}>
            <View 
              style={[
                styles.categoryIcon,
                { backgroundColor: category.color + '20' }
              ]}
            >
              <Ionicons name={category.icon} size={26} color={category.color} />
            </View>
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryType}>{category.type}</Text>
            </View>
          </View>          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteCategory(category.id, category.name);
            }}
            style={styles.deleteButton}
            activeOpacity={0.6}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header with updated modern design */}
      <LinearGradient
        colors={colors.gradients.categories}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="grid" size={28} color="white" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>Categories</Text>
          </View>          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="analytics-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Manage your income and expense categories</Text>
      </LinearGradient>      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary.cyan} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.secondary.cyan]}
              tintColor={colors.secondary.cyan}
            />
          }
        >
          <View style={styles.content}>        {/* Add Category Button */}
        {!showAddCategory && (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowAddCategory(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.gradients.home}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.addButtonText}>Add New Category</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}        {/* Add/Edit Category Form */}
        {showAddCategory && (
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIconContainer}>
                <Ionicons name="create" size={24} color="white" />
              </View>
              <Text style={styles.formTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </Text>
            </View>

            <Input
              label="Category Name"
              placeholder="Enter category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={styles.inputStyle}
            />

            {/* Type Selection */}
            <Text style={styles.sectionLabel}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                onPress={() => setNewCategoryType('expense')}
                style={[
                  styles.typeButton,
                  newCategoryType === 'expense' && styles.typeButtonActive
                ]}
              >
                <Text style={[
                  styles.typeButtonText,
                  newCategoryType === 'expense' && styles.typeButtonTextActive
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setNewCategoryType('income')}
                style={[
                  styles.typeButton,
                  newCategoryType === 'income' && styles.typeButtonActiveIncome
                ]}
              >
                <Text style={[
                  styles.typeButtonText,
                  newCategoryType === 'income' && styles.typeButtonTextActive
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>            {/* Icon Selection */}
            <Text style={styles.sectionLabel}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScrollView}>
              {Array.isArray(availableIcons) && availableIcons.map((iconName) => (
                <TouchableOpacity
                  key={iconName}
                  onPress={() => setSelectedIcon(iconName)}
                  style={[
                    styles.iconButton,
                    selectedIcon === iconName && styles.iconButtonSelected
                  ]}
                >
                  <Ionicons 
                    name={iconName} 
                    size={24} 
                    color={selectedIcon === iconName ? selectedColor : '#6b7280'} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color Selection */}            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {Array.isArray(availableColors) && availableColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected
                  ]}
                />
              ))}
            </View>            {/* Preview */}
            <View style={styles.previewContainer}>
              <Text style={styles.sectionLabel}>Preview</Text>
              <View style={styles.previewItem}>
                <View 
                  style={[
                    styles.previewIcon,
                    { backgroundColor: selectedColor + '20' }
                  ]}
                >
                  <Ionicons name={selectedIcon} size={24} color={selectedColor} />
                </View>
                <View style={styles.previewText}>
                  <Text style={styles.previewName}>
                    {newCategoryName || 'Category Name'}
                  </Text>
                  <Text style={styles.previewType}>{newCategoryType}</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveCategory}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colors.gradients.balance}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Ionicons 
                    name={editingCategory ? "checkmark-circle" : "add-circle"} 
                    size={20} 
                    color="white" 
                    style={styles.saveButtonIcon} 
                  />
                  <Text style={styles.saveButtonText}>
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={resetForm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}        {/* Categories List */}
        {/* Expense Categories */}
        <View style={styles.categorySection}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIconContainer, styles.expenseIconContainer]}>
              <Ionicons name="wallet-outline" size={18} color="white" />
            </View>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
          </View>
          
          {getExpenseCategories().length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="wallet-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No expense categories yet</Text>
              </View>
            </Card>
          ) : (
            getExpenseCategories().map(renderCategory)
          )}
        </View>

        {/* Income Categories */}
        <View style={styles.categorySection}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIconContainer, styles.incomeIconContainer]}>
              <Ionicons name="trending-up-outline" size={18} color="white" />
            </View>
            <Text style={styles.sectionTitle}>Income Categories</Text>
          </View>
          
          {getIncomeCategories().length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="trending-up-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No income categories yet</Text>
              </View>
            </Card>
          ) : (
            getIncomeCategories().map(renderCategory)
          )}
        </View>        <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: colors.secondary.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16, 
    color: colors.text.secondary,
    fontSize: 16,
  },  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  addButton: {
    marginBottom: 32,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.success.main,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  formCard: {
    marginBottom: 32,
    marginHorizontal: 6,
    padding: 28,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  formIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 3,
    shadowColor: colors.secondary.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  formTitle: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  inputStyle: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#ef4444',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#10b981',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  iconScrollView: {
    marginBottom: 24,
  },
  iconButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  iconButtonSelected: {
    backgroundColor: '#ddd6fe',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
  },
  colorButtonSelected: {
    borderWidth: 3,
    borderColor: '#374151',
  },
  previewContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  previewType: {
    color: '#6b7280',
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 2,
  },  actionButtons: {
    gap: 12,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 4,
    shadowColor: colors.info.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  categorySection: {
    marginBottom: 32,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseIconContainer: {
    backgroundColor: colors.danger.main,
  },
  incomeIconContainer: {
    backgroundColor: colors.success.main,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: 16,
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: 'white',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
  },
  categoryType: {
    color: '#6b7280',
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    marginLeft: 16,
  },
  emptyCard: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default CategoriesScreen;
