import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const SettingItem = ({ icon, title, description, value, onValueChange, type = "switch" }) => (
    <View style={styles.settingItem}>
      <MaterialCommunityIcons name={icon} size={24} color="#9CA3AF" />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#4B5563', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        />
      ) : (
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <SettingItem
            icon="bell-outline"
            title="Notifications"
            description="Get updates about your fasting progress"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem
            icon="theme-light-dark"
            title="Dark Mode"
            description="Use dark theme"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingItem
            icon="volume-high"
            title="Sound Effects"
            description="Play sounds for actions"
            value={soundEffects}
            onValueChange={setSoundEffects}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable>
            <SettingItem
              icon="account-edit"
              title="Edit Profile"
              description="Update your personal information"
              type="chevron"
            />
          </Pressable>
          <Pressable>
            <SettingItem
              icon="shield-check"
              title="Privacy"
              description="Manage your privacy settings"
              type="chevron"
            />
          </Pressable>
          <Pressable>
            <SettingItem
              icon="lock"
              title="Change Password"
              description="Update your security settings"
              type="chevron"
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <Pressable>
            <SettingItem
              icon="help-circle"
              title="Help Center"
              description="Get help with the app"
              type="chevron"
            />
          </Pressable>
          <Pressable>
            <SettingItem
              icon="information"
              title="About"
              description="Learn more about FastTracker"
              type="chevron"
            />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
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
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  logoutButton: {
    margin: 20,
    padding: 16,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});