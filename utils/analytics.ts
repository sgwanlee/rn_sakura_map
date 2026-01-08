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

// Development mode flag - set to false in production
const IS_DEV = __DEV__;

/**
 * Log a custom event to Firebase Analytics
 */
export async function logEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  try {
    if (IS_DEV) {
      console.log(`[Analytics] ${eventName}:`, params);
    }
    await analytics().logEvent(eventName, params);
  } catch (error) {
    // Silently fail in production, log in dev
    if (IS_DEV) {
      console.warn("[Analytics] Failed to log event:", error);
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
  try {
    if (IS_DEV) {
      console.log(`[Analytics] Screen View: ${screenName}`);
    }
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    if (IS_DEV) {
      console.warn("[Analytics] Failed to log screen view:", error);
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
