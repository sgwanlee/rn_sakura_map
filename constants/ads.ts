import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

const isProduction = !__DEV__;

// AdMob Interstitial Ad Unit IDs
export const INTERSTITIAL_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: process.env.EXPO_PUBLIC_IOS_INTERSTITIAL_AD_UNIT_ID!,
      android: process.env.EXPO_PUBLIC_ANDROID_INTERSTITIAL_AD_UNIT_ID!,
    })!
  : TestIds.INTERSTITIAL;

// AdMob Banner Ad Unit IDs - Home Screen
export const HOME_BANNER_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: process.env.EXPO_PUBLIC_IOS_HOME_BANNER_AD_UNIT_ID!,
      android: process.env.EXPO_PUBLIC_ANDROID_HOME_BANNER_AD_UNIT_ID!,
    })!
  : TestIds.ADAPTIVE_BANNER;

// AdMob Banner Ad Unit IDs - Settings Screen
export const SETTINGS_BANNER_AD_UNIT_ID = isProduction
  ? Platform.select({
      ios: process.env.EXPO_PUBLIC_IOS_SETTINGS_BANNER_AD_UNIT_ID!,
      android: process.env.EXPO_PUBLIC_ANDROID_SETTINGS_BANNER_AD_UNIT_ID!,
    })!
  : TestIds.ADAPTIVE_BANNER;

// Storage keys for ad-related data
export const AD_STORAGE_KEYS = {
  LAST_AD_SHOWN_DATE: "last_ad_shown_date",
  TRACKING_PERMISSION: "tracking_permission",
} as const;
