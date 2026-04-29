import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initPurchases } from './src/services/purchases';
import { initAds, loadInterstitial } from './src/services/ads';
import { requestNotificationPermissions, scheduleDailyReminder } from './src/services/notifications';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initPurchases();
      } catch (e) {
        console.warn('Purchases init failed:', e?.message);
      }
      try {
        await initAds();
        // Preload the first interstitial so it's ready when the user
        // completes their first action. Safe no-op if the AdMob module
        // isn't installed.
        loadInterstitial().catch(() => {});
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
