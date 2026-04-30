// BannerAdBox — renders an AdMob banner for free users only.
// Lazy-loads react-native-google-mobile-ads so the bundle still works without it.

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { getBannerId, isAdsReady } from '../services/ads';

export default function BannerAdBox() {
  const { isPremium } = useApp();
  const [BannerAd, setBannerAd] = useState(null);
  const [BannerAdSize, setBannerAdSize] = useState(null);

  useEffect(() => {
    if (isPremium) return;
    let mounted = true;
    (async () => {
      try {
        const mod = await import('react-native-google-mobile-ads');
        if (!mounted) return;
        setBannerAd(() => mod.BannerAd);
        setBannerAdSize(mod.BannerAdSize);
      } catch {
        // module not available — skip banner silently
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isPremium]);

  if (isPremium || !BannerAd || !BannerAdSize || !isAdsReady()) return null;
  const adId = getBannerId();
  if (!adId) return null;

  return (
    <View style={styles.wrap}>
      <BannerAd
        unitId={adId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 11, 20, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(70, 69, 84, 0.4)',
    paddingVertical: 4,
  },
});
