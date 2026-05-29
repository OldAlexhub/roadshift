import { Platform, Vibration } from 'react-native';
import { AD_IDS, AD_RULES } from '../config/ads';
import { AdState } from '../types/game';
import { GameStorage } from '../storage/gameStorage';

let interstitialAd: any = null;
let appOpenAd: any = null;
let adsInitialized = false;
let consentReady = false;
let mobileAds: any = null;
let InterstitialAd: any = null;
let AppOpenAd: any = null;
let AdEventType: any = null;
let AdsConsentStatus: any = null;
let AdsConsent: any = null;

export async function initializeAds(): Promise<void> {
  try {
    const adsModule = await import('react-native-google-mobile-ads');
    mobileAds    = adsModule.default;
    InterstitialAd = adsModule.InterstitialAd;
    AppOpenAd    = adsModule.AppOpenAd;
    AdEventType  = adsModule.AdEventType;
    AdsConsent   = adsModule.AdsConsent;
    AdsConsentStatus = adsModule.AdsConsentStatus;

    await handleConsent();
    await mobileAds().initialize();
    adsInitialized = true;
    loadInterstitial();
    loadAppOpen();
  } catch (_err) {
    // Ads unavailable - game continues normally
  }
}

async function handleConsent(): Promise<void> {
  try {
    if (!AdsConsent) return;
    const consentInfo = await AdsConsent.requestInfoUpdate();
    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus?.REQUIRED
    ) {
      await AdsConsent.showForm();
    }
    consentReady = true;
  } catch {
    consentReady = true;
  }
}

export async function showPrivacyOptions(): Promise<boolean> {
  try {
    if (!AdsConsent) return false;
    const info = await AdsConsent.requestInfoUpdate();
    if (info.privacyOptionsRequirementStatus === 'required') {
      await AdsConsent.showPrivacyOptionsForm();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function loadInterstitial(): void {
  if (!adsInitialized || !InterstitialAd || !AdEventType) return;
  try {
    interstitialAd = InterstitialAd.createForAdRequest(AD_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: false,
    });
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      loadInterstitial();
    });
    interstitialAd.load();
  } catch {}
}

function loadAppOpen(): void {
  if (!adsInitialized || !AppOpenAd || !AdEventType) return;
  try {
    appOpenAd = AppOpenAd.createForAdRequest(AD_IDS.appOpen, {
      requestNonPersonalizedAdsOnly: false,
    });
    appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      loadAppOpen();
    });
    appOpenAd.load();
  } catch {}
}

export async function tryShowInterstitial(adState: AdState): Promise<AdState> {
  if (!adsInitialized || !interstitialAd) return adState;

  const now = Date.now();
  const { successfulCompletions, lastInterstitialTimestamp } = adState;

  if (successfulCompletions <= AD_RULES.minCompletionsBeforeInterstitial) return adState;
  if (now - lastInterstitialTimestamp < AD_RULES.interstitialCooldownMs) return adState;
  const eligibleCount = successfulCompletions - AD_RULES.minCompletionsBeforeInterstitial;
  if (eligibleCount % AD_RULES.interstitialFrequency !== 0) return adState;

  try {
    const loaded = await interstitialAd.load().catch(() => false);
    if (loaded !== false) {
      await interstitialAd.show();
    }
    const newState: AdState = { ...adState, lastInterstitialTimestamp: now };
    await GameStorage.saveAdState(newState);
    return newState;
  } catch {
    return adState;
  }
}

export async function tryShowAppOpen(adState: AdState, screenName: 'Home' | 'DistrictMap'): Promise<AdState> {
  if (!adsInitialized || !appOpenAd) return adState;

  const now = Date.now();
  const { successfulCompletions, lastAppOpenTimestamp, lastInterstitialTimestamp, firstLaunch } = adState;

  if (firstLaunch) return adState;
  if (successfulCompletions < AD_RULES.minCompletionsBeforeAppOpen) return adState;
  if (now - lastAppOpenTimestamp < AD_RULES.appOpenCooldownMs) return adState;
  if (now - lastInterstitialTimestamp < AD_RULES.appOpenCooldownAfterInterstitialMs) return adState;

  try {
    await appOpenAd.show();
    const newState: AdState = { ...adState, lastAppOpenTimestamp: now };
    await GameStorage.saveAdState(newState);
    return newState;
  } catch {
    return adState;
  }
}

export function markFirstLaunchDone(): void {
  GameStorage.loadAdState().then(state => {
    GameStorage.saveAdState({ ...state, firstLaunch: false });
  });
}
