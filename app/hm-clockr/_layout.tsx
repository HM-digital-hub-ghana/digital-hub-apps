import { Stack } from 'expo-router';

export default function HMClockrLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

