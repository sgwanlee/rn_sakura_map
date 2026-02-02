import { useState, useEffect, useCallback } from "react";
import { getAllFeedback, getFeedbackByType, Feedback, FeedbackType } from "../utils/feedback";

interface UseFeedbackListReturn {
  feedbackList: Feedback[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  filterByType: (type: FeedbackType | "all") => void;
  currentFilter: FeedbackType | "all";
  totalCount: number;
  bugCount: number;
  ideaCount: number;
}

export default function useFeedbackList(): UseFeedbackListReturn {
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FeedbackType | "all">("all");

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllFeedback();
      setAllFeedback(data);
      setFeedbackList(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load feedback";
      setError(errorMessage);
      console.error("[useFeedbackList] Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchFeedback();
    // Re-apply current filter after refresh
    if (currentFilter !== "all") {
      const filtered = allFeedback.filter((f) => f.type === currentFilter);
      setFeedbackList(filtered);
    }
  }, [fetchFeedback, currentFilter, allFeedback]);

  const filterByType = useCallback(
    (type: FeedbackType | "all") => {
      setCurrentFilter(type);
      if (type === "all") {
        setFeedbackList(allFeedback);
      } else {
        const filtered = allFeedback.filter((f) => f.type === type);
        setFeedbackList(filtered);
      }
    },
    [allFeedback]
  );

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const bugCount = allFeedback.filter((f) => f.type === "bug").length;
  const ideaCount = allFeedback.filter((f) => f.type === "idea").length;

  return {
    feedbackList,
    isLoading,
    error,
    refresh,
    filterByType,
    currentFilter,
    totalCount: allFeedback.length,
    bugCount,
    ideaCount,
  };
}
