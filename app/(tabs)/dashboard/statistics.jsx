import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// Mock data for charts
const weeklyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{
    data: [16, 18, 16, 20, 16, 18, 23],
  }],
};

const monthlyCompletion = {
  labels: ['Completed', 'Missed'],
  data: [85, 15],
};

export default function Statistics() {
  const [timeRange, setTimeRange] = useState('week');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#3B82F6" />
            <Text style={styles.summaryValue}>17.5h</Text>
            <Text style={styles.summaryLabel}>Average Duration</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="fire" size={24} color="#F59E0B" />
            <Text style={styles.summaryValue}>85%</Text>
            <Text style={styles.summaryLabel}>Success Rate</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.summaryValue}>24</Text>
            <Text style={styles.summaryLabel}>Total Fasts</Text>
          </View>
        </View>

        {/* Weekly Duration Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Fasting Duration Trend</Text>
          <LineChart
            data={weeklyData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1F2937',
              backgroundGradientFrom: '#1F2937',
              backgroundGradientTo: '#1F2937',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#3B82F6',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Achievement Section */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <MaterialCommunityIcons name="star" size={24} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.achievementTitle}>First 24-Hour Fast</Text>
                <Text style={styles.achievementDesc}>Completed your first extended fast</Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <MaterialCommunityIcons name="medal" size={24} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.achievementTitle}>5-Day Streak</Text>
                <Text style={styles.achievementDesc}>Maintained consistent fasting schedule</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Goals Progress */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Goals Progress</Text>
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Weekly Fast Goal</Text>
              <Text style={styles.goalProgress}>5/7</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '71%' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  achievementsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  achievementsList: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  goalsContainer: {
    marginBottom: 24,
  },
  goalItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  goalProgress: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
});