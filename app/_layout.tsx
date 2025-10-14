import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />      {/* Splash Screen */}
      <Stack.Screen name="(tabs)" />     {/* Tabs pas splash-it */}
    </Stack>
  );
}
