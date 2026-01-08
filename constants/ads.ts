import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";
import { AppConfig } from "../config/app.config";

const isProduction = !__DEV__;

// AdMob Interstitial Ad Unit IDs
export const INTERSTITIAL_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: AppConfig.admob.adUnitIds.interstitial.ios,
      android: AppConfig.admob.adUnitIds.interstitial.android,
    })!
  : TestIds.INTERSTITIAL;

// AdMob Banner Ad Unit IDs - Home Screen
export const HOME_BANNER_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: AppConfig.admob.adUnitIds.homeBanner.ios,
      android: AppConfig.admob.adUnitIds.homeBanner.android,
    })!
  : TestIds.ADAPTIVE_BANNER;

// AdMob Banner Ad Unit IDs - Settings Screen
export const SETTINGS_BANNER_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: AppConfig.admob.adUnitIds.settingsBanner.ios,
      android: AppConfig.admob.adUnitIds.settingsBanner.android,
    })!
  : TestIds.ADAPTIVE_BANNER;

// Storage keys for ad-related data
export const AD_STORAGE_KEYS = {
  LAST_AD_SHOWN_DATE: "last_ad_shown_date",
  TRACKING_PERMISSION: "tracking_permission",
} as const;
