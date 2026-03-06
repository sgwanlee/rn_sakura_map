import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { AppConfig } from "../config/app.config";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const APP_NAME = Constants.expoConfig?.name ?? AppConfig.appName;
const APP_SLUG =
  Constants.expoConfig?.slug ||
  Constants.manifest2?.extra?.expoClient?.slug ||
  "unknown_app";

const FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FEEDBACK_FIREBASE_PROJECT_ID ?? "";
const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FEEDBACK_FIREBASE_API_KEY ?? "";

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

function getPlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

function toFirestoreValue(
  value: string | number | boolean | Date
): Record<string, string> {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number")
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: String(value) };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value) };
}

/**
 * Log a document to a Firestore collection via REST API (feedback Firebase project).
 * Automatically includes common fields: appName, appSlug, appVersion, platform, deviceModel, osVersion, createdAt.
 */
export async function logToFirestore(
  collection: string,
  fields: Record<string, string | number | boolean | Date>
): Promise<void> {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    if (__DEV__) {
      console.log(`[FirestoreLogger] Firebase not configured, skipping ${collection} log`);
    }
    return;
  }

  const url = `${FIRESTORE_BASE_URL}/${collection}?key=${FIREBASE_API_KEY}`;

  const allFields: Record<string, Record<string, string>> = {
    appName: toFirestoreValue(APP_NAME),
    appSlug: toFirestoreValue(APP_SLUG),
    appVersion: toFirestoreValue(APP_VERSION),
    platform: toFirestoreValue(getPlatform()),
    deviceModel: toFirestoreValue(Device.modelName ?? "Unknown"),
    osVersion: toFirestoreValue(
      `${Platform.OS} ${Device.osVersion ?? "Unknown"}`
    ),
    createdAt: toFirestoreValue(new Date()),
  };

  for (const [key, value] of Object.entries(fields)) {
    allFields[key] = toFirestoreValue(value);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: allFields }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (__DEV__) {
        console.warn(
          `[FirestoreLogger] Failed to log to ${collection}:`,
          errorData?.error?.message ?? response.status
        );
      }
    } else if (__DEV__) {
      console.log(`[FirestoreLogger] Logged to ${collection}:`, fields);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[FirestoreLogger] Error logging to ${collection}:`, error);
    }
  }
}
