import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { REGIONS, type Region } from "../constants/spots";
import { useSpots } from "../hooks/useSpots";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "개최": { bg: "#E8F5E9", text: "#2E7D32" },
  "개최예정": { bg: "#E3F2FD", text: "#1565C0" },
  "취소": { bg: "#FFEBEE", text: "#C62828" },
  "연기 후 개최": { bg: "#FFF3E0", text: "#E65100" },
};

const DEFAULT_STATUS_COLOR = { bg: Colors.gray100, text: Colors.textSecondary };

export default function FestivalScreen() {
  const { spots, loading } = useSpots();
  const [selectedRegion, setSelectedRegion] = useState<Region | "전체">("전체");

  const festivals = useMemo(() => {
    return spots
      .filter((spot) => spot.festivalName && spot.festivalName.length > 0)
      .filter(
        (spot) => selectedRegion === "전체" || spot.region === selectedRegion
      );
  }, [spots, selectedRegion]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={festivals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={Colors.primaryDark}
                />
              </View>
              <Text style={styles.headerTitle}>축제 일정</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionTabs}
            >
              {(["전체", ...REGIONS] as const).map((region) => {
                const isActive = region === selectedRegion;
                return (
                  <Pressable
                    key={region}
                    style={[
                      styles.regionTab,
                      isActive && styles.regionTabActive,
                    ]}
                    onPress={() => setSelectedRegion(region as Region | "전체")}
                  >
                    <Text
                      style={[
                        styles.regionTabText,
                        isActive && styles.regionTabTextActive,
                      ]}
                    >
                      {region}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => {
          const statusColor =
            STATUS_COLORS[item.festivalStatus] || DEFAULT_STATUS_COLOR;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && item.link ? { opacity: 0.6 } : undefined,
              ]}
              onPress={
                item.link
                  ? () => Linking.openURL(item.link)
                  : undefined
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.festivalName}
                </Text>
                <View style={styles.cardHeaderRight}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
                  >
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {item.festivalStatus}
                    </Text>
                  </View>
                  {item.link ? (
                    <Ionicons
                      name="open-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                  ) : null}
                </View>
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {item.title} · {item.region}
                  </Text>
                </View>

                {item.festivalPeriod ? (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.infoText}>{item.festivalPeriod}</Text>
                  </View>
                ) : null}

                {item.festivalFee ? (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="ticket-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.infoText}>{item.festivalFee}</Text>
                  </View>
                ) : null}

                {item.festivalTime ? (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.infoText}>{item.festivalTime}</Text>
                  </View>
                ) : null}
              </View>

              {item.festivalNote ? (
                <Text style={styles.noteText}>{item.festivalNote}</Text>
              ) : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={Colors.primaryDark} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>축제 정보가 없습니다</Text>
              <Text style={styles.emptyDescription}>
                해당 지역의 축제 정보를 준비 중입니다.
              </Text>
            </View>
          )
        }
        ListFooterComponent={<View style={styles.footerSpace} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  regionTabs: {
    paddingBottom: 12,
    gap: 10,
  },
  regionTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  regionTabActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
  },
  regionTabText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  regionTabTextActive: {
    color: Colors.primaryDark,
    fontWeight: "800",
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    marginBottom: 10,
    shadowColor: "#2f1a1f",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  noteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: Colors.textSecondary,
  },
  footerSpace: {
    height: 16,
  },
});
