import { useCallback, useEffect, useState } from "react";
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig, StoreReviewFrequency } from "../config/app.config";

const STORAGE_KEY = "@store_review_last_shown";

const getMillisecondsForFrequency = (
  frequency: StoreReviewFrequency
): number => {
  switch (frequency) {
    case "one_time":
      return Infinity;
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case "monthly":
      return 30 * 24 * 60 * 60 * 1000; // 30 days
    default:
      return Infinity;
  }
};

interface UseStoreReviewReturn {
  isAvailable: boolean;
  canRequestReview: boolean;
  requestReview: () => Promise<boolean>;
  requestReviewIfAvailable: () => Promise<boolean>;
  openStorePage: () => Promise<void>;
}

const useStoreReview = (): UseStoreReviewReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [canRequestReview, setCanRequestReview] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!AppConfig.storeReview.enabled) {
        setIsAvailable(false);
        setCanRequestReview(false);
        return;
      }

      const available = await StoreReview.isAvailableAsync();
      setIsAvailable(available);

      if (available) {
        const canRequest = await checkCanRequest();
        setCanRequestReview(canRequest);
      }
    };

    checkAvailability();
  }, []);

  const checkCanRequest = async (): Promise<boolean> => {
    const frequency = AppConfig.storeReview.frequency;
    const lastShownStr = await AsyncStorage.getItem(STORAGE_KEY);

    if (!lastShownStr) {
      return true;
    }

    const lastShown = parseInt(lastShownStr, 10);
    const now = Date.now();
    const intervalMs = getMillisecondsForFrequency(frequency);

    return now - lastShown >= intervalMs;
  };

  const markAsShown = async (): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEY, Date.now().toString());
    setCanRequestReview(false);
  };

  const requestReview = useCallback(async (): Promise<boolean> => {
    if (!AppConfig.storeReview.enabled) {
      console.log("[useStoreReview] Store review is disabled in config");
      return false;
    }

    const available = await StoreReview.isAvailableAsync();
    if (!available) {
      console.log("[useStoreReview] Store review is not available");
      return false;
    }

    try {
      await StoreReview.requestReview();
      await markAsShown();
      console.log("[useStoreReview] Review requested successfully");
      return true;
    } catch (error) {
      console.error("[useStoreReview] Error requesting review:", error);
      return false;
    }
  }, []);

  const requestReviewIfAvailable = useCallback(async (): Promise<boolean> => {
    if (!AppConfig.storeReview.enabled) {
      console.log("[useStoreReview] Store review is disabled in config");
      return false;
    }

    const available = await StoreReview.isAvailableAsync();
    if (!available) {
      console.log("[useStoreReview] Store review is not available");
      return false;
    }

    const canRequest = await checkCanRequest();
    if (!canRequest) {
      console.log(
        `[useStoreReview] Cannot request review yet (frequency: ${AppConfig.storeReview.frequency})`
      );
      return false;
    }

    try {
      await StoreReview.requestReview();
      await markAsShown();
      console.log("[useStoreReview] Review requested successfully");
      return true;
    } catch (error) {
      console.error("[useStoreReview] Error requesting review:", error);
      return false;
    }
  }, []);

  const openStorePage = useCallback(async (): Promise<void> => {
    const hasAction = await StoreReview.hasAction();
    if (hasAction) {
      await StoreReview.requestReview();
    }
  }, []);

  return {
    isAvailable,
    canRequestReview,
    requestReview,
    requestReviewIfAvailable,
    openStorePage,
  };
};

export default useStoreReview;
