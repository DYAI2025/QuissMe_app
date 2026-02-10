import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F1B2D' }, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="result" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="join" />
        <Stack.Screen name="match" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="quiz" />
        <Stack.Screen name="insight-drop" />
        <Stack.Screen name="reward-choice" />
      </Stack>
    </>
  );
}
