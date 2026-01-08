import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { AppConfig } from "../config/app.config";
import AdBanner from "../components/AdBanner";
import { HOME_BANNER_AD_UNIT_ID } from "../constants/ads";
import { useRevenueCat } from "../contexts/RevenueCatContext";

export default function HomeScreen() {
  const { isProMember } = useRevenueCat();
  const hideForSubscriber = AppConfig.admob.hideAdsForSubscribers && isProMember;
  const showAd =
    AppConfig.features.admob &&
    AppConfig.admob.banner.enabled &&
    AppConfig.admob.banner.showOnHome &&
    !hideForSubscriber;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="auto" />
      <View style={styles.content}>
        <Image
          source={require("../assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{AppConfig.appName}</Text>
        <Text style={styles.subtitle}>{AppConfig.appTagline}</Text>
      </View>
      {showAd && <AdBanner unitId={HOME_BANNER_AD_UNIT_ID} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
