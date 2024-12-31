import { Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#111827',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          color: '#fff',
        },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </Pressable>
        ),
        // Enable gesture navigation
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
        }} 
      />
      <Stack.Screen 
        name="history" 
        options={{ 
          title: 'History',
        }} 
      />
      <Stack.Screen 
        name="statistics" 
        options={{ 
          title: 'Statistics',
        }} 
      />
    </Stack>
  );
}