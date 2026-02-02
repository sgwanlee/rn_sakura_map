import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppConfig } from "../config/app.config";
import { submitFeedback as submitFeedbackToFirestore, FeedbackInput } from "../utils/feedback";

const RATE_LIMIT_KEY = "feedback_rate_limit";
const HOUR_IN_MS = 60 * 60 * 1000;

interface RateLimitData {
  submissions: number[];
}

interface UseFeedbackReturn {
  submitFeedback: (data: FeedbackInput) => Promise<boolean>;
  isSubmitting: boolean;
  canSubmit: boolean;
  cooldownSeconds: number;
  error: string | null;
  clearError: () => void;
}

export default function useFeedback(): UseFeedbackReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem(RATE_LIMIT_KEY);
      const now = Date.now();

      if (!stored) {
        setCanSubmit(true);
        setCooldownSeconds(0);
        return true;
      }

      const data: RateLimitData = JSON.parse(stored);
      const validSubmissions = data.submissions.filter(
        (timestamp) => now - timestamp < HOUR_IN_MS
      );

      if (validSubmissions.length >= AppConfig.feedback.maxSubmissionsPerHour) {
        const oldestValidSubmission = Math.min(...validSubmissions);
        const cooldownEndTime = oldestValidSubmission + HOUR_IN_MS;
        const remainingMs = cooldownEndTime - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);

        setCanSubmit(false);
        setCooldownSeconds(remainingSeconds);
        return false;
      }

      setCanSubmit(true);
      setCooldownSeconds(0);
      return true;
    } catch (err) {
      console.error("[useFeedback] Error checking rate limit:", err);
      setCanSubmit(true);
      return true;
    }
  }, []);

  const recordSubmission = async (): Promise<void> => {
    try {
      const stored = await AsyncStorage.getItem(RATE_LIMIT_KEY);
      const now = Date.now();
      let data: RateLimitData = { submissions: [] };

      if (stored) {
        data = JSON.parse(stored);
        // Clean up old submissions
        data.submissions = data.submissions.filter(
          (timestamp) => now - timestamp < HOUR_IN_MS
        );
      }

      data.submissions.push(now);
      await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("[useFeedback] Error recording submission:", err);
    }
  };

  const submitFeedback = async (input: FeedbackInput): Promise<boolean> => {
    setError(null);

    // Check rate limit before submission
    const allowed = await checkRateLimit();
    if (!allowed) {
      setError(`Rate limit exceeded. Please wait ${cooldownSeconds} seconds.`);
      return false;
    }

    setIsSubmitting(true);

    try {
      await submitFeedbackToFirestore(input);
      await recordSubmission();
      await checkRateLimit();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit feedback";
      setError(errorMessage);
      console.error("[useFeedback] Submit error:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check rate limit on mount and periodically
  useEffect(() => {
    checkRateLimit();

    const interval = setInterval(() => {
      if (!canSubmit) {
        checkRateLimit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [canSubmit, checkRateLimit]);

  return {
    submitFeedback,
    isSubmitting,
    canSubmit,
    cooldownSeconds,
    error,
    clearError,
  };
}
