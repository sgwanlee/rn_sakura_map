import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import MobileAds from "react-native-google-mobile-ads";
import * as SplashScreen from "expo-splash-screen";
import MainNavigator from "./components/MainNavigator";
import AppStartInterstitial from "./components/AppStartInterstitial";
import { DevSettingsProvider } from "./contexts/DevSettingsContext";
import { SpotsProvider } from "./contexts/SpotsContext";
import { UpdateProvider } from "./contexts/UpdateContext";
import VersionChecker from "./components/VersionChecker";
import { AppConfig } from "./config/app.config";
import { initI18n } from "./utils/i18n";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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

function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <DevSettingsProvider>
        <UpdateProvider>
          <SpotsProvider>
            <AppStartInterstitial>
              <VersionChecker />
              <MainNavigator />
            </AppStartInterstitial>
          </SpotsProvider>
        </UpdateProvider>
      </DevSettingsProvider>
    </SafeAreaProvider>
  );
}

export default App;
