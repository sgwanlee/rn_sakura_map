import { useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AppConfig } from "../config/app.config";
import { useDevSettings } from "../contexts/DevSettingsContext";
import useInterstitialAd from "../hooks/useInterstitialAd";
import { INTERSTITIAL_AD_UNIT_ID } from "../constants/ads";

interface AppStartInterstitialProps {
  children: React.ReactNode;
}

export default function AppStartInterstitial({
  children,
}: AppStartInterstitialProps) {
  const { devSettings } = useDevSettings();
  const [adShown, setAdShown] = useState(false);
  const [adRequested, setAdRequested] = useState(false);
  const [splashScreenHidden, setSplashScreenHidden] = useState(false);

  const isAdEnabled =
    AppConfig.features.admob &&
    AppConfig.admob.interstitial.enabled &&
    AppConfig.admob.interstitial.showOnAppStart &&
    devSettings.adsEnabled;

  const { play } = useInterstitialAd({
    adUnitId: INTERSTITIAL_AD_UNIT_ID,
    onOpen: () => {
      console.log("[AppStartInterstitial] Ad opened");
      // Hide splash screen when ad opens
      if (!splashScreenHidden) {
        SplashScreen.hideAsync();
        setSplashScreenHidden(true);
      }
    },
    onClose: () => {
      console.log("[AppStartInterstitial] Ad closed");
      setAdShown(true);
    },
  });

  // 광고 표시 로직
  useEffect(() => {
    const showAdIfNeeded = async () => {
      // 이미 광고를 요청했거나 표시했으면 스킵
      if (adShown || adRequested) {
        return;
      }

      // 광고가 비활성화되어 있으면 바로 스킵
      if (!isAdEnabled) {
        console.log("[AppStartInterstitial] Ads disabled, skipping");
        setAdShown(true);
        if (!splashScreenHidden) {
          SplashScreen.hideAsync();
          setSplashScreenHidden(true);
        }
        return;
      }

      console.log("[AppStartInterstitial] Loading app-start interstitial");
      setAdRequested(true);
      try {
        await play();
      } catch (error) {
        console.error("[AppStartInterstitial] Failed to play ad:", error);
        setAdShown(true);
        if (!splashScreenHidden) {
          SplashScreen.hideAsync();
          setSplashScreenHidden(true);
        }
      }
    };

    showAdIfNeeded();
  }, [adShown, adRequested, isAdEnabled, splashScreenHidden, play]);

  // 광고 중에도 children을 렌더링(데이터 프리로딩)하되 화면에 보이지 않게 함
  return (
    <View style={{ flex: 1 }}>
      {!adShown && (
        <View style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
          {children}
        </View>
      )}
      {adShown && children}
    </View>
  );
}
