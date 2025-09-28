import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import { useGetLaunchpadQuery } from "../services/spacexApi";
import { calculateDistanceKm } from "../common/useCommonFunctions";

type Props = {
  route: {
    params: {
      launch: { launchpad: string };
    };
  };
};

export default function LaunchDetailsScreen({ route }: Props) {
  const { launch } = route.params;

  const {
    data: pad,
    isLoading: loadingPad,
    error,
  } = useGetLaunchpadQuery(launch.launchpad);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  // Fetch user location once when component mounts
  useEffect(() => {
    (async () => {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Location permission denied.");
        setLoadingLocation(false);
        return;
      }
      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch {
        alert("Unable to access your location.");
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  // Calculate distance only after pad and user location are available
  useEffect(() => {
    if (
      pad &&
      pad.latitude != null &&
      pad.longitude != null &&
      userLocation &&
      userLocation.latitude != null &&
      userLocation.longitude != null
    ) {
      const dist = calculateDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        pad.latitude,
        pad.longitude
      );
      setDistanceKm(dist);
    }
  }, [pad, userLocation]);

  if (loadingPad || loadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  if (error || !pad || pad.latitude == null || pad.longitude == null) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>
          {error
            ? "Failed to load launchpad data."
            : "Invalid launchpad coordinates."}
        </Text>
      </View>
    );
  }

  const userMarkerScript = userLocation
    ? `
      var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: greenIcon }).addTo(map).bindPopup('Your Location');
    `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <style>
          html, body, #map {margin:0; height:100%; background-color:#fff;}
          .leaflet-popup-content-wrapper {background:#fff; color:#000;}
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <script>
          var map = L.map('map').setView([${pad.latitude}, ${pad.longitude}], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          L.marker([${pad.latitude}, ${pad.longitude}]).addTo(map).bindPopup('${pad.name}').openPopup();

          ${userMarkerScript}
        </script>
      </body>
    </html>
  `;

  const openInMaps = () => {
    const label = encodeURIComponent(pad.name);
    const url =
      Platform.select({
        ios: `http://maps.apple.com/?ll=${pad.latitude},${pad.longitude}&q=${label}`,
        android: `https://www.google.com/maps/dir/?api=1&destination=${pad.latitude},${pad.longitude}&travelmode=driving`,
      }) || "";
    Linking.openURL(url);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{pad.name}</Text>
        <Text style={styles.fullName}>{pad.full_name}</Text>
        {pad.images.large?.length > 0 && (
          <Image
            source={{ uri: pad.images.large[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={styles.location}>
          {pad.locality}, {pad.region}
        </Text>
        <Text style={styles.status}>
          {pad.status.charAt(0).toUpperCase() + pad.status.slice(1)}
        </Text>
        <Text style={styles.distance}>
          {distanceKm !== null
            ? `Distance: ${distanceKm.toFixed(1)} km`
            : "Distance not available"}
        </Text>
        <Text style={styles.details}>{pad.details}</Text>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          nestedScrollEnabled={true}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      </View>
      <TouchableOpacity style={styles.mapButton} onPress={openInMaps}>
        <Text style={styles.mapButtonText}>Open in Maps App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", marginTop: 8, textAlign: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6, color: "#222" },
  fullName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 12,
  },
  image: { width: "100%", height: 200, borderRadius: 14, marginBottom: 12 },
  location: { fontSize: 16, color: "#444", fontWeight: "500", marginBottom: 4 },
  status: {
    fontSize: 16,
    color: "#2977F7",
    fontWeight: "700",
    marginBottom: 10,
  },
  distance: { fontSize: 15, color: "#000", marginBottom: 14 },
  details: { fontSize: 15, color: "#222", marginBottom: 24 },
  mapButton: {
    backgroundColor: "#2977F7",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  mapButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  mapContainer: {
    height: 350,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 30,
  },
  map: { flex: 1 },
});
