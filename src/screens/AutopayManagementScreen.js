import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Card } from '../components';
import { getAutopayTransactions, disableAutopay, fetchCategories } from '../services/dataService';
import { addEventListener, removeEventListener, EVENTS } from '../utils/eventEmitter';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showConfirmationAlert 
} from '../services/alertService';

const AutopayManagementScreen = ({ navigation }) => {
  const [autopays, setAutopays] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadAutopayData();
      
      // Listen for autopay disabled events
      const autopayDisabledSubscription = addEventListener(EVENTS.AUTOPAY_DISABLED, () => {
        console.log('AutopayManagementScreen: Autopay disabled event received, refreshing data');
        loadAutopayData();
      });
      
      return () => {
        removeEventListener(autopayDisabledSubscription);
      };
    }, [])
  );

  const loadAutopayData = async () => {
    try {
      setLoading(true);
      console.log('Loading autopay data...');
      
      const [autopayData, categoriesData] = await Promise.all([
        getAutopayTransactions(),
        fetchCategories()
      ]);
      
      console.log('Loaded autopay data:', autopayData);
      console.log('Loaded categories data:', categoriesData);
      
      setAutopays(autopayData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading autopay data:', error);
      showErrorAlert('Error', 'Failed to load autopay data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAutopayData();
    setRefreshing(false);
  };

  const handleDisableAutopay = (autopay) => {
    console.log('Attempting to disable autopay:', autopay);
    
    showConfirmationAlert(
      'Disable Autopay',
      `Are you sure you want to disable the ${autopay.autopayFrequency} autopay for ${getCategoryName(autopay.categoryId)}?\n\nThis will stop all future automatic transactions.`,
      async () => {
        try {
          console.log('User confirmed disable for autopay ID:', autopay.id);
          const result = await disableAutopay(autopay.id);
          console.log('Disable result:', result);
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showSuccessAlert('Success', 'Autopay disabled successfully');
          
          // Refresh the list immediately
          await loadAutopayData();
        } catch (error) {
          console.error('Error in handleDisableAutopay:', error);
          showErrorAlert('Error', error.message || 'Failed to disable autopay');
        }
      },
      null, // onCancel
      'Disable', // confirmText
      'Cancel', // cancelText
      'error' // type for destructive style
    );
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.icon : 'help-circle';
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#6b7280';
  };

  const formatFrequency = (frequency) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const formatNextExecution = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (autopay) => {
    if (!autopay.isActive) return '#ef4444';
    
    const nextDate = new Date(autopay.nextExecutionDate);
    const today = new Date();
    const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return '#f59e0b'; // Due soon (orange)
    if (daysDiff <= 7) return '#3b82f6'; // Due this week (blue)
    return '#10b981'; // Active (green)
  };

  const getStatusText = (autopay) => {
    if (!autopay.isActive) return 'Disabled';
    
    const nextDate = new Date(autopay.nextExecutionDate);
    const today = new Date();
    const daysDiff = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due Today';
    if (daysDiff === 1) return 'Due Tomorrow';
    if (daysDiff <= 7) return `Due in ${daysDiff} days`;
    return 'Active';
  };

  const activeAutopays = autopays.filter(ap => ap.isActive);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <LinearGradient
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
            <Text style={styles.headerTitle}>Autopay Management</Text>
            <Text style={styles.headerSubtitle}>
              {activeAutopays.length} active autopay{activeAutopays.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading autopay data...</Text>
          </View>
        ) : autopays.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Autopay Set Up</Text>
            <Text style={styles.emptyText}>
              Create recurring transactions to automate your finances
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddTransaction')}
            >
              <Text style={styles.emptyButtonText}>Create Autopay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Active Autopays */}
            {activeAutopays.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Autopays</Text>
                {activeAutopays.map((autopay) => (
                  <Card key={autopay.id} style={styles.autopayCard} elevation="medium">
                    <View style={styles.autopayHeader}>
                      <View style={styles.autopayInfo}>
                        <View style={[
                          styles.categoryIcon,
                          { backgroundColor: getCategoryColor(autopay.categoryId) + '20' }
                        ]}>
                          <Ionicons 
                            name={getCategoryIcon(autopay.categoryId)} 
                            size={20} 
                            color={getCategoryColor(autopay.categoryId)} 
                          />
                        </View>
                        <View style={styles.autopayDetails}>
                          <Text style={styles.autopayAmount}>
                            {autopay.type === 'expense' ? '-' : '+'}₹{autopay.amount}
                          </Text>
                          <Text style={styles.autopayCategory}>
                            {getCategoryName(autopay.categoryId)}
                          </Text>
                        </View>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(autopay) + '20' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(autopay) }
                        ]}>
                          {getStatusText(autopay)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.autopayMeta}>
                      <View style={styles.metaRow}>
                        <Ionicons name="refresh" size={16} color="#6b7280" />
                        <Text style={styles.metaText}>
                          {formatFrequency(autopay.autopayFrequency)}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="calendar" size={16} color="#6b7280" />
                        <Text style={styles.metaText}>
                          Next: {formatNextExecution(autopay.nextExecutionDate)}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#6b7280" />
                        <Text style={styles.metaText}>
                          Executed: {autopay.executionCount} time{autopay.executionCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>

                    {autopay.notes && (
                      <Text style={styles.autopayNotes}>{autopay.notes}</Text>
                    )}

                    <View style={styles.autopayActions}>
                      <TouchableOpacity 
                        style={styles.disableButton}
                        onPress={() => handleDisableAutopay(autopay)}
                      >
                        <Ionicons name="stop-circle" size={18} color="#ef4444" />
                        <Text style={styles.disableButtonText}>Disable</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        )}
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
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#4338ca',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    marginLeft: 4,
  },
  autopayCard: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  inactiveCard: {
    opacity: 0.6,
  },
  autopayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  autopayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  autopayDetails: {
    flex: 1,
  },
  autopayAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  autopayCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  autopayMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  autopayNotes: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  autopayActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  disableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  disableButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  inactiveText: {
    color: '#9ca3af',
  },
});

export default AutopayManagementScreen;
