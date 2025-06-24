import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { Button } from '../components';
import {
  showCustomAlert,
  showSuccessAlert,
  showInfoAlert,
  showWarningAlert,
  showErrorAlert,
  showDestructiveAlert,
  showConfirmationAlert
} from '../services/alertService';
import colors from '../utils/colors';

/**
 * Test screen for the CustomAlert component
 * This screen provides buttons to trigger all different types of alerts
 */
const AlertTestScreen = () => {
  const handleShowInfoAlert = () => {
    showInfoAlert(
      'Account Information',
      'Your account has been updated with the latest information.',
      [{ text: 'OK', style: 'primary' }]
    );
  };

  const handleShowSuccessAlert = () => {
    showSuccessAlert(
      'Transaction Successful',
      'Your payment of $250.00 was processed successfully.',
      [{ text: 'Great!', style: 'primary' }]
    );
  };

  const handleShowWarningAlert = () => {
    showWarningAlert(
      'Low Balance',
      'Your account balance is below $100. Consider adding funds soon.',
      [{ text: 'Later', style: 'cancel' }, { text: 'Add Funds', style: 'primary' }]
    );
  };

  const handleShowErrorAlert = () => {
    showErrorAlert(
      'Connection Error',
      'Unable to connect to the server. Please check your internet connection.',
      [{ text: 'Try Again', style: 'primary' }]
    );
  };

  const handleShowDestructiveAlert = () => {
    showCustomAlert({
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction? This action cannot be undone.',
      type: 'destructive',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete pressed') }
      ]
    });
  };

  const handleShowConfirmationAlert = () => {
    showCustomAlert({
      title: 'Confirm Budget Update',
      message: 'Are you sure you want to update your monthly budget to $1,500?',
      type: 'confirmation',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'primary', onPress: () => console.log('Confirmed') }
      ]
    });
  };

  const handleShowMultiButton = () => {
    showCustomAlert({
      title: 'Choose an Option',
      message: 'Select one of the following actions for this transaction:',
      type: 'info',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', style: 'default', onPress: () => console.log('Edit pressed') },
        { text: 'View Details', style: 'primary', onPress: () => console.log('View pressed') }
      ]
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>FinGuard Alert Test Screen</Text>
      <Text style={styles.subHeading}>Tap a button to test different alert types</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Show Info Alert" 
          onPress={handleShowInfoAlert}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        
        <Button 
          title="Show Success Alert" 
          onPress={handleShowSuccessAlert}
          style={[styles.button, styles.successButton]}
          textStyle={styles.buttonText}
        />
        
        <Button 
          title="Show Warning Alert" 
          onPress={handleShowWarningAlert}
          style={[styles.button, styles.warningButton]}
          textStyle={styles.buttonText}
        />
        
        <Button 
          title="Show Error Alert" 
          onPress={handleShowErrorAlert}
          style={[styles.button, styles.errorButton]}
          textStyle={styles.buttonText}
        />
        
        <Button 
          title="Show Destructive Alert" 
          onPress={handleShowDestructiveAlert}
          style={[styles.button, styles.destructiveButton]}
          textStyle={styles.buttonText}
        />
        
        <Button 
          title="Show Confirmation Alert" 
          onPress={handleShowConfirmationAlert}
          style={[styles.button, styles.confirmationButton]}
          textStyle={styles.buttonText}
        />
        
        <Button 
          title="Show Multi-Button Alert" 
          onPress={handleShowMultiButton}
          style={[styles.button, styles.multiButton]}
          textStyle={styles.buttonText}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral[50],
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    color: colors.neutral[600],
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    marginVertical: 8,
    width: '90%',
    borderRadius: 12,
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: colors.success.main,
  },
  warningButton: {
    backgroundColor: colors.warning.main,
  },
  errorButton: {
    backgroundColor: colors.danger.main,
  },
  destructiveButton: {
    backgroundColor: colors.danger.main,
  },
  confirmationButton: {
    backgroundColor: colors.primary.main,
  },
  multiButton: {
    backgroundColor: colors.secondary.cyan,
  }
});

export default AlertTestScreen;
