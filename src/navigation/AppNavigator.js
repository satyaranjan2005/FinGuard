import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionHistoryScreen from '../screens/TransactionHistory';
import BudgetScreen from '../screens/BudgetScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import NotificationScreen from '../screens/NotificationScreen';
import GoalsScreen from '../screens/GoalsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
          headerStyle: {
            backgroundColor: '#4f46e5',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
        tabBarIcon: ({ focused, color, size }) => {
          if (!route || typeof route !== 'object') return null;
          if (!route.name || typeof route.name !== 'string') return null;
          
          let iconName = 'circle';
          
          try {
            switch (route.name) {
              case 'Dashboard':
                iconName = focused ? 'analytics' : 'analytics-outline';
                break;
              case 'Transactions':
                iconName = focused ? 'list' : 'list-outline';
                break;
              case 'Add':
                iconName = focused ? 'add-circle' : 'add-circle-outline';
                size = 32;
                break;
              case 'Budget':
                iconName = focused ? 'flag' : 'flag-outline';
                break;
              case 'Categories':
                iconName = focused ? 'grid' : 'grid-outline';
                break;
            }

            if (!iconName) iconName = 'circle';

            try {
              if (route.name === 'Add') {
                return (
                  <View style={styles.addIconContainer}>
                    <LinearGradient
                      colors={['#4338ca', '#6366f1']}
                      style={styles.addIconGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={iconName} size={size || 32} color="white" />
                    </LinearGradient>
                  </View>
                );
              }

              return (
                <View style={focused ? styles.focusedIconContainer : styles.iconContainer}>
                  <Ionicons name={iconName} size={size || 24} color={color || '#94a3b8'} />
                </View>
              );
            } catch (err) {
              console.error('Error rendering tab icon:', err);
              return (
                <View style={styles.iconContainer}>
                  <Ionicons name="alert-circle" size={24} color="#ef4444" />
                </View>
              );
            }
          } catch (error) {
            console.warn('Error rendering tab icon:', error);
            return null;
          }
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 65,
          paddingBottom: 10,
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
  return (
    <NavigationContainer>
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
          name="Goals" 
          component={GoalsScreen}
        />
        <Stack.Screen 
          name="Analytics" 
          component={AnalyticsScreen}
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
