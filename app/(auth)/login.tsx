import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, userManager } from '../../services/api';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const loginResponse = await authAPI.login({
        email: email,
        password: password,
      });

      // Store user session data
      await userManager.storeUserSession(loginResponse);
      
      // Debug: Log what we stored (convert to string to see full object)
      console.log('Login response:', JSON.stringify(loginResponse, null, 2));
      let storedUser = await userManager.getUserData();
      console.log('Stored user data:', JSON.stringify(storedUser, null, 2));
      
      // If no user data was stored, fetch user profile using a different method
      if (!storedUser || !storedUser.id) {
        console.log('No user data stored, attempting alternative approaches...');
        try {
          // Method 1: Check if login response has user info at root level
          if (loginResponse.id || loginResponse.user_id) {
            const userData = {
              id: loginResponse.id || loginResponse.user_id,
              email: loginResponse.email || email,
              username: loginResponse.username,
              ...loginResponse
            };
            await AsyncStorage.setItem('user_data', JSON.stringify(userData));
            storedUser = userData;
            console.log('Created user data from login response:', userData);
          } 
          // Method 2: For JWT-only responses, decode token and fetch user profile by username
          else if (loginResponse.access_token) {
            console.log('JWT-only response, trying to fetch user by email...');
            // Decode JWT to get email (inline decoding to avoid circular import)
            const decodeJWT = (token: string) => {
              try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                  return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload);
              } catch (error) {
                console.error('Error decoding JWT:', error);
                return null;
              }
            };
            const jwtPayload = decodeJWT(loginResponse.access_token);
            if (jwtPayload && jwtPayload.sub) {
              const userEmail = jwtPayload.sub;
              const username = userEmail.split('@')[0];
              console.log('Decoded email from JWT:', userEmail, 'username:', username);
              
              try {
                console.log('Trying to fetch user by username:', username);
                const userProfile = await authAPI.getUserByUsername(username);
                await AsyncStorage.setItem('user_data', JSON.stringify(userProfile));
                storedUser = userProfile;
                console.log('Fetched user profile by username:', userProfile);
              } catch (usernameError) {
                console.log('Failed to get user by username, error:', usernameError);
                console.log('Trying to fetch user by email:', userEmail);
                try {
                  const userProfile = await authAPI.getUserByUsername(userEmail);
                  await AsyncStorage.setItem('user_data', JSON.stringify(userProfile));
                  storedUser = userProfile;
                  console.log('Fetched user profile by email:', userProfile);
                } catch (emailError) {
                  console.log('Failed to get user by email, error:', emailError);
                  console.log('User profile not found - this might be a new user or the user endpoints use different identifiers');
                  
                  // For now, create a temporary user object and let the backend handle the validation error
                  const tempUserData = {
                    id: userEmail, // Use email as temp ID - backend will reject this and we'll see the error
                    email: userEmail,
                    username: username,
                    fromJWT: true,
                    needsRealUserId: true
                  };
                  await AsyncStorage.setItem('user_data', JSON.stringify(tempUserData));
                  storedUser = tempUserData;
                  console.log('Created temporary user data (backend will likely reject):', tempUserData);
                }
              }
            }
          }
          // Method 3: For token-only responses, we'll handle this in dashboard
          else {
            console.log('Token-only login - will fetch user data in dashboard');
            // Just proceed - dashboard will handle user data fetching
          }
        } catch (error) {
          console.error('Failed to get user data:', error);
          console.log('Proceeding to dashboard - will fetch user data there');
          // Don't block login - let dashboard handle user data fetching
        }
      }
      
      // Navigate to dashboard
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your connection and try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="timer-outline" size={60} color="#3B82F6" />
          <Text style={styles.title}>FastTracker</Text>
          <Text style={styles.subtitle}>Track your fasting journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/(auth)/signup" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 50,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 30,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    marginTop: 8,
    fontWeight: '400',
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    marginBottom: 12,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: '#3A3A3C',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#3A3A3C',
  },
  dividerText: {
    color: '#8E8E93',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '400',
  },
  secondaryButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#1C1C1E',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '400',
  },
});

export default LoginScreen;
