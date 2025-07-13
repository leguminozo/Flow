import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { LanguageProvider } from '@/components/LanguageProvider';
import '@/lib/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

function RootLayoutNav() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#000000" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <RootLayoutNav />
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}