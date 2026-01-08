# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Expo React Native App Template** with integrated:
- **AdMob** (Banner & Interstitial ads)
- **Firebase Analytics**
- **RevenueCat Subscription**

All features are configurable via `/config/app.config.ts`.

## Development Commands

### Starting the app
```bash
npm start              # Start Expo development server
npm run android        # Run on Android device/emulator
npm run ios            # Run on iOS device/simulator
npm run web            # Run in web browser
```

### Building with EAS
The project uses EAS Build with three build profiles configured:
- `development`: Development client with internal distribution
- `preview`: Internal distribution for testing
- `production`: Production build

## Architecture

### Directory Structure

```
/
├── App.tsx                    # App entry point
├── index.ts
├── app.json
├── eas.json
├── package.json
│
├── /config/
│   └── app.config.ts          # App configuration (features, ads, onboarding)
│
├── /screens/
│   ├── HomeScreen.tsx         # Home tab screen
│   ├── SettingsScreen.tsx     # Settings tab screen
│   ├── OnboardingScreen.tsx   # Onboarding flow
│   └── PaywallScreen.tsx      # Subscription paywall
│
├── /components/
│   ├── MainNavigator.tsx      # Tab & Stack navigation
│   └── AdBanner.tsx           # Banner ad component
│
├── /contexts/
│   └── RevenueCatContext.tsx  # Subscription state management
│
├── /hooks/
│   └── useInterstitialAd.ts   # Interstitial ad hook
│
├── /constants/
│   ├── ads.ts                 # Ad unit IDs
│   ├── colors.ts              # Color palette
│   └── subscription.ts        # RevenueCat config
│
├── /utils/
│   └── analytics.ts           # Firebase Analytics helpers
│
└── /assets/
    ├── /onboarding/           # Onboarding step images
    ├── icon.png
    ├── splash-icon.png
    └── adaptive-icon.png
```

### Configuration System

All app features are controlled via `/config/app.config.ts`:

```typescript
export const AppConfig = {
  // App Info
  appName: "My App",
  appTagline: "Your app tagline",

  // Feature Flags
  features: {
    subscription: true,  // Enable RevenueCat
    admob: true,         // Enable AdMob ads
    analytics: true,     // Enable Firebase Analytics
  },

  // AdMob Settings
  admob: {
    interstitial: { enabled: true, showOnAppStart: false },
    banner: { enabled: true, showOnHome: true, showOnSettings: true },
  },

  // Onboarding Steps
  onboarding: {
    steps: [...],
    showPaywallAtEnd: true,
  },
};
```

### Navigation Structure

```
MainNavigator
├── TabNavigator (Bottom Tab Navigation)
│   ├── HomeTab → HomeScreen
│   ├── PremiumTab → PaywallScreen (if subscription enabled)
│   └── SettingsTab → SettingsScreen
└── Stack Navigation
    ├── PaywallScreen (modal)
    └── OnboardingScreen (modal)
```

### Key Technical Details

- **TypeScript**: Strict typing throughout
- **Expo SDK**: Latest version
- **React Navigation**: Bottom tabs + Native stack
- **RevenueCat**: Subscription management
- **Google Mobile Ads**: Banner & Interstitial
- **Firebase Analytics**: Event tracking

## Environment Variables

Set these in `eas.json` for production builds:

### RevenueCat
- `EXPO_PUBLIC_RC_IOS` - RevenueCat iOS API key
- `EXPO_PUBLIC_RC_ANDROID` - RevenueCat Android API key

### AdMob
- `EXPO_PUBLIC_IOS_INTERSTITIAL_AD_UNIT_ID`
- `EXPO_PUBLIC_ANDROID_INTERSTITIAL_AD_UNIT_ID`
- `EXPO_PUBLIC_IOS_HOME_BANNER_AD_UNIT_ID`
- `EXPO_PUBLIC_ANDROID_HOME_BANNER_AD_UNIT_ID`
- `EXPO_PUBLIC_IOS_SETTINGS_BANNER_AD_UNIT_ID`
- `EXPO_PUBLIC_ANDROID_SETTINGS_BANNER_AD_UNIT_ID`

## Setup Checklist

1. **Firebase**
   - Create Firebase project
   - Download `GoogleService-Info.plist` (iOS)
   - Download `google-services.json` (Android)
   - Place in project root

2. **RevenueCat**
   - Create RevenueCat project
   - Add iOS/Android apps
   - Create products & entitlements
   - Set API keys in environment

3. **AdMob**
   - Create AdMob account
   - Create app & ad units
   - Update `app.json` with app IDs
   - Set ad unit IDs in environment

4. **App Configuration**
   - Update `config/app.config.ts`
   - Update `constants/subscription.ts` (entitlement ID, product IDs)
   - Replace onboarding images in `/assets/onboarding/`

## Adding New Features

### Adding a new tab
1. Create screen in `/screens/`
2. Add to `TabNavigator` in `MainNavigator.tsx`
3. Add banner ad if needed (check `AppConfig.admob.banner`)

### Adding new ad placements
1. Add ad unit ID constants in `/constants/ads.ts`
2. Add environment variable mapping
3. Use `<AdBanner unitId={...} />` component

### Custom analytics events
1. Add event function in `/utils/analytics.ts`
2. Call from components as needed
