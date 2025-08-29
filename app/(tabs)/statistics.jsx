import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { fastingAPI, userManager } from '../../services/api';

const Statistics = () => {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [streaks, setStreaks] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        let user = await userManager.getUserData();
        console.log('Statistics - Retrieved user data:', user);
        
        // Try fallback method if no user data
        let userId = user?.id;
        if (!userId) {
          console.log('No user ID, trying fallback method...');
          userId = await userManager.getCurrentUserId();
        }
        
        if (!userId) {
          console.error('No user ID found, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }

        const [statsData, streaksData, analyticsData] = await Promise.all([
          fastingAPI.getStats(userId).catch(() => null),
          fastingAPI.getStreaks(userId).catch(() => null),
          fastingAPI.getAnalytics(userId, 'week').catch(() => null),
        ]);

        setStats(statsData);
        setStreaks(streaksData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error loading statistics:', err);
        if (err.message.includes('User not found') || err.message.includes('404') || err.message.includes('401')) {
          console.log('Authentication error, redirecting to login');
          router.replace('/(auth)/login');
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const formatHours = (hours) => {
    if (!hours) return '0';
    return hours.toFixed(1);
  };

  const formatPercentage = (rate) => {
    if (!rate) return '0%';
    return `${Math.round(rate * 100)}%`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load statistics</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Statistics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.total_fasts || 0}</Text>
            <Text style={styles.statLabel}>Total Fasts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatPercentage(stats?.completion_rate)}</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatHours(stats?.average_duration)}h</Text>
            <Text style={styles.statLabel}>Average Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats?.this_week_fasts || 0}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>

        {/* Streak Information */}
        {streaks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streak Information</Text>
            <View style={styles.streakCard}>
              <View style={styles.streakItem}>
                <Text style={styles.streakNumber}>{streaks.current_streak || 0}</Text>
                <Text style={styles.streakLabel}>Current Streak</Text>
              </View>
              <View style={styles.streakItem}>
                <Text style={styles.streakNumber}>{streaks.longest_streak || 0}</Text>
                <Text style={styles.streakLabel}>Best Streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* Weekly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.weeklyCard}>
            <Text style={styles.weeklyText}>
              Total fasting hours: {formatHours(stats?.total_hours)}h
            </Text>
            <Text style={styles.weeklyText}>
              This week: {stats?.this_week_fasts || 0} fasts
            </Text>
            <Text style={styles.weeklyText}>
              This month: {stats?.this_month_fasts || 0} fasts
            </Text>
            {stats?.most_common_type && (
              <Text style={styles.weeklyText}>
                Favorite: {stats.most_common_type}
              </Text>
            )}
          </View>
        </View>

        {/* Personal Best */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Best</Text>
          <View style={styles.bestCard}>
            <Text style={styles.bestText}>
              Longest Fast: {formatHours(stats?.longest_fast)} hours
            </Text>
            {streaks?.last_fast_date && (
              <Text style={styles.bestDate}>
                Last fast: {new Date(streaks.last_fast_date).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Analytics Preview */}
        {analytics && analytics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.analyticsCard}>
              {analytics.slice(0, 3).map((day, index) => (
                <View key={index} style={styles.analyticsItem}>
                  <Text style={styles.analyticsDate}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.analyticsValue}>
                    {day.total_hours ? `${formatHours(day.total_hours)}h` : 'Rest day'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  weeklyCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weeklyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  bestCard: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bestText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  bestDate: {
    color: '#8E8E93',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  streakNumber: {
    color: '#00D09C',
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  streakLabel: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
  },
  analyticsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analyticsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  analyticsDate: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  analyticsValue: {
    color: '#00D09C',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Statistics;