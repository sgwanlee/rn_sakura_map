/**
 * Analytics utility module for Firebase Analytics
 *
 * Setup required:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Add iOS app and download GoogleService-Info.plist to project root
 * 3. Add Android app and download google-services.json to project root
 * 4. Update app.json to include Firebase plugin configuration
 */

import analytics from "@react-native-firebase/analytics";
import firestore from "@react-native-firebase/firestore";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { AppConfig } from "../config/app.config";

// Development mode flag - set to false in production
const IS_DEV = __DEV__;
const APP_SLUG =
  Constants.expoConfig?.slug ||
  Constants.manifest2?.extra?.expoClient?.slug ||
  "unknown_app";
const APP_NAME = Constants.expoConfig?.name || AppConfig.appName;
const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const EVENTS_COLLECTION = "analytics_events";

function getPlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

async function persistEventToFirestore(
  eventName: string,
  params: Record<string, string | number | boolean>
): Promise<void> {
  await firestore().collection(EVENTS_COLLECTION).add({
    event_name: eventName,
    params,
    app_slug: APP_SLUG,
    app_name: APP_NAME,
    app_version: APP_VERSION,
    platform: getPlatform(),
    created_at: firestore.FieldValue.serverTimestamp(),
    client_timestamp: new Date().toISOString(),
  });
}

/**
 * Log a custom event to Firebase Analytics
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const eventParams = {
    app_slug: APP_SLUG,
    ...params,
  };

  try {
    if (IS_DEV) {
      console.log(`[Analytics] ${eventName}:`, eventParams);
    }
    await analytics().logEvent(eventName, eventParams);
  } catch (error) {
    // Silently fail in production, log in dev
    if (IS_DEV) {
      console.warn("[Analytics] Failed to log event:", error);
    }
  }

  try {
    await persistEventToFirestore(eventName, eventParams);
  } catch (error) {
    if (IS_DEV) {
      console.warn("[Analytics] Failed to persist event to Firestore:", error);
    }
  }
}

/**
 * Log screen view event
 */
export async function logScreenView(
  screenName: string,
  screenClass?: string
): Promise<void> {
  const screenParams = {
    screen_name: screenName,
    screen_class: screenClass || screenName,
    app_slug: APP_SLUG,
  };

  try {
    if (IS_DEV) {
      console.log(`[Analytics] Screen View: ${screenName}`);
    }
    await analytics().logScreenView(screenParams);
  } catch (error) {
    if (IS_DEV) {
      console.warn("[Analytics] Failed to log screen view:", error);
    }
  }

  try {
    await persistEventToFirestore("screen_view", screenParams);
  } catch (error) {
    if (IS_DEV) {
      console.warn("[Analytics] Failed to persist screen view to Firestore:", error);
    }
  }
}

// ============================================
// Onboarding Events
// ============================================

export async function logOnboardingStepView(
  stepNumber: number,
  stepName: string
): Promise<void> {
  await logEvent("onboarding_step_view", {
    step_number: stepNumber,
    step_name: stepName,
  });
}

export async function logOnboardingComplete(completedAt: string): Promise<void> {
  await logEvent("onboarding_complete", {
    completed_at: completedAt,
  });
}

// ============================================
// Paywall Events
// ============================================

export async function logPaywallView(source: string): Promise<void> {
  await logEvent("paywall_view", { source });
}

export async function logPaywallPurchaseStarted(
  packageId: string
): Promise<void> {
  await logEvent("paywall_purchase_started", { package: packageId });
}

export async function logPaywallPurchaseSuccess(
  packageId: string
): Promise<void> {
  await logEvent("paywall_purchase_success", { package: packageId });
}

export async function logPaywallPurchaseFailed(
  packageId: string,
  error: string
): Promise<void> {
  await logEvent("paywall_purchase_failed", { package: packageId, error });
}

export async function logPaywallRestoreStarted(): Promise<void> {
  await logEvent("paywall_restore_started", {});
}

export async function logPaywallRestoreSuccess(): Promise<void> {
  await logEvent("paywall_restore_success", {});
}

export async function logPaywallRestoreFailed(error: string): Promise<void> {
  await logEvent("paywall_restore_failed", { error });
}

export async function logPaywallSkipped(): Promise<void> {
  await logEvent("paywall_skipped", {});
}

// ============================================
// Developer Settings Events
// ============================================

export async function logSubscriptionOverrideToggled(
  enabled: boolean
): Promise<void> {
  await logEvent("subscription_override_toggled", { enabled });
}
