import firestore from "@react-native-firebase/firestore";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { AppConfig } from "../config/app.config";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";
const FEEDBACK_COLLECTION = "feedback";

export type FeedbackType = "bug" | "idea";

export interface Feedback {
  id: string;
  nickname: string;
  type: FeedbackType;
  content: string;
  createdAt: Date;
  platform: "ios" | "android" | "web";
  appVersion: string;
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

  const feedbackData = {
    nickname: nickname.trim(),
    type,
    content: content.trim(),
    createdAt: firestore.FieldValue.serverTimestamp(),
    platform: getPlatform(),
    appVersion: APP_VERSION,
  };

  // Submit to Firestore
  await firestore().collection(FEEDBACK_COLLECTION).add(feedbackData);

  // Send Slack notification
  await sendSlackNotification(input);
}

async function sendSlackNotification(input: FeedbackInput): Promise<void> {
  const webhookUrl = AppConfig.feedback.slackWebhookUrl;

  if (!webhookUrl) {
    console.log("[Feedback] Slack webhook URL not configured, skipping notification");
    return;
  }

  const emoji = input.type === "bug" ? "🐛" : "💡";
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    console.log("[Feedback] Slack notification sent successfully");
  } catch (error) {
    console.error("[Feedback] Failed to send Slack notification:", error);
    // Don't throw - Slack notification failure shouldn't fail the feedback submission
  }
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const snapshot = await firestore()
    .collection(FEEDBACK_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nickname: data.nickname,
      type: data.type,
      content: data.content,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      platform: data.platform,
      appVersion: data.appVersion,
    };
  });
}

export async function getFeedbackByType(type: FeedbackType): Promise<Feedback[]> {
  const snapshot = await firestore()
    .collection(FEEDBACK_COLLECTION)
    .where("type", "==", type)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      nickname: data.nickname,
      type: data.type,
      content: data.content,
      createdAt: data.createdAt?.toDate() ?? new Date(),
      platform: data.platform,
      appVersion: data.appVersion,
    };
  });
}
