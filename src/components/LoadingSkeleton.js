import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const LoadingSkeleton = ({ width, height, borderRadius = 4, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#f3f4f6'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

const TransactionSkeleton = () => (
  <View style={styles.transactionSkeleton}>
    <View style={styles.iconSkeleton}>
      <LoadingSkeleton width={40} height={40} borderRadius={20} />
    </View>
    <View style={styles.contentSkeleton}>
      <LoadingSkeleton width="70%" height={16} style={{ marginBottom: 8 }} />
      <LoadingSkeleton width="50%" height={12} />
    </View>
    <View style={styles.amountSkeleton}>
      <LoadingSkeleton width={60} height={16} />
    </View>
  </View>
);

const CardSkeleton = ({ height = 120 }) => (
  <View style={[styles.cardSkeleton, { height }]}>
    <LoadingSkeleton width="60%" height={20} style={{ marginBottom: 12 }} />
    <LoadingSkeleton width="80%" height={16} style={{ marginBottom: 8 }} />
    <LoadingSkeleton width="40%" height={14} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e7eb',
  },
  transactionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconSkeleton: {
    marginRight: 12,
  },
  contentSkeleton: {
    flex: 1,
  },
  amountSkeleton: {
    alignItems: 'flex-end',
  },
  cardSkeleton: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export { LoadingSkeleton, TransactionSkeleton, CardSkeleton };
export default LoadingSkeleton;
