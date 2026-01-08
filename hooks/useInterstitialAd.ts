import { AD_STORAGE_KEYS } from "../constants/ads";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Platform, StatusBar } from "react-native";
import {
  AdEventType,
  InterstitialAd,
} from "react-native-google-mobile-ads";

interface UseInterstitialAdProps {
  adUnitId: string;
  onOpen?: () => void;
  onClose?: () => void;
}

const AD_LOAD_TIMEOUT = 10000; // 10 seconds timeout

const useInterstitialAd = ({
  adUnitId,
  onOpen,
  onClose,
}: UseInterstitialAdProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoShow, setShouldAutoShow] = useState(false);
  const ad = useRef<InterstitialAd | null>(null);
  const unsubscribeLoaded = useRef<(() => void) | null>(null);
  const unsubscribeOpened = useRef<(() => void) | null>(null);
  const unsubscribeClosed = useRef<(() => void) | null>(null);
  const unsubscribeError = useRef<(() => void) | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const destroy = (resetAutoShow = true) => {
    if (unsubscribeLoaded.current) unsubscribeLoaded.current();
    if (unsubscribeOpened.current) unsubscribeOpened.current();
    if (unsubscribeClosed.current) unsubscribeClosed.current();
    if (unsubscribeError.current) unsubscribeError.current();

    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    ad.current = null;
    setIsLoaded(false);
    setIsLoading(false);
    if (resetAutoShow) {
      setShouldAutoShow(false);
    }
  };

  const load = async () => {
    try {
      destroy(false); // Don't reset autoShow when loading
      console.log("[useInterstitialAd] Starting ad load");
      setIsLoading(true);

      const permission = await AsyncStorage.getItem(
        AD_STORAGE_KEYS.TRACKING_PERMISSION
      );

      ad.current = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: permission !== "true",
      });

      console.log("[useInterstitialAd] Ad instance created");

      unsubscribeLoaded.current = ad.current.addAdEventListener(
        AdEventType.LOADED,
        () => {
          console.log("[useInterstitialAd] Ad loaded successfully");
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          setIsLoaded(true);
          setIsLoading(false);
        }
      );

      unsubscribeOpened.current = ad.current.addAdEventListener(
        AdEventType.OPENED,
        () => {
          if (Platform.OS === "ios") {
            StatusBar.setHidden(true);
          } else if (Platform.OS === "android") {
            StatusBar.setTranslucent(true);
            StatusBar.setBackgroundColor("transparent");
          }
          onOpen?.();
        }
      );

      unsubscribeClosed.current = ad.current.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          if (Platform.OS === "ios") {
            StatusBar.setHidden(false);
          } else if (Platform.OS === "android") {
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor("#000000");
          }
          onClose?.();
          destroy();
        }
      );

      unsubscribeError.current = ad.current.addAdEventListener(
        AdEventType.ERROR,
        (error) => {
          console.error("[useInterstitialAd] Ad error:", error);
          if (Platform.OS === "android") {
            StatusBar.setTranslucent(false);
            StatusBar.setBackgroundColor("#000000");
          }
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
          }
          onClose?.();
          destroy();
        }
      );

      // Set timeout for ad loading
      loadTimeoutRef.current = setTimeout(() => {
        console.warn("[useInterstitialAd] Ad load timeout reached");
        if (Platform.OS === "android") {
          StatusBar.setTranslucent(false);
          StatusBar.setBackgroundColor("#000000");
        }
        onClose?.();
        destroy();
      }, AD_LOAD_TIMEOUT);

      ad.current.load();
      console.log("[useInterstitialAd] Loading ad...");
    } catch (error) {
      setIsLoading(false);
      console.error("[useInterstitialAd] Error loading ad:", error);
      if (Platform.OS === "android") {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor("#000000");
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      onClose?.();
      destroy();
    }
  };

  const play = async () => {
    if (isLoaded && ad.current) {
      console.log("[useInterstitialAd] Playing preloaded ad");
      ad.current.show();
      return true;
    } else if (!isLoading && !isLoaded) {
      console.log("[useInterstitialAd] Ad not loaded, loading and auto-showing");
      setShouldAutoShow(true);
      await load();
      return false;
    } else if (isLoading) {
      console.log("[useInterstitialAd] Ad is loading, will auto-show when ready");
      setShouldAutoShow(true);
      return false;
    }
    return false;
  };

  useEffect(() => {
    if (isLoaded && ad.current && shouldAutoShow) {
      console.log("[useInterstitialAd] Auto-showing loaded ad");
      ad.current.show();
      setShouldAutoShow(false);
    }
  }, [isLoaded, shouldAutoShow]);

  useEffect(() => {
    return destroy;
  }, []);

  const cancel = () => {
    console.log("[useInterstitialAd] Cancelling ad");
    if (Platform.OS === "android") {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor("#000000");
    }
    onClose?.();
    destroy();
  };

  return {
    isLoading,
    isLoaded,
    load,
    play,
    cancel,
  };
};

export default useInterstitialAd;
