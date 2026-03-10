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
import { useRoute } from "@react-navigation/native";
import * as Location from "expo-location";
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  type Region,
} from "@mj-studio/react-native-naver-map";
import { Ionicons } from "@expo/vector-icons";
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
  const route = useRoute<any>();
  const { spots, loading } = useSpots();
  const mapRef = useRef<any>(null);
  const [selectedSpot, setSelectedSpot] = useState<CherrySpot | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  // HomeScreen에서 넘어온 spotId로 카메라 이동
  useEffect(() => {
    const spotId = route.params?.spotId;
    if (!spotId || spots.length === 0 || !mapRef.current) return;

    const spot = spots.find((s) => s.id === spotId);
    if (!spot || spot.latitude === 0) return;

    setSelectedSpot(spot);
    mapRef.current.animateCameraTo({
      latitude: spot.latitude,
      longitude: spot.longitude,
      zoom: 14,
    });
  }, [route.params?.spotId, spots]);

  const handleMarkerTap = useCallback((spot: CherrySpot) => {
    setSelectedSpot(spot);
  }, []);

  const handleMapTap = useCallback(() => {
    setSelectedSpot(null);
  }, []);

  const moveToMyLocation = useCallback(() => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateCameraTo({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      zoom: 13,
    });
  }, [userLocation]);

  const openMap = (mapUrl: string) => {
    Linking.openURL(mapUrl);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 주변 벚꽃</Text>
      </View>

      <View style={styles.mapContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primaryDark} />
          </View>
        )}
        <NaverMapView
          ref={mapRef}
          style={styles.map}
          initialRegion={
            userLocation
              ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                }
              : KOREA_CENTER
          }
          isShowLocationButton={false}
          isShowZoomControls={false}
          isShowScaleBar={false}
          isExtentBoundedInKorea
          onTapMap={handleMapTap}
        >
          {spots.filter((s) => s.latitude !== 0).map((spot) => (
            <NaverMapMarkerOverlay
              key={spot.id}
              latitude={spot.latitude}
              longitude={spot.longitude}
              anchor={{ x: 0.5, y: 1 }}
              width={44}
              height={52}
              minZoom={0}
              isMinZoomInclusive
              isMaxZoomInclusive
              onTap={() => handleMarkerTap(spot)}
              image={require("../assets/icon.png")}
            />
          ))}
        </NaverMapView>

        {userLocation && (
          <Pressable style={styles.myLocationButton} onPress={moveToMyLocation}>
            <Ionicons name="locate" size={22} color={Colors.primaryDark} />
          </Pressable>
        )}
      </View>

      {selectedSpot && (
        <View style={styles.bottomSheet}>
          <View style={styles.spotCard}>
            <View style={styles.spotInfo}>
              <Text style={styles.spotTitle}>{selectedSpot.title}</Text>
              <Text style={styles.spotSubRegion}>
                {selectedSpot.region} · {selectedSpot.subRegion}
              </Text>
              <View style={styles.spotFooter}>
                <View style={styles.bloomBadge}>
                  <Ionicons name="sunny-outline" size={12} color={Colors.primaryDark} />
                  <Text style={styles.bloomText}>
                    {BLOOM_FORECAST[selectedSpot.region as SpotRegion]}
                  </Text>
                </View>
                <Pressable
                  style={styles.mapButton}
                  onPress={() => openMap(selectedSpot.mapUrl)}
                >
                  <Ionicons
                    name="navigate-outline"
                    size={14}
                    color={Colors.white}
                  />
                  <Text style={styles.mapButtonText}>길찾기</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.textPrimary,
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
  myLocationButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
  },
  spotCard: {
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
});
