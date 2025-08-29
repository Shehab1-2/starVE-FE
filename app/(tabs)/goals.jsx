import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { goalsAPI, userManager } from '../../services/api';

const Goals = () => {
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: 'weekly_frequency',
    target_value: '',
    description: '',
    end_date: '',
  });

  const goalTypes = [
    { key: 'weekly_frequency', label: 'Weekly Frequency', unit: 'fasts per week' },
    { key: 'daily_hours', label: 'Daily Hours', unit: 'hours per day' },
    { key: 'streak_target', label: 'Streak Target', unit: 'consecutive days' },
  ];

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      let user = await userManager.getUserData();
      console.log('Goals - Retrieved user data:', user);
      
      let userId = user?.id;
      if (!userId) {
        userId = await userManager.getCurrentUserId();
      }
      
      if (userId) {
        const userGoals = await goalsAPI.getUserGoals(userId);
        setGoals(userGoals || []);
      } else {
        console.error('No user ID found in goals');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      if (!newGoal.target_value || !newGoal.description) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      let user = await userManager.getUserData();
      let userId = user?.id;
      if (!userId) {
        userId = await userManager.getCurrentUserId();
      }
      if (!userId) {
        Alert.alert('Error', 'Please log in to create goals');
        return;
      }

      const goalData = {
        ...newGoal,
        target_value: parseInt(newGoal.target_value, 10),
        end_date: newGoal.end_date || null,
      };

      await goalsAPI.createGoal(userId, goalData);
      setShowCreateModal(false);
      setNewGoal({
        goal_type: 'weekly_frequency',
        target_value: '',
        description: '',
        end_date: '',
      });
      loadGoals(); // Refresh goals list
      Alert.alert('Success', 'Goal created successfully!');
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Error', 'Failed to create goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goalId, description) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalsAPI.deleteGoal(goalId);
              loadGoals();
              Alert.alert('Success', 'Goal deleted successfully!');
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal.');
            }
          },
        },
      ]
    );
  };

  const getProgressBarWidth = (progress) => {
    return Math.min(Math.max(progress || 0, 0), 100);
  };

  const GoalCard = ({ goal }) => {
    const goalType = goalTypes.find(t => t.key === goal.goal_type);
    const progress = goal.progress_percentage || 0;

    return (
      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalDescription}>{goal.description}</Text>
          <Pressable 
            onPress={() => handleDeleteGoal(goal.id, goal.description)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </Pressable>
        </View>
        
        <Text style={styles.goalType}>
          {goal.target_value} {goalType?.unit || 'units'}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { width: `${getProgressBarWidth(progress)}%` }
            ]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        {goal.end_date && (
          <Text style={styles.endDate}>
            Ends: {new Date(goal.end_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Goals</Text>
        <Pressable onPress={() => setShowCreateModal(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading goals...</Text>
        ) : goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No goals set yet</Text>
            <Text style={styles.emptySubtext}>Create your first goal to start tracking progress</Text>
          </View>
        ) : (
          goals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Goal</Text>
            
            <Text style={styles.inputLabel}>Goal Type</Text>
            <View style={styles.typeButtons}>
              {goalTypes.map((type) => (
                <Pressable
                  key={type.key}
                  style={[
                    styles.typeButton,
                    newGoal.goal_type === type.key && styles.typeButtonActive
                  ]}
                  onPress={() => setNewGoal({ ...newGoal, goal_type: type.key })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    newGoal.goal_type === type.key && styles.typeButtonTextActive
                  ]}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Target Value</Text>
            <TextInput
              style={styles.input}
              value={newGoal.target_value}
              onChangeText={(text) => setNewGoal({ ...newGoal, target_value: text })}
              placeholder="e.g., 3"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.input}
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
              placeholder="e.g., Fast 3 times per week"
              placeholderTextColor="#8E8E93"
            />

            <Text style={styles.inputLabel}>End Date (Optional)</Text>
            <TextInput
              style={styles.input}
              value={newGoal.end_date}
              onChangeText={(text) => setNewGoal({ ...newGoal, end_date: text })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#8E8E93"
            />

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.createButton]} 
                onPress={handleCreateGoal}
              >
                <Text style={styles.createButtonText}>Create Goal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#8E8E93',
    fontSize: 15,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  goalType: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#2C2C2E',
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D09C',
    borderRadius: 3,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  endDate: {
    color: '#8E8E93',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  typeButtons: {
    marginBottom: 12,
  },
  typeButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: '#3A3A3C',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  typeButtonTextActive: {
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    fontSize: 17,
    borderWidth: 0.5,
    borderColor: '#3A3A3C',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#2C2C2E',
    borderWidth: 0.5,
    borderColor: '#3A3A3C',
  },
  createButton: {
    backgroundColor: '#00D09C',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default Goals;