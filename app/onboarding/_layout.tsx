import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="name" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="breath" />
      <Stack.Screen name="tutorial" />
    </Stack>
  );
}