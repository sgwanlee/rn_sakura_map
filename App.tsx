import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";
import MainNavigator from "./components/MainNavigator";
import OnboardingScreen, { OnboardingData } from "./screens/OnboardingScreen";
import AppStartInterstitial from "./components/AppStartInterstitial";
import { RevenueCatProvider } from "./contexts/RevenueCatContext";
import { DevSettingsProvider } from "./contexts/DevSettingsContext";
import { UpdateProvider } from "./contexts/UpdateContext";
import VersionChecker from "./components/VersionChecker";
import { AppConfig } from "./config/app.config";
import { initI18n } from "./utils/i18n";

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
  const [i18nReady, setI18nReady] = useState(false);
  const [splashScreenHidden, setSplashScreenHidden] = useState(false);

  useEffect(() => {
    initI18n(() => setI18nReady(true));
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
  if (isLoading || !i18nReady) {
    return null;
  }

  // 온보딩이 완료되지 않은 경우 스플래시 스크린 숨기고 온보딩 표시
  // 온보딩 중에는 전면광고를 표시하지 않음
  if (!onboardingCompleted) {
    // Hide splash screen for onboarding
    if (!splashScreenHidden) {
      SplashScreen.hideAsync();
      setSplashScreenHidden(true);
    }

    const onboardingContent = (
      <OnboardingScreen onComplete={handleOnboardingComplete} />
    );

    if (AppConfig.features.subscription) {
      return (
        <SafeAreaProvider>
          <DevSettingsProvider>
            <RevenueCatProvider>{onboardingContent}</RevenueCatProvider>
          </DevSettingsProvider>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider>
        <DevSettingsProvider>{onboardingContent}</DevSettingsProvider>
      </SafeAreaProvider>
    );
  }

  // 온보딩 완료 후: AppStartInterstitial에서 스플래시 스크린과 광고를 관리
  // Always wrap with RevenueCatProvider if subscription is enabled
  // This ensures the context is available even if not actively using it
  if (AppConfig.features.subscription) {
    return (
      <SafeAreaProvider>
        <DevSettingsProvider>
          <UpdateProvider>
            <RevenueCatProvider>
              <AppStartInterstitial>
                <VersionChecker />
                <MainNavigator />
              </AppStartInterstitial>
            </RevenueCatProvider>
          </UpdateProvider>
        </DevSettingsProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <DevSettingsProvider>
        <UpdateProvider>
          <AppStartInterstitial>
            <VersionChecker />
            <MainNavigator />
          </AppStartInterstitial>
        </UpdateProvider>
      </DevSettingsProvider>
    </SafeAreaProvider>
  );
}
