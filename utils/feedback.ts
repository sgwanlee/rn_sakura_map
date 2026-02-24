import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { AppConfig } from "../config/app.config";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const APP_NAME = Constants.expoConfig?.name ?? AppConfig.appName;
const FEEDBACK_COLLECTION = "feedback";

const FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FEEDBACK_FIREBASE_PROJECT_ID ?? "";
const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FEEDBACK_FIREBASE_API_KEY ?? "";

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export type FeedbackType = "bug" | "idea";

export interface Feedback {
  id: string;
  nickname: string;
  type: FeedbackType;
  content: string;
  createdAt: Date;
  platform: "ios" | "android" | "web";
  appName: string;
  appVersion: string;
  deviceModel: string;
  osVersion: string;
}

export interface FeedbackInput {
  nickname: string;
  type: FeedbackType;
  content: string;
}

function getPlatform(): "ios" | "android" | "web" {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

// Firestore REST API helpers
function toFirestoreValue(value: string | number | boolean | Date): Record<string, string> {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: String(value) };
  if (typeof value === "boolean") return { booleanValue: String(value) };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  return { stringValue: String(value) };
}

function fromFirestoreValue(field: Record<string, string>): string | number | boolean | Date | null {
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number(field.integerValue);
  if ("doubleValue" in field) return Number(field.doubleValue);
  if ("booleanValue" in field) return field.booleanValue === "true";
  if ("timestampValue" in field) return new Date(field.timestampValue);
  if ("nullValue" in field) return null;
  return null;
}

function extractDocId(name: string): string {
  return name.split("/").pop() ?? "";
}

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const { nickname, type, content } = input;

  // Validate input
  if (
    nickname.length < AppConfig.feedback.nicknameMinLength ||
    nickname.length > AppConfig.feedback.nicknameMaxLength
  ) {
    throw new Error(
      `Nickname must be between ${AppConfig.feedback.nicknameMinLength} and ${AppConfig.feedback.nicknameMaxLength} characters`
    );
  }

  if (
    content.length < AppConfig.feedback.contentMinLength ||
    content.length > AppConfig.feedback.contentMaxLength
  ) {
    throw new Error(
      `Content must be between ${AppConfig.feedback.contentMinLength} and ${AppConfig.feedback.contentMaxLength} characters`
    );
  }

  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    throw new Error("Feedback Firebase project not configured");
  }

  const url = `${FIRESTORE_BASE_URL}/${FEEDBACK_COLLECTION}?key=${FIREBASE_API_KEY}`;

  const body = {
    fields: {
      nickname: toFirestoreValue(nickname.trim()),
      type: toFirestoreValue(type),
      content: toFirestoreValue(content.trim()),
      createdAt: toFirestoreValue(new Date()),
      platform: toFirestoreValue(getPlatform()),
      appName: toFirestoreValue(APP_NAME),
      appVersion: toFirestoreValue(APP_VERSION),
      deviceModel: toFirestoreValue(Device.modelName ?? "Unknown"),
      osVersion: toFirestoreValue(`${Platform.OS} ${Device.osVersion ?? "Unknown"}`),
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error?.message ?? `Firestore API error: ${response.status}`
      );
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Feedback submission timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  // Send Slack notification
  await sendSlackNotification(input);
}

async function sendSlackNotification(input: FeedbackInput): Promise<void> {
  const webhookUrl = AppConfig.feedback.slackWebhookUrl;

  if (!webhookUrl) {
    console.log("[Feedback] Slack webhook URL not configured, skipping notification");
    return;
  }

  const emoji = input.type === "bug" ? "\u{1F41B}" : "\u{1F4A1}";
  const typeLabel = input.type === "bug" ? "버그 리포트" : "아이디어 제안";

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji} 새 ${typeLabel} (v${APP_VERSION})`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*닉네임:*\n${input.nickname}`,
          },
          {
            type: "mrkdwn",
            text: `*플랫폼:*\n${getPlatform()}`,
          },
          {
            type: "mrkdwn",
            text: `*기기:*\n${Device.modelName ?? "Unknown"}`,
          },
          {
            type: "mrkdwn",
            text: `*OS:*\n${Platform.OS} ${Device.osVersion ?? "Unknown"}`,
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: input.content,
        },
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    console.log("[Feedback] Slack notification sent successfully");
  } catch (error) {
    console.error("[Feedback] Failed to send Slack notification:", error);
  }
}

interface FirestoreDocument {
  name: string;
  fields: Record<string, Record<string, string>>;
}

function parseDocument(doc: FirestoreDocument): Feedback {
  const fields = doc.fields;
  return {
    id: extractDocId(doc.name),
    nickname: (fromFirestoreValue(fields.nickname) as string) ?? "",
    type: (fromFirestoreValue(fields.type) as FeedbackType) ?? "bug",
    content: (fromFirestoreValue(fields.content) as string) ?? "",
    createdAt: (fromFirestoreValue(fields.createdAt) as Date) ?? new Date(),
    platform: (fromFirestoreValue(fields.platform) as "ios" | "android" | "web") ?? "web",
    appName: (fromFirestoreValue(fields.appName) as string) ?? "",
    appVersion: (fromFirestoreValue(fields.appVersion) as string) ?? "",
    deviceModel: (fromFirestoreValue(fields.deviceModel) as string) ?? "",
    osVersion: (fromFirestoreValue(fields.osVersion) as string) ?? "",
  };
}

export async function getAllFeedback(): Promise<Feedback[]> {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    throw new Error("Feedback Firebase project not configured");
  }

  // Use structured query to order by createdAt desc
  const url = `${FIRESTORE_BASE_URL}:runQuery?key=${FIREBASE_API_KEY}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: FEEDBACK_COLLECTION }],
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message ?? `Firestore API error: ${response.status}`
    );
  }

  const results: Array<{ document?: FirestoreDocument }> = await response.json();
  return results
    .filter((r) => r.document)
    .map((r) => parseDocument(r.document!));
}

export async function getFeedbackByType(type: FeedbackType): Promise<Feedback[]> {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    throw new Error("Feedback Firebase project not configured");
  }

  const url = `${FIRESTORE_BASE_URL}:runQuery?key=${FIREBASE_API_KEY}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: FEEDBACK_COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: "type" },
          op: "EQUAL",
          value: { stringValue: type },
        },
      },
      orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error?.message ?? `Firestore API error: ${response.status}`
    );
  }

  const results: Array<{ document?: FirestoreDocument }> = await response.json();
  return results
    .filter((r) => r.document)
    .map((r) => parseDocument(r.document!));
}
