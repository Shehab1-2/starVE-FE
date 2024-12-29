import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="login" // Default to login screen
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
