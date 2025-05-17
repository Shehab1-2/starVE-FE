import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

//import { API_URL } from '@env'; 


export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const username = params.username; // Get username from route parameters
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Retrieved username:", username); // Debugging log

  useEffect(() => {
    async function fetchUserInfo() {
      if (!username) {
        setError('No username provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/auth/users/by-username/{username}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found.');
          } else {
            setError(`Failed to fetch user info (Status: ${response.status})`);
          }
          return;
        }

        const data = await response.json();
        setUserInfo(data);
      } catch (error) {
        setError(`Error fetching user info: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, [username]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Text style={{ color: '#FF6B6B', fontSize: 16 }}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileHeader}>
          <MaterialCommunityIcons name="account" size={60} color="#E5E7EB" />
          <Text style={styles.name}>{userInfo.username}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  name: { fontSize: 24, fontWeight: '600', color: '#FFFFFF' },
  email: { fontSize: 16, color: '#9CA3AF', marginBottom: 16 },
});
