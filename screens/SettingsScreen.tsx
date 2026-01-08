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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { useRevenueCat } from "../contexts/RevenueCatContext";
import { AppConfig } from "../config/app.config";
import Colors from "../constants/colors";
import AdBanner from "../components/AdBanner";
import { SETTINGS_BANNER_AD_UNIT_ID } from "../constants/ads";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { isProMember, restorePurchases } = useRevenueCat();
  const showSubscriptionFeatures = AppConfig.features.subscription;
  const showAd =
    AppConfig.features.admob &&
    AppConfig.admob.banner.enabled &&
    AppConfig.admob.banner.showOnSettings &&
    !isProMember;

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
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#212529"
              />
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.versionText}>{APP_VERSION}</Text>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={handleResetOnboarding}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-outline" size={24} color="#212529" />
              <Text style={styles.settingLabel}>View Onboarding Again</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
          </TouchableOpacity>
        </View>
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
