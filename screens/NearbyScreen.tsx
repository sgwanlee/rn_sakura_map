import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  type Region,
} from "@mj-studio/react-native-naver-map";
import { Ionicons } from "@expo/vector-icons";
import { AppConfig } from "../config/app.config";
import { useDevSettings } from "../contexts/DevSettingsContext";
import AdBanner from "../components/AdBanner";
import { HOME_BANNER_AD_UNIT_ID } from "../constants/ads";
import Colors from "../constants/colors";
import { BLOOM_FORECAST, type CherrySpot, type Region as SpotRegion } from "../constants/spots";
import { useSpots } from "../hooks/useSpots";

const KOREA_CENTER: Region = {
  latitude: 36.5,
  longitude: 127.5,
  latitudeDelta: 4,
  longitudeDelta: 4,
};

export default function NearbyScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { devSettings } = useDevSettings();
  const { spots, loading } = useSpots();
  const mapRef = useRef<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<CherrySpot | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const initialSpotHandled = useRef(false);

  // HomeScreen에서 넘어온 spotId로 카메라 즉시 이동
  useEffect(() => {
    const spotId = route.params?.spotId;
    if (!spotId || spots.length === 0 || !mapRef.current || initialSpotHandled.current) return;

    const spot = spots.find((s) => s.id === spotId);
    if (!spot || spot.latitude === 0) return;

    setSelectedSpot(spot);
    initialSpotHandled.current = true;
    mapRef.current.animateCameraTo({
      latitude: spot.latitude,
      longitude: spot.longitude,
      zoom: 14,
      duration: 0,
    });
    setMapReady(true);
  }, [route.params?.spotId, spots]);

  const handleMarkerTap = useCallback((spot: CherrySpot) => {
    setSelectedSpot(spot);
  }, []);

  const handleMapTap = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  const openMap = (mapUrl: string) => {
    Linking.openURL(mapUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>벚꽃 지도</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mapContainer}>
        {!mapReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primaryDark} />
          </View>
        )}
        <NaverMapView
          ref={mapRef}
          style={styles.map}
          initialRegion={KOREA_CENTER}
          isShowLocationButton={false}
          isShowZoomControls={false}
          isShowScaleBar={false}
          isExtentBoundedInKorea
          onInitialized={() => {
            if (!route.params?.spotId) setMapReady(true);
          }}
          onTapMap={handleMapTap}
        >
          {spots.filter((s) => s.latitude !== 0).map((spot) => (
            <NaverMapMarkerOverlay
              key={spot.id}
              latitude={spot.latitude}
              longitude={spot.longitude}
              anchor={{ x: 0.5, y: 1 }}
              width={56}
              height={66}
              minZoom={0}
              isMinZoomInclusive
              isMaxZoomInclusive
              isHideCollidedMarkers={false}
              isForceShowIcon
              onTap={() => handleMarkerTap(spot)}
              image={require("../assets/icon.png")}
            />
          ))}
        </NaverMapView>

      </View>

      {selectedSpot && (
        <View style={styles.spotCard}>
          <View style={styles.spotInfo}>
            <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
            <Text style={styles.spotSubRegion}>
              {selectedSpot.region} · {selectedSpot.subRegion}
            </Text>
            <View style={styles.spotFooter}>
              <View style={styles.bloomBadge}>
                <Ionicons name="flower-outline" size={12} color={Colors.primaryDark} />
                <Text style={styles.bloomText}>
                  개화 {BLOOM_FORECAST[selectedSpot.region as SpotRegion].bloom}
                </Text>
              </View>
              <View style={styles.buttonGroup}>
                {selectedSpot.link ? (
                  <Pressable
                    style={styles.detailButton}
                    onPress={() => Linking.openURL(selectedSpot.link)}
                  >
                    <Ionicons name="information-circle-outline" size={14} color={Colors.primaryDark} />
                    <Text style={styles.detailButtonText}>자세히</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={styles.mapButton}
                  onPress={() => openMap(selectedSpot.mapUrl)}
                >
                  <Ionicons name="navigate-outline" size={14} color={Colors.white} />
                  <Text style={styles.mapButtonText}>길찾기</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}

      {AppConfig.features.admob &&
        AppConfig.admob.banner.enabled &&
        devSettings.adsEnabled && (
          <View style={styles.bannerWrap}>
            <AdBanner unitId={HOME_BANNER_AD_UNIT_ID} />
          </View>
        )}
      <View style={styles.bottomSafeArea} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 32,
  },
  mapContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  map: {
    flex: 1,
  },
  spotCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    shadowColor: "#2f1a1f",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  spotInfo: {
    gap: 6,
  },
  spotTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  spotSubRegion: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  spotFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  bloomBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.primarySoft,
  },
  bloomText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primaryDark,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  detailButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.primaryDark,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.primaryDark,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.white,
  },
  bannerWrap: {
    backgroundColor: Colors.white,
  },
  bottomSafeArea: {
    backgroundColor: Colors.white,
  },
});
