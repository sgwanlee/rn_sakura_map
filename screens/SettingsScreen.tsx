import React from "react";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useDevSettings } from "../contexts/DevSettingsContext";
import { AppConfig } from "../config/app.config";
import useStoreReview from "../hooks/useStoreReview";
import Colors from "../constants/colors";
import UpdateButton from "../components/UpdateButton";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const DEV_MODE_TAP_COUNT = 7;

export default function SettingsScreen() {
  const { isAvailable: isReviewAvailable, requestReview } = useStoreReview();
  const { isDevMode, devSettings, setAdsEnabled, toggleDevMode } = useDevSettings();
  const [versionTapCount, setVersionTapCount] = React.useState(0);

  const showReviewOption = AppConfig.storeReview.enabled && isReviewAvailable;

  const handleContact = async () => {
    const subject = encodeURIComponent(`[${AppConfig.appName}] 문의`);
    const body = encodeURIComponent(
      `\n\n---\nApp Version: ${APP_VERSION}\nPlatform: ${Platform.OS}`
    );
    const mailtoUrl = `mailto:${AppConfig.contactEmail}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      Alert.alert("오류", "메일 앱을 열 수 없습니다.");
    }
  };

  const handleVersionTap = () => {
    const nextCount = versionTapCount + 1;
    setVersionTapCount(nextCount);

    if (nextCount >= DEV_MODE_TAP_COUNT) {
      toggleDevMode();
      setVersionTapCount(0);
      Alert.alert(
        "개발자 모드",
        isDevMode ? "개발자 모드를 종료했습니다." : "개발자 모드를 활성화했습니다."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>마이페이지</Text>
        <Text style={styles.subtitle}>
          벚꽃지도 설정과 앱 정보를 한 곳에서 관리하세요.
        </Text>

        <UpdateButton />

        <Text style={styles.sectionTitle}>앱 설정</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleVersionTap}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={Colors.primaryDark}
                />
              </View>
              <Text style={styles.rowLabel}>앱 버전</Text>
            </View>
            <Text style={styles.rowValue}>{APP_VERSION}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, !showReviewOption && styles.rowLast]}
            onPress={handleContact}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="mail-outline" size={20} color={Colors.primaryDark} />
              </View>
              <Text style={styles.rowLabel}>문의하기</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>

          {showReviewOption && (
            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={requestReview}>
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name="star-outline" size={20} color={Colors.primaryDark} />
                </View>
                <Text style={styles.rowLabel}>리뷰 남기기</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
            </TouchableOpacity>
          )}
        </View>

        {isDevMode && (
          <>
            <Text style={styles.sectionTitle}>개발자 옵션</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="megaphone-outline" size={20} color={Colors.primaryDark} />
                  </View>
                  <Text style={styles.rowLabel}>광고 표시</Text>
                </View>
                <Switch
                  value={devSettings.adsEnabled}
                  onValueChange={setAdsEnabled}
                  trackColor={{ false: Colors.gray300, true: Colors.primaryLight }}
                  thumbColor={devSettings.adsEnabled ? Colors.primaryDark : Colors.white}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 66,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
});
