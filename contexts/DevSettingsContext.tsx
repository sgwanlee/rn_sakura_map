import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEV_SETTINGS_KEY = "dev_settings";

interface DevSettings {
  adsEnabled: boolean;
  subscriptionOverride: boolean;
}

interface DevSettingsContextType {
  devSettings: DevSettings;
  isDevMode: boolean;
  setAdsEnabled: (enabled: boolean) => void;
  setSubscriptionOverride: (enabled: boolean) => void;
  toggleDevMode: () => void;
}

const defaultSettings: DevSettings = {
  adsEnabled: true,
  subscriptionOverride: false,
};

const DevSettingsContext = createContext<DevSettingsContextType | undefined>(undefined);

interface DevSettingsProviderProps {
  children: ReactNode;
}

export const DevSettingsProvider: React.FC<DevSettingsProviderProps> = ({ children }) => {
  const [devSettings, setDevSettings] = useState<DevSettings>(defaultSettings);
  const [isDevMode, setIsDevMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(DEV_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDevSettings(parsed.settings ?? defaultSettings);
        setIsDevMode(parsed.isDevMode ?? false);
      }
    } catch (error) {
      console.error("[DevSettings] Failed to load settings:", error);
    }
  };

  const saveSettings = async (settings: DevSettings, devMode: boolean) => {
    try {
      await AsyncStorage.setItem(
        DEV_SETTINGS_KEY,
        JSON.stringify({ settings, isDevMode: devMode })
      );
    } catch (error) {
      console.error("[DevSettings] Failed to save settings:", error);
    }
  };

  const setAdsEnabled = (enabled: boolean) => {
    const newSettings = { ...devSettings, adsEnabled: enabled };
    setDevSettings(newSettings);
    saveSettings(newSettings, isDevMode);
  };

  const setSubscriptionOverride = (enabled: boolean) => {
    const newSettings = { ...devSettings, subscriptionOverride: enabled };
    setDevSettings(newSettings);
    saveSettings(newSettings, isDevMode);
  };

  const toggleDevMode = () => {
    const newDevMode = !isDevMode;
    setIsDevMode(newDevMode);
    saveSettings(devSettings, newDevMode);
  };

  return (
    <DevSettingsContext.Provider
      value={{
        devSettings,
        isDevMode,
        setAdsEnabled,
        setSubscriptionOverride,
        toggleDevMode,
      }}
    >
      {children}
    </DevSettingsContext.Provider>
  );
};

export const useDevSettings = (): DevSettingsContextType => {
  const context = useContext(DevSettingsContext);
  if (context === undefined) {
    throw new Error("useDevSettings must be used within a DevSettingsProvider");
  }
  return context;
};
