/**
 * Sentry error tracking utility
 *
 * Setup required:
 * 1. Create a Sentry project at https://sentry.io/
 * 2. Set EXPO_PUBLIC_SENTRY_DSN environment variable
 */

import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { AppConfig } from "../config/app.config";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const APP_SLUG =
  Constants.expoConfig?.slug ||
  Constants.manifest2?.extra?.expoClient?.slug ||
  "unknown_app";
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";

export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log("[Sentry] DSN not set, skipping initialization");
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    release: `${APP_SLUG}@${APP_VERSION}`,
  });
}

export { Sentry };
