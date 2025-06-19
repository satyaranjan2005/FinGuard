import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  textColor = '#1f2937',
  style 
}) => {
  const logoSizes = {
    small: 32,
    medium: 64,
    large: 96,
    xlarge: 128
  };

  const textSizes = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 40
  };

  const logoSize = logoSizes[size];
  const textSize = textSizes[size];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={[styles.logo, { width: logoSize, height: logoSize }]}
          resizeMode="contain"
        />
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: textSize, color: textColor }]}>
            FinGuard
          </Text>
          <Text style={[styles.subtitle, { color: textColor + '80' }]}>
            Your Financial Guardian
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    borderRadius: 16,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Logo;
