import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { initPurchases } from './src/services/purchases';
import { initAds, loadInterstitial, loadRewarded } from './src/services/ads';
import { requestNotificationPermissions, scheduleDailyReminder } from './src/services/notifications';
import { initI18n } from './src/i18n';

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n()
      .catch((e) => console.warn('i18n init failed:', e?.message))
      .finally(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await initPurchases();
      } catch (e) {
        console.warn('Purchases init failed:', e?.message);
      }
      try {
        await initAds();
        // Preload both ad types so they're instant when shown.
        loadInterstitial().catch(() => {});
        loadRewarded().catch(() => {});
      } catch (e) {
        console.warn('Ads init failed:', e?.message);
      }
      try {
        const granted = await requestNotificationPermissions();
        if (granted) await scheduleDailyReminder();
      } catch (e) {
        console.warn('Notifications init failed:', e?.message);
      }
    })();
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0B14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <AppProvider>
              <StatusBar style="light" />
              <AppNavigator />
            </AppProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
