import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ExpenseSummaryChart = ({ data }) => {
  // Return empty state if no data or if data is not an array
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expense data available</Text>
      </View>
    );
  }

  // Transform data for pie chart, with additional safety check
  const chartData = Array.isArray(data) ? data.map((item) => ({
    name: item?.name || 'Unknown',
    value: item?.amount || 0,
    color: item?.color || '#CCCCCC',
    legendFontColor: '#7F7F7F',
    legendFontSize: 12,
  })) : [];

  // Don't render chart if no valid data
  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expense data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PieChart
        data={chartData}
        width={screenWidth - 60}
        height={200}
        chartConfig={{
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
});

export default ExpenseSummaryChart;
