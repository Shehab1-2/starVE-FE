import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { fastingAPI, userManager } from '../../services/api';

const History = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const user = await userManager.getUserData();
        if (user?.id) {
          const userSessions = await fastingAPI.getUserSessions(user.id);
          setSessions(userSessions || []);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Fasting History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading history...</Text>
        ) : sessions.length === 0 ? (
          <Text style={styles.emptyText}>No fasting sessions yet. Start your first fast!</Text>
        ) : (
          sessions.map((session, index) => (
            <View key={session.id || index} style={styles.historyItem}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemDate}>{formatDate(session.start_time)}</Text>
                <Text style={[
                  styles.itemStatus, 
                  session.is_completed ? styles.completed : styles.stopped
                ]}>
                  {session.is_completed ? 'Completed' : 'Stopped Early'}
                </Text>
              </View>
              <Text style={styles.itemType}>{session.fasting_type || 'Custom Fast'}</Text>
              <Text style={styles.itemDuration}>
                Duration: {formatDuration(session.actual_duration_seconds || session.target_duration_hours * 3600)}
              </Text>
              {session.target_duration_hours && (
                <Text style={styles.itemTarget}>
                  Target: {session.target_duration_hours}h
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3A3A3C',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  historyItem: {
    backgroundColor: '#1C1C1E',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: '#3A3A3C',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completed: {
    color: '#34C759',
    backgroundColor: '#34C75920',
  },
  stopped: {
    color: '#FF9500',
    backgroundColor: '#FF950020',
  },
  itemType: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 4,
  },
  itemDuration: {
    color: '#8E8E93',
    fontSize: 15,
  },
  itemTarget: {
    color: '#8E8E93',
    fontSize: 15,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default History;