import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackScreenView, EVENTS } from '../services/analyticsService';

import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionHistoryScreen from '../screens/TransactionHistory';
import BudgetScreen from '../screens/BudgetScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import NotificationScreen from '../screens/NotificationScreen';
import GoalsScreen from '../screens/GoalsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AutopayManagementScreen from '../screens/AutopayManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'circle';
          
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Add':
              iconName = 'add';
              return (
                <View style={styles.addIconContainer}>
                  <LinearGradient
                    colors={['#4338ca', '#6366f1']}
                    style={styles.addIconGradient}
                  >
                    <Ionicons name={iconName} size={28} color="white" />
                  </LinearGradient>
                </View>
              );
            case 'Budget':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Categories':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,          height: 65 + Math.max(insets.bottom, 20),
          paddingBottom: Math.max(insets.bottom, 10) + 10,
          paddingTop: 10,
          position: 'absolute',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionHistoryScreen} 
        options={{ tabBarLabel: 'History' }} 
      />
      <Tab.Screen 
        name="Add" 
        component={AddTransactionScreen}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator({ user, onLogout }) {
  const navigationRef = React.useRef();

  // Track screen navigation
  const onNavigationStateChange = (state) => {
    if (!state) return;
    
    const getCurrentRouteName = (navigationState) => {
      if (!navigationState.routes || navigationState.routes.length === 0) {
        return null;
      }
      
      const route = navigationState.routes[navigationState.index];
      
      if (route.state) {
        return getCurrentRouteName(route.state);
      }
      
      return route.name;
    };
    
    const currentScreen = getCurrentRouteName(state);
    if (currentScreen) {
      trackScreenView(currentScreen.toLowerCase(), { 
        user_authenticated: !!user,
        timestamp: new Date().toISOString() 
      });
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={onNavigationStateChange}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          initialParams={{ user, onLogout }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationScreen}
        />
        <Stack.Screen 
          name="TransactionHistory" 
          component={TransactionHistoryScreen}
        />
        <Stack.Screen 
          name="AddTransaction" 
          component={AddTransactionScreen}
        />
        <Stack.Screen 
          name="Goals" 
          component={GoalsScreen}
        />
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
        />
        <Stack.Screen 
          name="AutopayManagement" 
          component={AutopayManagementScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  focusedIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  addIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 54,
    height: 54,
    marginBottom: 30,
    borderRadius: 27,
    backgroundColor: 'white',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    padding: 4,
  },
  addIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
