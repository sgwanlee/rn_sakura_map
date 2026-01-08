import { useState, useEffect, useCallback } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";
import MainNavigator from "./components/MainNavigator";
import OnboardingScreen, { OnboardingData } from "./screens/OnboardingScreen";
import AppStartInterstitial from "./components/AppStartInterstitial";
import { RevenueCatProvider } from "./contexts/RevenueCatContext";
import { AppConfig } from "./config/app.config";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = "onboarding_completed";
const ONBOARDING_DATA_KEY = "onboarding_data";

// Initialize MobileAds (only if AdMob is enabled)
if (AppConfig.features.admob) {
  MobileAds()
    .initialize()
    .then(() => {
      console.log("MobileAds initialized successfully");
    })
    .catch((error) => {
      console.error("MobileAds initialization error:", error);
    });
}

export default function App() {
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      setOnboardingCompleted(completed === "true");
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
      setOnboardingCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Hide splash screen when app is ready
  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
      setOnboardingCompleted(true);
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
  };

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Wrap content with providers based on configuration
  const renderContent = () => {
    if (!onboardingCompleted) {
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
    // Wrap MainNavigator with AppStartInterstitial for app start ads
    return (
      <AppStartInterstitial>
        <MainNavigator />
      </AppStartInterstitial>
    );
  };

  // Always wrap with RevenueCatProvider if subscription is enabled
  // This ensures the context is available even if not actively using it
  if (AppConfig.features.subscription) {
    return (
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <RevenueCatProvider>{renderContent()}</RevenueCatProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      {renderContent()}
    </SafeAreaProvider>
  );
}
