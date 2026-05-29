import { Platform } from 'react-native';

const IS_DEBUG = __DEV__;

const TEST_IDS = {
  appId:         'ca-app-pub-3940256099942544~3347511713',
  banner:        'ca-app-pub-3940256099942544/9214589741',
  interstitial:  'ca-app-pub-3940256099942544/1033173712',
  appOpen:       'ca-app-pub-3940256099942544/9257395921',
};

const PROD_IDS = {
  appId:         'ca-app-pub-7831002909037560~7106259586',
  banner:        'ca-app-pub-7831002909037560/6663406457',
  interstitial:  'ca-app-pub-7831002909037560/1248417921',
  appOpen:       'ca-app-pub-7831002909037560/9402770349',
};

export const AD_IDS = IS_DEBUG ? TEST_IDS : PROD_IDS;

export const ADMOB_ANDROID_APP_ID = IS_DEBUG
  ? TEST_IDS.appId
  : PROD_IDS.appId;

export const AD_RULES = {
  minCompletionsBeforeInterstitial: 3,
  interstitialCooldownMs: 5 * 60 * 1000,
  interstitialFrequency: 4,
  appOpenCooldownMs: 4 * 60 * 60 * 1000,
  minCompletionsBeforeAppOpen: 3,
  appOpenCooldownAfterInterstitialMs: 60 * 1000,
};
