/**
 * App Configuration
 *
 * This file contains all the configuration options for the app template.
 * Modify these settings to customize the app behavior.
 */

export const AppConfig = {
  // App Info
  appName: "My App",
  appTagline: "Your app tagline here",

  // Feature Flags
  features: {
    subscription: false, // Enable RevenueCat subscription
    admob: true, // Enable Google AdMob ads
    analytics: true, // Enable Firebase Analytics
  },

  // AdMob Configuration
  admob: {
    // Interstitial Ads
    interstitial: {
      enabled: true,
      showOnAppStart: true,
    },
    // Banner Ads per screen
    banner: {
      enabled: true,
      showOnHome: true,
      showOnSettings: true,
      showOnPremium: false, // Usually no ads on premium/paywall screen
    },
  },

  // Onboarding Configuration
  onboarding: {
    steps: [
      {
        id: "welcome",
        title: "Welcome to Our App",
        description:
          "Discover amazing features and get started with your journey.",
        image: require("../assets/onboarding/step1.png"),
      },
      {
        id: "features",
        title: "Powerful Features",
        description:
          "Explore all the tools and capabilities at your fingertips.",
        image: require("../assets/onboarding/step2.png"),
      },
      {
        id: "getstarted",
        title: "Get Started",
        description: "You're all set! Let's begin your experience.",
        image: require("../assets/onboarding/step3.png"),
      },
    ],
    // Show paywall at the end of onboarding (only if subscription is enabled)
    showPaywallAtEnd: true,
  },

  // Subscription Configuration (only used if features.subscription is true)
  subscription: {
    // Premium features to display on paywall
    features: [
      {
        icon: "star-outline" as const,
        title: "Premium Feature 1",
        description: "Description of premium feature 1",
      },
      {
        icon: "flash-outline" as const,
        title: "Premium Feature 2",
        description: "Description of premium feature 2",
      },
      {
        icon: "shield-checkmark-outline" as const,
        title: "Ad-Free Experience",
        description: "Enjoy the app without any ads",
      },
    ],
  },
};

// Type exports for TypeScript support
export type OnboardingStep = (typeof AppConfig.onboarding.steps)[number];
export type PremiumFeature = (typeof AppConfig.subscription.features)[number];
