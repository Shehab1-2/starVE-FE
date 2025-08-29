import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI, userManager } from '../../services/api';

const Settings = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        let user = await userManager.getUserData();
        console.log('Settings - Retrieved user data:', user);
        
        let userId = user?.id;
        if (!userId) {
          userId = await userManager.getCurrentUserId();
        }
        
        if (userId) {
          // Load full profile
          const profile = await authAPI.getUserProfile(userId);
          setUserData(profile);
          setWeight(profile.weight?.toString() || '');
          setHeight(profile.height?.toString() || '');
          setGoal(profile.goal || '');
        } else {
          console.error('No user ID found in settings');
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (error.message.includes('User not found') || error.message.includes('404')) {
          router.replace('/(auth)/login');
        }
      }
    };

    loadUserData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      let userId = userData?.id;
      if (!userId) {
        userId = await userManager.getCurrentUserId();
      }
      if (!userId) return;

      await authAPI.updateUserInfo(userId, {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        goal: goal,
      });

      setShowProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await userManager.clearSession();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ title, onPress, showArrow = true, destructive = false }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <Text style={[styles.settingText, destructive && styles.destructiveText]}>
        {title}
      </Text>
      {showArrow && <Text style={styles.arrow}>›</Text>}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.sectionCard}>
            <SettingItem 
              title={`${userData?.username || 'User'} (${userData?.email || ''})`}
              showArrow={false}
            />
            <View style={styles.divider} />
            <SettingItem 
              title="Update Weight & Goals" 
              onPress={() => setShowProfileModal(true)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <SettingItem title="Notifications" />
            <View style={styles.divider} />
            <SettingItem title="Default Fast Duration" />
            <View style={styles.divider} />
            <SettingItem title="Units" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionCard}>
            <SettingItem title="Help & FAQ" />
            <View style={styles.divider} />
            <SettingItem title="Contact Support" />
            <View style={styles.divider} />
            <SettingItem title="Privacy Policy" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionCard}>
            <SettingItem 
              title="Logout" 
              onPress={handleLogout} 
              showArrow={false} 
              destructive={true} 
            />
          </View>
        </View>
      </ScrollView>

      {/* Profile Update Modal */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter height"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Goal</Text>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              placeholder="e.g., Lose weight, Improve health"
              placeholderTextColor="#8E8E93"
              multiline
            />

            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowProfileModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Save</Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '400',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  arrow: {
    color: '#8E8E93',
    fontSize: 18,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#3A3A3C',
    marginLeft: 16,
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
  saveButton: {
    backgroundColor: '#00D09C',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default Settings;