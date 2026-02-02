import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/colors";
import useFeedbackList from "../hooks/useFeedbackList";
import { Feedback, FeedbackType } from "../utils/feedback";

export default function FeedbackListScreen() {
  const navigation = useNavigation();
  const {
    feedbackList,
    isLoading,
    error,
    refresh,
    filterByType,
    currentFilter,
    totalCount,
    bugCount,
    ideaCount,
  } = useFeedbackList();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderFilterButton = (
    type: FeedbackType | "all",
    label: string,
    count: number
  ) => (
    <TouchableOpacity
      style={[styles.filterButton, currentFilter === type && styles.filterButtonActive]}
      onPress={() => filterByType(type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          currentFilter === type && styles.filterButtonTextActive,
        ]}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderFeedbackItem = ({ item }: { item: Feedback }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <View style={styles.feedbackMeta}>
          <View
            style={[
              styles.typeBadge,
              item.type === "bug" ? styles.typeBadgeBug : styles.typeBadgeIdea,
            ]}
          >
            <Ionicons
              name={item.type === "bug" ? "bug-outline" : "bulb-outline"}
              size={14}
              color={Colors.white}
            />
            <Text style={styles.typeBadgeText}>
              {item.type === "bug" ? "버그" : "아이디어"}
            </Text>
          </View>
          <Text style={styles.nickname}>{item.nickname}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>

      <Text style={styles.content}>{item.content}</Text>

      <View style={styles.feedbackFooter}>
        <Text style={styles.footerText}>
          {item.platform} · v{item.appVersion}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbox-outline" size={64} color={Colors.gray300} />
      <Text style={styles.emptyStateText}>아직 피드백이 없습니다</Text>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>피드백 목록</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "전체", totalCount)}
        {renderFilterButton("bug", "버그", bugCount)}
        {renderFilterButton("idea", "아이디어", ideaCount)}
      </View>

      {/* Error State */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feedback List */}
      <FlatList
        data={feedbackList}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedbackItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: Colors.white,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.errorLight,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  feedbackCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  feedbackMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeBadgeBug: {
    backgroundColor: Colors.error,
  },
  typeBadgeIdea: {
    backgroundColor: Colors.success,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  nickname: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: Colors.gray400,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  feedbackFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    color: Colors.gray400,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.gray400,
    marginTop: 16,
  },
});
