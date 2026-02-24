import { useUpdate } from "../contexts/UpdateContext";
import { AppConfig } from "../config/app.config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Platform } from "react-native";

interface AppStoreVersionResponse {
  results: {
    version: string;
    trackViewUrl?: string;
  }[];
}

export const openAppStore = () => {
  const bundleId =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.bundleIdentifier
      : Constants.expoConfig?.android?.package;

  if (Platform.OS === "ios") {
    const appId = AppConfig.update.iosAppId;
    if (appId) {
      Linking.openURL(`https://apps.apple.com/app/id${appId}`);
    }
  } else {
    // For Android Play Store
    Linking.openURL(
      `https://play.google.com/store/apps/details?id=${bundleId}`
    );
  }
};

const DISMISSED_VERSION_KEY = "dismissedUpdateVersion";

const VersionChecker = () => {
  const { t } = useTranslation();
  const [hasChecked, setHasChecked] = useState(false);
  const { setUpdateInfo } = useUpdate();

  // Test mode for development
  const TEST_MODE = __DEV__ && false; // Set to true to test in development
  const TEST_STORE_VERSION = "2.0.0"; // Test version for development

  // Get current app version
  const currentVersion = Constants.expoConfig?.version || "1.0.0";
  const bundleId =
    Platform.OS === "ios"
      ? Constants.expoConfig?.ios?.bundleIdentifier
      : Constants.expoConfig?.android?.package;

  const parseVersion = (
    version: string
  ): { major: number; minor: number; patch: number } => {
    const parts = version.split(".").map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  };

  const checkAppStoreVersion = async (): Promise<string | null> => {
    try {
      // Return test version in development mode
      if (TEST_MODE) {
        console.log(
          "[VersionChecker] Test mode active, returning test version:",
          TEST_STORE_VERSION
        );
        return TEST_STORE_VERSION;
      }

      if (!bundleId) return null;

      let url: string;
      if (Platform.OS === "ios") {
        const appId = AppConfig.update.iosAppId;
        if (!appId) {
          console.log("[VersionChecker] iOS App ID not configured");
          return null;
        }
        url = `https://itunes.apple.com/lookup?id=${appId}`;
      } else {
        // For Android, check Play Store (requires server-side API or web scraping)
        // In production, you should implement a server endpoint for this
        console.log(
          "[VersionChecker] Android version check not fully implemented"
        );
        return null;
      }

      const response = await fetch(url);
      const data: AppStoreVersionResponse = await response.json();

      if (data.results && data.results.length > 0) {
        console.log(
          "[VersionChecker] Store version found:",
          data.results[0].version
        );
        return data.results[0].version;
      }

      return null;
    } catch (error) {
      console.error(
        "[VersionChecker] Failed to check app store version:",
        error
      );
      return null;
    }
  };

  const showUpdateAlert = async (storeVersion: string) => {
    // Check if this version was already dismissed
    const dismissedVersion = await AsyncStorage.getItem(DISMISSED_VERSION_KEY);
    if (dismissedVersion === storeVersion) {
      console.log(
        `[VersionChecker] Version ${storeVersion} was previously dismissed`
      );
      return;
    }

    const buttons = [
      {
        text: t("common.cancel"),
        style: "cancel" as const,
        onPress: async () => {
          // Save dismissed version
          await AsyncStorage.setItem(DISMISSED_VERSION_KEY, storeVersion);
          console.log(`[VersionChecker] Dismissed version ${storeVersion}`);
        },
      },
      {
        text: t("versionChecker.update"),
        onPress: () => openAppStore(),
        style: "default" as const,
      },
    ];

    Alert.alert(
      t("versionChecker.title"),
      t("versionChecker.messageOptional", {
        version: storeVersion,
      }),
      buttons,
      { cancelable: true }
    );
  };

  const checkForUpdates = async () => {
    if (hasChecked) return;
    if (!AppConfig.update.enabled) {
      setHasChecked(true);
      return;
    }

    try {
      const storeVersion = await checkAppStoreVersion();
      if (!storeVersion) {
        setHasChecked(true);
        return;
      }

      const current = parseVersion(currentVersion);
      const store = parseVersion(storeVersion);

      console.log(
        `[VersionChecker] Current version: ${currentVersion}, Store version: ${storeVersion}`
      );

      // Check if update is needed
      let needsUpdate = false;
      let isRequired = false;

      if (store.major > current.major) {
        // Major version update - required
        needsUpdate = true;
        isRequired = true;
      } else if (store.major === current.major && store.minor > current.minor) {
        // Minor version update - optional
        needsUpdate = true;
        isRequired = false;
      } else if (
        store.major === current.major &&
        store.minor === current.minor &&
        store.patch > current.patch
      ) {
        // Patch version update - optional
        needsUpdate = true;
        isRequired = false;
      }

      if (needsUpdate) {
        // Check if this version was dismissed
        const dismissedVersion = await AsyncStorage.getItem(
          DISMISSED_VERSION_KEY
        );
        const isDismissed = dismissedVersion === storeVersion;

        // Always update the context so Settings screen shows the button
        setUpdateInfo(true, storeVersion, isRequired);

        // Only show alert if not dismissed
        if (!isDismissed) {
          await showUpdateAlert(storeVersion);
        }
      } else {
        setUpdateInfo(false, null, false);
      }

      setHasChecked(true);
    } catch (error) {
      console.error("[VersionChecker] Version check failed:", error);
      setHasChecked(true);
    }
  };

  useEffect(() => {
    // Check for updates when component mounts
    const timer = setTimeout(() => {
      checkForUpdates();
    }, AppConfig.update.checkDelayMs);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
};

export default VersionChecker;
