import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AD_IDS } from '../config/ads';

let BannerAd: any = null;
let BannerAdSize: any = null;
let loaded = false;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd    = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  loaded = true;
} catch {}

export default function BannerAdComponent() {
  if (!loaded || !BannerAd) return null;

  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={AD_IDS.banner}
        size={BannerAdSize?.ANCHORED_ADAPTIVE_BANNER ?? 'ANCHORED_ADAPTIVE_BANNER'}
        onAdFailedToLoad={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', minHeight: 50 },
});
