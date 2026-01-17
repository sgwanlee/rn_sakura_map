import React, { useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { HOME_BANNER_AD_UNIT_ID } from "../constants/ads";
import { useDevSettings } from "../contexts/DevSettingsContext";

interface AdBannerProps {
  unitId?: string;
}

// Get banner height based on device width
// Standard banner heights: 50 (phones), 90 (tablets)
const getBannerHeight = () => {
  const { width } = Dimensions.get("window");
  if (width >= 728) return 90; // Leaderboard for tablets
  return 50; // Standard banner for phones
};

const AdBanner: React.FC<AdBannerProps> = ({
  unitId = HOME_BANNER_AD_UNIT_ID,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const { devSettings } = useDevSettings();
  const bannerHeight = getBannerHeight();

  // Hide ads when disabled in dev settings
  if (!devSettings.adsEnabled) {
    return null;
  }

  const handleAdLoaded = () => {
    console.log("[AdBanner] Banner ad loaded successfully");
    setAdLoaded(true);
    setAdError(false);
  };

  const handleAdFailedToLoad = (error: any) => {
    console.error("[AdBanner] Banner ad failed to load:", error);
    setAdError(true);
    setAdLoaded(false);
  };

  // Return placeholder with fixed height even if there's an error
  // This prevents layout shift
  if (adError) {
    return <View style={[styles.container, { height: bannerHeight }]} />;
  }

  return (
    <View
      style={[
        styles.container,
        {
          minHeight: bannerHeight,
          height: adLoaded ? "auto" : bannerHeight,
        },
      ]}
    >
      {/* Placeholder skeleton while loading */}
      {!adLoaded && (
        <View
          style={[
            styles.placeholder,
            {
              height: bannerHeight,
            },
          ]}
        />
      )}
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  placeholder: {
    position: "absolute",
    width: "100%",
    backgroundColor: "#f0f0f0",
    opacity: 0.3,
  },
});

export default AdBanner;
