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
  Modal,
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
  const [showLicenseModal, setShowLicenseModal] = React.useState(false);
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

        {/* Feedback Section */}
        {AppConfig.feedback.enabled && (
          <>
            <Text style={styles.sectionTitle}>버그제보/아이디어제안</Text>
            <View style={styles.settingsList}>
              <TouchableOpacity
                style={[styles.settingItem, styles.settingItemLast]}
                onPress={() => navigation.navigate("Feedback")}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="#212529" />
                  <Text style={styles.settingLabel}>의견 보내기</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* License Section */}
        <Text style={styles.sectionTitle}>정보</Text>
        <View style={styles.settingsList}>
          <TouchableOpacity
            style={[styles.settingItem, styles.settingItemLast]}
            onPress={() => setShowLicenseModal(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color="#212529" />
              <Text style={styles.settingLabel}>라이선스</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
          </TouchableOpacity>
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
                style={styles.settingItem}
                onPress={() => navigation.navigate("FeedbackList")}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="list-outline" size={24} color="#212529" />
                  <Text style={styles.settingLabel}>피드백 목록 확인</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#adb5bd" />
              </TouchableOpacity>

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

      {/* License Modal */}
      <Modal
        visible={showLicenseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLicenseModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>라이선스</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLicenseModal(false)}
            >
              <Ionicons name="close" size={24} color="#212529" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.licenseTitle}>토스페이스 라이선스 전문</Text>

            <Text style={styles.licenseSectionTitle}>정의</Text>
            <Text style={styles.licenseText}>
              '토스페이스'는 본 라이선스에 입거해 저작권자가 배포하고 명확하게 같은 표시가 된 파일들의 집합을 뜻하며, 여기에는 소스 파일, 빌드 스크립트와 문서가 이에 포함됩니다.
            </Text>
            <Text style={styles.licenseText}>
              '원본'은 저작권자가 배포한 토스페이스 구성요소를 의미합니다.
            </Text>
            <Text style={styles.licenseText}>
              '수정본'은 포맷의 변경이나 토스페이스를 새로운 운영체제에 맞추어 변경하거나, 원본의 일부 혹은 전체에 추가, 삭제 대체해 만든 2차적 저작물을 의미합니다.
            </Text>
            <Text style={styles.licenseText}>
              '저자'는 토스페이스에 기여한 디자이너, 엔지니어, 프로그래머, 기술 전문가 등을 의미합니다.
            </Text>

            <Text style={styles.licenseSectionTitle}>전문</Text>
            <Text style={styles.licenseText}>
              토스페이스를 공개하는 목적은 다양한 사람들이 이모지 폰트를 활용할 수 있게 하고, 디자인 생태계의 발전에 기여하기 위함입니다.
            </Text>
            <Text style={styles.licenseText}>
              토스팀이 토스페이스를 자유롭게 이용하도록 허락하는 행위(이하 '이용허락')는 토스팀이 저작권을 양도하거나 포기하는 행위로 해석되지 않습니다.
            </Text>

            <Text style={styles.licenseSectionTitle}>허가 및 조건</Text>
            <Text style={styles.licenseText}>
              토스페이스는 그 자체를 판매하거나, 부정한 목적으로 이용하거나, 허용되지 않은 수정본을 만들지 않는 한 자유롭게 사용, 연구, 재배포 하실 수 있습니다.
            </Text>
            <Text style={styles.licenseText}>
              토스페이스의 원본은 '토스페이스 저작권 안내'와 본 라이선스 전문에 대한 내용을 포함하는 경우에는 다른 소프트웨어와 번들되거나 재배포가 가능합니다. 이는 별도 텍스트 파일과 가독성이 있는 헤더, 또는 (사용자가 쉽게 읽을 수 있다면) 기계가 읽을 수 있는 텍스트나 바이너리 파일의 메타데이터 필드 형태로도 가능합니다.
            </Text>
            <Text style={styles.licenseText}>
              토스페이스의 저작권자 혹은 저자의 이름은 그들의 명시적 서면 허가가 있거나 또는 그들의 공헌을 인정하기 위한 경우를 제외하고는 수정본에 대한 사용을 유도, 추천 혹은 광고하기 위한 목적으로 사용할 수 없습니다.
            </Text>

            <Text style={styles.licenseSectionTitle}>계약의 종료</Text>
            <Text style={styles.licenseText}>
              토스페이스 저작권 안내와 본 라이선스를 일부라도 위반할 경우 토스페이스에 대한 이용허락이 무효가 될 수 있습니다.
            </Text>

            <Text style={styles.licenseSectionTitle}>면책조항</Text>
            <Text style={styles.licenseText}>
              토스페이스는 저작권, 특허권, 상표권 및 기타 권리를 침해하지 않는다거나, 특정 목적에 적합하다는 등의 명시적, 묵시적인 어떠한 종류의 보증 없이 "있는 그대로" 제공됩니다. 어떠한 경우에도 저작권자는 토스페이스의 사용 또는 사용불가능 상태, 그 밖에 토스페이스의 취급과 관련하여 발생하는 모든 계약, 불법행위 혹은 다른 일로 하여금 발생하는 일반적, 특수적, 간접적, 부차적 혹은 필연적 손해를 포함하는 소송, 손해 혹은 기타 책임에 대한 의무를 부담하지 않습니다.
            </Text>

            <View style={styles.licenseBottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  licenseTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  licenseSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  licenseText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  licenseBottomSpacer: {
    height: 40,
  },
});
