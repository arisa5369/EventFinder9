import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="help-center" />
      <Stack.Screen name="contact-us" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
