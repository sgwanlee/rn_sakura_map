# Expo App Template

A React Native (Expo) app template with integrated AdMob, Firebase Analytics, and RevenueCat subscription.

## Features

- **AdMob Integration**: Banner and Interstitial ads
- **RevenueCat Subscription**: In-app purchases and subscription management
- **Firebase Analytics**: Event tracking and analytics
- **Configurable**: All features can be toggled via configuration file
- **Onboarding Flow**: Customizable step-by-step onboarding with paywall integration

## Project Structure

```
.
├── App.tsx                      # App entry point
├── config/
│   └── app.config.ts            # Feature configuration
├── components/
│   ├── MainNavigator.tsx        # Navigation configuration
│   └── AdBanner.tsx             # Banner ad component
├── screens/
│   ├── HomeScreen.tsx           # Home tab screen
│   ├── SettingsScreen.tsx       # Settings tab screen
│   ├── OnboardingScreen.tsx     # Onboarding flow
│   └── PaywallScreen.tsx        # Subscription paywall
├── contexts/
│   └── RevenueCatContext.tsx    # Subscription state management
├── hooks/
│   └── useInterstitialAd.ts     # Interstitial ad hook
├── constants/
│   ├── ads.ts                   # Ad unit IDs
│   ├── colors.ts                # Color palette
│   └── subscription.ts          # RevenueCat config
└── utils/
    └── analytics.ts             # Firebase Analytics helpers
```

## Configuration

All features are controlled via `config/app.config.ts`:

```typescript
export const AppConfig = {
  appName: "My App",
  appTagline: "Your app tagline",

  features: {
    subscription: true,  // Enable RevenueCat
    admob: true,         // Enable AdMob ads
    analytics: true,     // Enable Firebase Analytics
  },

  admob: {
    interstitial: { enabled: true, showOnAppStart: false },
    banner: { enabled: true, showOnHome: true, showOnSettings: true },
  },

  onboarding: {
    steps: [...],
    showPaywallAtEnd: true,
  },
};
```

## Setup

### 1. Firebase Setup
1. Create a Firebase project
2. Download `GoogleService-Info.plist` (iOS) and `google-services.json` (Android)
3. Place files in project root

### 2. RevenueCat Setup
1. Create a RevenueCat project
2. Add iOS/Android apps
3. Create products and entitlements
4. Set API keys in environment variables

### 3. AdMob Setup
1. Create AdMob account
2. Create app and ad units
3. Update `app.json` with app IDs
4. Set ad unit IDs in environment variables

## Environment Variables

Set in `eas.json` for production:

- `EXPO_PUBLIC_RC_IOS` - RevenueCat iOS API key
- `EXPO_PUBLIC_RC_ANDROID` - RevenueCat Android API key
- `EXPO_PUBLIC_IOS_INTERSTITIAL_AD_UNIT_ID`
- `EXPO_PUBLIC_ANDROID_INTERSTITIAL_AD_UNIT_ID`
- `EXPO_PUBLIC_IOS_HOME_BANNER_AD_UNIT_ID`
- `EXPO_PUBLIC_ANDROID_HOME_BANNER_AD_UNIT_ID`
- `EXPO_PUBLIC_IOS_SETTINGS_BANNER_AD_UNIT_ID`
- `EXPO_PUBLIC_ANDROID_SETTINGS_BANNER_AD_UNIT_ID`

## Development

```bash
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios            # Run on iOS
```

## Building

```bash
eas build --profile development   # Development build
eas build --profile preview       # Preview build
eas build --profile production    # Production build
```

## Tech Stack

- React Native (Expo SDK)
- TypeScript
- React Navigation (Bottom Tab + Native Stack)
- RevenueCat (react-native-purchases)
- Google Mobile Ads (react-native-google-mobile-ads)
- Firebase Analytics (@react-native-firebase/analytics)
