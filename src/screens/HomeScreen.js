import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Input } from '../components';

const HomeScreen = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAddExpense = () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }    Alert.alert('Success', `Added expense: ₹${amount} for ${description}`);
    setAmount('');
    setDescription('');
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Ionicons name="shield-checkmark" size={32} color="white" style={styles.headerIcon} />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Welcome to FinGuard</Text>
              <Text style={styles.headerSubtitle}>Your financial health at a glance</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Balance Card */}
          <Card style={styles.balanceCard}>            <LinearGradient
              colors={['#1d4ed8', '#1e40af']}
              style={styles.balanceGradient}
            >              <Ionicons name="wallet" size={28} color="white" style={styles.balanceIcon} />
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>₹2,350.75</Text>
            </LinearGradient>
          </Card>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <View style={styles.statContent}>                <Ionicons name="trending-down" size={20} color="#EF4444" />
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>₹1,234</Text>
                <Text style={styles.statChange}>↓ 12% from last month</Text>
              </View>
            </Card>
            
            <Card style={styles.statCard}>
              <View style={styles.statContent}>                <Ionicons name="pie-chart" size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Budget Left</Text>
                <Text style={styles.statValue}>₹856</Text>
                <Text style={styles.statChangeWarning}>68% remaining</Text>
              </View>
            </Card>
          </View>

          {/* Add Expense Form */}
          <Card style={styles.formCard}>
            <View style={styles.formHeader}>
              <Ionicons name="add-circle" size={24} color="#6366F1" />
              <Text style={styles.formTitle}>Add New Expense</Text>
            </View>
            
            <Input
              label="Amount"
              placeholder="Enter amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            
            <Input
              label="Description"
              placeholder="What did you spend on?"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
            
            <Button
              title="Add Expense"
              onPress={handleAddExpense}
              style={styles.addButton}
            />
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="View All Transactions"
              onPress={() => Alert.alert('Feature', 'Coming soon!')}
              style={[styles.actionButton, styles.secondaryButton]}
            />
            
            <Button
              title="Set Budget Goals"
              onPress={() => Alert.alert('Feature', 'Coming soon!')}
              style={[styles.actionButton, styles.successButton]}
            />
            
            <Button
              title="Generate Report"
              onPress={() => Alert.alert('Feature', 'Coming soon!')}
              style={[styles.actionButton, styles.primaryButton]}
            />
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 32,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  balanceCard: {
    padding: 0,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  balanceIcon: {
    marginBottom: 12,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statChange: {
    color: '#10b981',
    fontSize: 12,
  },
  statChangeWarning: {
    color: '#f59e0b',
    fontSize: 12,
  },
  formCard: {
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    color: '#1f2937',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  successButton: {
    backgroundColor: '#10b981',
  },
});

export default HomeScreen;
