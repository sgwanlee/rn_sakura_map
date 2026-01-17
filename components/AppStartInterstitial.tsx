import { useEffect, useRef } from "react";
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
  const { isProMember } = useRevenueCat();
  const { devSettings } = useDevSettings();
  const hasShownAd = useRef(false);

  const hideForSubscriber = AppConfig.admob.hideAdsForSubscribers && isProMember;
  const shouldShowAd =
    AppConfig.features.admob &&
    AppConfig.admob.interstitial.enabled &&
    AppConfig.admob.interstitial.showOnAppStart &&
    !hideForSubscriber &&
    devSettings.adsEnabled;

  const { play, isLoading } = useInterstitialAd({
    adUnitId: INTERSTITIAL_AD_UNIT_ID,
    onClose: () => {
      console.log("[AppStartInterstitial] Ad closed");
    },
  });

  useEffect(() => {
    if (shouldShowAd && !hasShownAd.current) {
      hasShownAd.current = true;
      // Small delay to ensure app is fully loaded
      const timer = setTimeout(() => {
        play();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowAd]);

  return <>{children}</>;
}
