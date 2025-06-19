import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

const Input = ({ 
  label,
  placeholder,
  value,
  onChangeText,
  error,
  type = 'text',
  style,
  ...props 
}) => {
  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      case 'decimal':
        return 'decimal-pad';
      default:
        return 'default';
    }
  };

  const getInputStyle = () => {
    let inputStyle = [styles.input];
    
    if (error) {
      inputStyle.push(styles.inputError);
    }
    
    if (style) {
      inputStyle.push(style);
    }
    
    return inputStyle;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={getInputStyle()}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={getKeyboardType()}
        secureTextEntry={type === 'password'}
        autoCapitalize={type === 'email' ? 'none' : 'sentences'}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
