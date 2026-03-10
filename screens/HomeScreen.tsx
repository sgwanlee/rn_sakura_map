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
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AppConfig } from "../config/app.config";
import AdBanner from "../components/AdBanner";
import { HOME_BANNER_AD_UNIT_ID } from "../constants/ads";
import { useDevSettings } from "../contexts/DevSettingsContext";
import Colors from "../constants/colors";
import { REGIONS, BLOOM_FORECAST, type Region } from "../constants/spots";
import { useSpots } from "../hooks/useSpots";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { devSettings } = useDevSettings();
  const { spots, loading } = useSpots();
  const [selectedRegion, setSelectedRegion] = useState<Region>("서울");
  const [query, setQuery] = useState("");

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim();

    return spots.filter((spot) => {
      const matchesRegion = spot.region === selectedRegion;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        spot.title.includes(normalizedQuery) ||
        spot.subRegion.includes(normalizedQuery);

      return matchesRegion && matchesQuery;
    });
  }, [query, selectedRegion, spots]);

  const showAd =
    AppConfig.features.admob &&
    AppConfig.admob.banner.enabled &&
    AppConfig.admob.banner.showOnHome &&
    devSettings.adsEnabled;

  const openMap = async (mapUrl: string) => {
    await Linking.openURL(mapUrl);
  };

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
              <Ionicons name="sunny-outline" size={16} color={Colors.primaryDark} />
              <Text style={styles.bloomForecastText}>
                개화 예상: {BLOOM_FORECAST[selectedRegion]}
              </Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.primaryDark} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="벚꽃 명소를 검색해보세요"
                placeholderTextColor={Colors.textSecondary}
                style={styles.searchInput}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("NearbyTab", { spotId: item.id })}
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
        ListFooterComponent={
          showAd ? (
            <View style={styles.bannerWrap}>
              <AdBanner unitId={HOME_BANNER_AD_UNIT_ID} />
            </View>
          ) : (
            <View style={styles.footerSpace} />
          )
        }
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
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
    marginBottom: 12,
  },
  bloomForecastText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
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
  bannerWrap: {
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  footerSpace: {
    height: 16,
  },
});
