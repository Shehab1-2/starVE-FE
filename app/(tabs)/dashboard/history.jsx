import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Mock data for fast history
const MOCK_HISTORY = [
  {
    id: 1,
    date: '2024-01-15',
    duration: '16:00:00',
    type: '16:8 Fast',
    completed: true,
    maxKetosis: 'Deep Ketosis',
  },
  {
    id: 2,
    date: '2024-01-14',
    duration: '18:30:00',
    type: '18:6 Fast',
    completed: true,
    maxKetosis: 'Autophagy',
  },
  // Add more mock data as needed
];

export default function History() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const FastingRecord = ({ record }) => (
    <Pressable style={styles.fastRecord}>
      <View style={styles.fastHeader}>
        <View>
          <Text style={styles.fastDate}>{record.date}</Text>
          <Text style={styles.fastType}>{record.type}</Text>
        </View>
        <View style={[styles.badge, record.completed ? styles.badgeSuccess : styles.badgeFailed]}>
          <Text style={styles.badgeText}>
            {record.completed ? 'Completed' : 'Incomplete'}
          </Text>
        </View>
      </View>
      <View style={styles.fastDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#9CA3AF" />
          <Text style={styles.detailText}>{record.duration}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="fire" size={20} color="#9CA3AF" />
          <Text style={styles.detailText}>{record.maxKetosis}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fasting History</Text>
      </View>

      <View style={styles.periodSelector}>
        <Pressable
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>Week</Text>
        </Pressable>
        <Pressable
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>Month</Text>
        </Pressable>
        <Pressable
          style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('all')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'all' && styles.periodButtonTextActive]}>All Time</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>24</Text>
          <Text style={styles.summaryLabel}>Total Fasts</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>85%</Text>
          <Text style={styles.summaryLabel}>Completion</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>16.5h</Text>
          <Text style={styles.summaryLabel}>Average</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {MOCK_HISTORY.map((record) => (
          <FastingRecord key={record.id} record={record} />
        ))}
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
  periodSelector: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1F2937',
  },
  periodButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  summary: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  fastRecord: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  fastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fastDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  fastType: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#059669',
  },
  badgeFailed: {
    backgroundColor: '#DC2626',
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fastDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#9CA3AF',
    marginLeft: 4,
  },
});