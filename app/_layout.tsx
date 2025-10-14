import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />      
<<<<<<< HEAD
      <Stack.Screen name="(tabs)" />    
=======
      <Stack.Screen name="(tabs)" />     
>>>>>>> 5566b16c2e81b85adc8554b491f537e8c07e8499
    </Stack>
  );
}
