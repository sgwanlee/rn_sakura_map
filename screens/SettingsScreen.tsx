import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useRevenueCat } from "../contexts/RevenueCatContext";
import { useDevSettings } from "../contexts/DevSettingsContext";
import { AppConfig } from "../config/app.config";
import useStoreReview from "../hooks/useStoreReview";
import Colors from "../constants/colors";
import AdBanner from "../components/AdBanner";
import { SETTINGS_BANNER_AD_UNIT_ID } from "../constants/ads";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const DEV_MODE_TAP_COUNT = 7;

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { isProMember, restorePurchases } = useRevenueCat();
  const { isAvailable: isReviewAvailable, requestReview } = useStoreReview();
  const { isDevMode, devSettings, setAdsEnabled, toggleDevMode } = useDevSettings();
  const [versionTapCount, setVersionTapCount] = React.useState(0);
  const showSubscriptionFeatures = AppConfig.features.subscription;
  const showReviewOption = AppConfig.storeReview.enabled && isReviewAvailable;
  const hideForSubscriber = AppConfig.admob.hideAdsForSubscribers && isProMember;
  const showAd =
    AppConfig.features.admob &&
    AppConfig.admob.banner.enabled &&
    AppConfig.admob.banner.showOnSettings &&
    !hideForSubscriber &&
    devSettings.adsEnabled;

  const handleRestorePurchases = async () => {
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert("Restore Complete", "Your purchases have been restored.");
      } else {
        Alert.alert("Restore Failed", "No purchases found to restore.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while restoring purchases.");
    }
  };

  const handleResetOnboarding = () => {
    navigation.navigate("Onboarding");
  };

  const handleManageSubscription = async () => {
    try {
      if (Platform.OS === "ios") {
        await Linking.openURL("https://apps.apple.com/account/subscriptions");
      } else {
        await Linking.openURL(
          "https://play.google.com/store/account/subscriptions"
        );
      }
    } catch (error) {
      Alert.alert("Error", "Unable to open subscription management page.");
    }
  };

  const handleContact = async () => {
    const email = AppConfig.contactEmail;
    const subject = encodeURIComponent(`[${AppConfig.appName}] Feedback`);
    const body = encodeURIComponent(`\n\n---\nApp Version: ${APP_VERSION}\nPlatform: ${Platform.OS}`);
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert("Error", "Unable to open email app.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to send email.");
    }
  };

  const handleWriteReview = async () => {
    await requestReview();
  };

  const handleVersionTap = () => {
    const newCount = versionTapCount + 1;
    setVersionTapCount(newCount);

    if (newCount >= DEV_MODE_TAP_COUNT) {
      if (!isDevMode) {
        toggleDevMode();
        Alert.alert("Developer Mode", "Developer mode has been enabled.");
      }
      setVersionTapCount(0);
    } else if (newCount >= DEV_MODE_TAP_COUNT - 3) {
      const remaining = DEV_MODE_TAP_COUNT - newCount;
      Alert.alert("Developer Mode", `${remaining} more taps to enable developer mode.`);
    }
  };

  const handleDisableDevMode = () => {
    Alert.alert(
      "Disable Developer Mode",
      "Are you sure you want to disable developer mode?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          style: "destructive",
          onPress: () => {
            toggleDevMode();
            setAdsEnabled(true);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="auto" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Subscription Section - Only show if subscription feature is enabled */}
        {showSubscriptionFeatures && (
          <>
            <View style={styles.subscriptionSection}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionTitle}>
                    {isProMember ? "Premium Member" : "Free Member"}
                  </Text>
                  <Text style={styles.subscriptionDescription}>
                    {isProMember
                      ? "You have unlimited access to all content."
                      : "Upgrade to Premium for unlimited access"}
                  </Text>
                </View>
                {isProMember && (
                  <View style={styles.proBadge}>
                    <Ionicons name="star" size={16} color="#fff" />
                    <Text style={styles.proBadgeText}>PRO</Text>
                  </View>
                )}
              </View>
              {!isProMember && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => navigation.navigate("Paywall")}
                >
                  <Ionicons name="rocket-outline" size={20} color="#fff" />
                  <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Membership Management Section */}
            <Text style={styles.sectionTitle}>Membership</Text>
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={styles.settingItem}
                onPress={handleRestorePurchases}
              >
                <View style={styles.settingLeft}>
                  <Ionicons
                    name="refresh-circle-outline"
                    size={24}
                    color="#212529"
                  />
                  <Text style={styles.settingLabel}>Restore Purchases</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingItem, styles.settingItemLast]}
                onPress={handleManageSubscription}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="card-outline" size={24} color="#212529" />
                  <Text style={styles.settingLabel}>Manage Subscription</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* App Settings Section */}
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity style={styles.settingItem} onPress={handleVersionTap}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#212529"
              />
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.versionText}>{APP_VERSION}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleResetOnboarding}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={24} color="#212529" />
              <Text style={styles.settingLabel}>View Onboarding Again</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.settingItem,
              !showReviewOption && styles.settingItemLast,
            ]}
            onPress={handleContact}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={24} color="#212529" />
              <Text style={styles.settingLabel}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
          </TouchableOpacity>

          {showReviewOption && (
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemLast]}
              onPress={handleWriteReview}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="star-outline" size={24} color="#212529" />
                <Text style={styles.settingLabel}>Write a Review</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
            </TouchableOpacity>
          )}
        </View>

        {/* Developer Settings Section - Only show when dev mode is enabled */}
        {isDevMode && (
          <>
            <Text style={styles.sectionTitle}>Developer</Text>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Ionicons name="megaphone-outline" size={24} color="#212529" />
                  <Text style={styles.settingLabel}>Show Ads</Text>
                </View>
                <Switch
                  value={devSettings.adsEnabled}
                  onValueChange={setAdsEnabled}
                  trackColor={{ false: Colors.gray200, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <TouchableOpacity
                style={[styles.settingItem, styles.settingItemLast]}
                onPress={handleDisableDevMode}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="exit-outline" size={24} color="#e53935" />
                  <Text style={[styles.settingLabel, { color: "#e53935" }]}>
                    Disable Developer Mode
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      {showAd && <AdBanner unitId={SETTINGS_BANNER_AD_UNIT_ID} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
    paddingHorizontal: 20,
    marginBottom: 24,
    color: Colors.textPrimary,
  },
  subscriptionSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  proBadgeText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  settingsList: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
