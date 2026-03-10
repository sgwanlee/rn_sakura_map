/**
 * App Configuration
 *
 * This file contains all the configuration options for the app template.
 * Modify these settings to customize the app behavior.
 */

export const AppConfig = {
  // App Info
  appName: "벚꽃지도",
  appTagline: "전국 벚꽃 명소를 한눈에 보는 봄 지도",
  contactEmail: "c@house201.com",

  // Legal Links
  legal: {
    eulaUrl:
      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
    privacyPolicyUrl:
      "https://halved-biplane-9d8.notion.site/10xEnglish-Privacy-Policy-2d9f4fbcf98180b08e09ecd3b35529ed?source=copy_link",
  },

  // Feature Flags
  features: {
    admob: true,
    analytics: true, // Enable Firebase Analytics
  },

  // AdMob Configuration
  admob: {
    interstitial: {
      enabled: true,
      showOnAppStart: true,
    },
    banner: {
      enabled: true,
      showOnHome: true,
      showOnSettings: false,
    },
    adUnitIds: {
      interstitial: {
        ios: process.env.EXPO_PUBLIC_IOS_INTERSTITIAL_AD_UNIT_ID ?? "",
        android: process.env.EXPO_PUBLIC_ANDROID_INTERSTITIAL_AD_UNIT_ID ?? "",
      },
      homeBanner: {
        ios: process.env.EXPO_PUBLIC_IOS_HOME_BANNER_AD_UNIT_ID ?? "",
        android: process.env.EXPO_PUBLIC_ANDROID_HOME_BANNER_AD_UNIT_ID ?? "",
      },
      settingsBanner: {
        ios: process.env.EXPO_PUBLIC_IOS_SETTINGS_BANNER_AD_UNIT_ID ?? "",
        android:
          process.env.EXPO_PUBLIC_ANDROID_SETTINGS_BANNER_AD_UNIT_ID ?? "",
      },
    },
  },

  // Store Review Configuration
  storeReview: {
    enabled: true,
    // Frequency: 'one_time' | 'weekly' | 'monthly'
    // one_time: Show only once, never again
    // weekly: Show once per week maximum
    // monthly: Show once per month maximum
    frequency: "one_time" as "one_time" | "weekly" | "monthly",
  },

  // Feedback Configuration
  feedback: {
    enabled: true,
    maxSubmissionsPerHour: 5,
    nicknameMinLength: 3,
    nicknameMaxLength: 20,
    contentMinLength: 10,
    contentMaxLength: 1000,
    slackWebhookUrl: process.env.EXPO_PUBLIC_SLACK_WEBHOOK_URL ?? "",
  },

  // Update Check Configuration
  update: {
    enabled: true, // Enable version check feature
    iosAppId: "", // App Store ID (set after publishing, e.g., "6748281990")
    checkDelayMs: 3000, // Delay before checking for updates (ms)
  },
};

// Type exports for TypeScript support
export type StoreReviewFrequency = "one_time" | "weekly" | "monthly";
