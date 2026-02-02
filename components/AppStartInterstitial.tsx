import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { AppConfig } from "../config/app.config";
import { useRevenueCat } from "../contexts/RevenueCatContext";
import { useDevSettings } from "../contexts/DevSettingsContext";
import useInterstitialAd from "../hooks/useInterstitialAd";
import { INTERSTITIAL_AD_UNIT_ID } from "../constants/ads";

interface AppStartInterstitialProps {
  children: React.ReactNode;
}

export default function AppStartInterstitial({
  children,
}: AppStartInterstitialProps) {
  const { isProMember, isLoading: isSubscriptionLoading } = useRevenueCat();
  const { devSettings } = useDevSettings();
  const [adShown, setAdShown] = useState(false);
  const [adRequested, setAdRequested] = useState(false);
  const [splashScreenHidden, setSplashScreenHidden] = useState(false);

  // iOS에서 프리미엄 사용자인 경우 전면광고를 스킵
  const shouldSkipAd = Platform.OS === "ios" && isProMember;

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

      // 구독 로딩 중이면 대기
      if (isSubscriptionLoading) {
        return;
      }

      // 프리미엄 사용자면 광고 스킵
      if (shouldSkipAd) {
        console.log("[AppStartInterstitial] Premium user, skipping ad");
        setAdShown(true);
        if (!splashScreenHidden) {
          SplashScreen.hideAsync();
          setSplashScreenHidden(true);
        }
        return;
      }

      // 비프리미엄 사용자: 광고 로드 및 표시
      console.log("[AppStartInterstitial] Non-premium user, loading and showing ad");
      setAdRequested(true); // 중복 호출 방지
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
  }, [adShown, adRequested, isSubscriptionLoading, shouldSkipAd, isAdEnabled, splashScreenHidden, play]);

  // 광고가 표시되기 전까지 앱 콘텐츠를 숨김
  if (!adShown) {
    return null;
  }

  return <>{children}</>;
}
