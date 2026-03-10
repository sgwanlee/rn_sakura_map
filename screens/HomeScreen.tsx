import { useMemo, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";
import { REGIONS, BLOOM_FORECAST, type Region } from "../constants/spots";
import { useSpots } from "../hooks/useSpots";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { spots, loading } = useSpots();
  const [selectedRegion, setSelectedRegion] = useState<Region>("서울");
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => spot.region === selectedRegion);
  }, [selectedRegion, spots]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.logoBadge}>
                <Ionicons name="flower-outline" size={24} color={Colors.primaryDark} />
              </View>
              <Text style={styles.headerTitle}>벚꽃지도</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionTabs}
            >
              {REGIONS.map((region) => {
                const isActive = region === selectedRegion;
                return (
                  <Pressable
                    key={region}
                    style={[styles.regionTab, isActive && styles.regionTabActive]}
                    onPress={() => setSelectedRegion(region)}
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

            <View style={styles.bloomForecast}>
              <View style={styles.bloomRow}>
                <Ionicons name="flower-outline" size={14} color={Colors.primaryDark} />
                <Text style={styles.bloomLabel}>개화</Text>
                <Text style={styles.bloomValue}>{BLOOM_FORECAST[selectedRegion].bloom}</Text>
              </View>
              <View style={styles.bloomDivider} />
              <View style={styles.bloomRow}>
                <Ionicons name="sunny-outline" size={14} color={Colors.primaryDark} />
                <Text style={styles.bloomLabel}>만개</Text>
                <Text style={styles.bloomValue}>{BLOOM_FORECAST[selectedRegion].fullBloom}</Text>
              </View>
            </View>
            <Text style={styles.bloomNote}>{BLOOM_FORECAST[selectedRegion].note}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.6 }]}
            onPress={() => navigation.navigate("SpotMap", { spotId: item.id })}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="flower-outline" size={28} color={Colors.primaryDark} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubRegion}>{item.subRegion}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </Pressable>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={Colors.primaryDark} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
              <Text style={styles.emptyDescription}>
                다른 지역을 선택하거나 검색어를 바꿔보세요.
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
  bloomForecast: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    marginBottom: 6,
  },
  bloomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  bloomLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  bloomValue: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primaryDark,
  },
  bloomDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.primaryDark,
    opacity: 0.2,
    marginHorizontal: 12,
  },
  bloomNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primarySoft,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardSubRegion: {
    fontSize: 13,
    color: Colors.textSecondary,
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
