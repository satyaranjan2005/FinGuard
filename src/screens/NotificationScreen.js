import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../components';
import colors from '../utils/colors';
import { 
  getNotificationHistory,
  getNotificationSettings,
  saveNotificationSettings,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  getUnreadCount,
  formatNotificationTime
} from '../services/notificationService';
import { showPermissionSettingsAlert } from '../services/permissionService';
import { addEventListener, removeEventListener, EVENTS } from '../utils/eventEmitter';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert,
  showInfoAlert,
  showConfirmationAlert
} from '../services/alertService';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    budgetAlerts: true,
    goalReminders: true,
    billReminders: true,
    weeklyReports: false,
    monthlyReports: true
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load notifications and settings
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationHistory, notificationSettings] = await Promise.all([
        getNotificationHistory(),
        getNotificationSettings()
      ]);
      
      // Format notifications with time display
      const formattedNotifications = notificationHistory.map(notification => ({
        ...notification,
        time: formatNotificationTime(notification.time)
      }));
      
      setNotifications(formattedNotifications);
      setSettings(notificationSettings);
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);
  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Listen for new notifications
  useEffect(() => {
    const subscription = addEventListener(EVENTS.NOTIFICATION_ADDED, () => {
      // Reload notifications when a new one is added
      loadData();
    });

    return () => {
      removeEventListener(subscription);
    };
  }, [loadData]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = async (notificationId) => {
    try {
      // Mark as read locally first for immediate UI update
      setNotifications(prevNotifications =>
        prevNotifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Then update in storage
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local change if storage update fails
      await loadData();
    }
  };
  const clearAllNotificationsHandler = () => {
    showConfirmationAlert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      async () => {
        try {
          await clearAllNotifications();
          setNotifications([]);
        } catch (error) {
          console.error('Error clearing notifications:', error);
          showErrorAlert('Error', 'Failed to clear notifications. Please try again.');
        }
      },
      null,
      'Clear All',
      'Cancel',
      'warning'
    );
  };

  const markAllAsReadHandler = async () => {
    try {
      // Update UI immediately
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      
      // Update in storage
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Revert if storage update fails
      await loadData();    }
  };

  const toggleSetting = async (key) => {
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      await saveNotificationSettings(newSettings);
      
      // Show alert for permission settings if user is enabling notifications
      if ((key === 'budgetAlerts' || key === 'goalReminders') && newSettings[key]) {
        const hasPermission = await import('../services/permissionService').then(service => 
          service.hasNotificationPermission()
        );
        
        if (!hasPermission) {
          showPermissionSettingsAlert();
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert setting change
      setSettings(prevSettings => ({ ...prevSettings, [key]: !newSettings[key] }));    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return colors.success.main;
      case 'warning':
        return colors.warning.main;
      case 'error':
        return colors.danger.main;
      default:
        return colors.info.main;
    }
  };

  const getNotificationBackground = (type) => {
    switch (type) {
      case 'success':
        return 'rgba(5, 150, 105, 0.1)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.1)';
      case 'error':
        return 'rgba(220, 38, 38, 0.1)';
      default:
        return 'rgba(29, 78, 216, 0.1)';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <LinearGradient
        colors={colors.gradients.balance}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.headerButton} onPress={clearAllNotificationsHandler}>
              <Ionicons name="trash-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Quick Actions */}
        {unreadCount > 0 && (
          <Card style={styles.actionsCard}>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={markAllAsReadHandler}>
                <Ionicons name="checkmark-done" size={16} color={colors.info.main} />
                <Text style={styles.actionText}>Mark All Read</Text>
              </TouchableOpacity>
            </View>
          </Card>        )}

        {/* Notifications List */}
        <View style={styles.notificationsContainer}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {!notifications || notifications.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="notifications-off-outline" size={48} color={colors.neutral[400]} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>You're all caught up!</Text>
              </View>
            </Card>
          ) : (
            Array.isArray(notifications) && notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification.id)}
                activeOpacity={0.7}
              >
                <Card style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}>
                  <View style={styles.notificationContent}>
                    <View style={[
                      styles.iconContainer,
                      { backgroundColor: getNotificationBackground(notification.type) }
                    ]}>
                      <Ionicons 
                        name={notification.icon} 
                        size={20} 
                        color={getNotificationColor(notification.type)} 
                      />
                    </View>
                    
                    <View style={styles.textContainer}>
                      <View style={styles.titleRow}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        {!notification.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Budget Alerts</Text>
                <Text style={styles.settingDescription}>Get notified when you exceed budgets</Text>
              </View>              <Switch
                value={settings.budgetAlerts}
                onValueChange={() => toggleSetting('budgetAlerts')}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor={settings.budgetAlerts ? '#ffffff' : '#f4f4f5'}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Goal Reminders</Text>
                <Text style={styles.settingDescription}>Reminders for savings goals and milestones</Text>
              </View>              <Switch
                value={settings.goalReminders}
                onValueChange={() => toggleSetting('goalReminders')}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor={settings.goalReminders ? '#ffffff' : '#f4f4f5'}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Bill Reminders</Text>
                <Text style={styles.settingDescription}>Notifications for upcoming bill payments</Text>
              </View>              <Switch
                value={settings.billReminders}
                onValueChange={() => toggleSetting('billReminders')}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor={settings.billReminders ? '#ffffff' : '#f4f4f5'}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Weekly Reports</Text>
                <Text style={styles.settingDescription}>Weekly spending summary reports</Text>
              </View>              <Switch
                value={settings.weeklyReports}
                onValueChange={() => toggleSetting('weeklyReports')}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor={settings.weeklyReports ? '#ffffff' : '#f4f4f5'}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Monthly Reports</Text>
                <Text style={styles.settingDescription}>Monthly financial overview and insights</Text>
              </View>              <Switch
                value={settings.monthlyReports}
                onValueChange={() => toggleSetting('monthlyReports')}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor={settings.monthlyReports ? '#ffffff' : '#f4f4f5'}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },  badgeContainer: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 25,
  },  actionText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
  },notificationsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  settingsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },  emptyCard: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },  notificationCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadCard: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    marginLeft: 10,
  },
  notificationMessage: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },  settingsCard: {
    padding: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingInfo: {
    flex: 1,
    marginRight: 20,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 20,
  },  settingDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
  },
});

export default NotificationScreen;
