import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import * as Location from "expo-location";

export default function HomeScreen() {

  const [farmData, setFarmData] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [locationName, setLocationName] = useState("");

  // =====================
  // GET REAL GPS
  // =====================
  const getLocation = async () => {

    try {

      let { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {

        console.log("Permission denied");

        return null;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({});

      // Reverse geocoding
      const reverse =
        await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

      if (reverse.length > 0) {

        const city =
          reverse[0].city ||
          reverse[0].region ||
          "موقع غير معروف";

        setLocationName(city);
      }

      return currentLocation.coords;

    } catch (error) {

      console.log("GPS ERROR:", error);

      return null;
    }
  };

  // =====================
  // FETCH FARM STATUS
  // =====================
  const fetchFarmStatus = async () => {

    try {

      const coords = await getLocation();

      const lat = coords?.latitude || 30.0444;

      const lon = coords?.longitude || 31.2357;

      const response = await fetch(
        `http://192.168.1.18:8000/farm-status?crop=wheat&governorate=beheira&temp=30&humidity=70&lat=${lat}&lon=${lon}`
      );

      const data = await response.json();

      setFarmData(data);

    } catch (error) {

      console.log("API ERROR:", error);

    } finally {

      setLoading(false);

      setRefreshing(false);
    }
  };

  // =====================
  // REFRESH
  // =====================
  const onRefresh = () => {

    setRefreshing(true);

    fetchFarmStatus();
  };

  // =====================
  // INITIAL LOAD
  // =====================
  useEffect(() => {

    fetchFarmStatus();

  }, []);

  // =====================
  // LOADING
  // =====================
  if (loading) {

    return (

      <SafeAreaView style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#2e7d32"
        />

        <Text style={{ marginTop: 10 }}>
          جاري تحميل بيانات المزرعة...
        </Text>

      </SafeAreaView>
    );
  }

  // =====================
  // MAIN UI
  // =====================
  return (

    <SafeAreaView style={styles.safe}>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >

        {/* HEADER */}
        <View style={styles.header}>

          <Text style={styles.welcome}>
            أهلاً بك 👋
          </Text>

          <Text style={styles.title}>
            لوحة المزرعة الذكية 🌱
          </Text>

          {/* LOCATION */}
          <View style={styles.locationRow}>

            <Ionicons
              name="location"
              size={16}
              color="#666"
            />

            <Text style={styles.locationText}>
              {locationName || "جارٍ تحديد الموقع..."}
            </Text>

          </View>

        </View>

        {/* HEALTH CARD */}
        <View style={styles.healthCard}>

          <View style={styles.rowBetween}>

            <View>

              <Text style={styles.healthLabel}>
                حالة المزرعة
              </Text>

              <Text style={styles.healthValue}>
                {farmData?.farm_health}
              </Text>

            </View>

            <Ionicons
              name="leaf"
              size={42}
              color="#fff"
            />

          </View>

        </View>

        {/* SENSOR CARDS */}
        <View style={styles.cardsRow}>

          {/* SOIL */}
          <View style={styles.sensorCard}>

            <Ionicons
              name="water"
              size={30}
              color="#1565c0"
            />

            <Text style={styles.sensorTitle}>
              رطوبة التربة
            </Text>

            <Text style={styles.sensorValue}>
              {farmData?.soil_moisture}%
            </Text>

          </View>

          {/* TEMP */}
          <View style={styles.sensorCard}>

            <Ionicons
              name="thermometer"
              size={30}
              color="#ef6c00"
            />

            <Text style={styles.sensorTitle}>
              الحرارة
            </Text>

            <Text style={styles.sensorValue}>
              {farmData?.temperature}°
            </Text>

          </View>

        </View>

        {/* REGION */}
        <View style={styles.infoCard}>

          <View style={styles.cardHeader}>

            <Ionicons
              name="map"
              size={22}
              color="#2e7d32"
            />

            <Text style={styles.cardTitle}>
              المنطقة الزراعية
            </Text>

          </View>

          <Text style={styles.cardText}>
            {farmData?.region}
          </Text>

        </View>

        {/* AI ADVICE */}
        <View style={styles.adviceCard}>

          <View style={styles.cardHeader}>

            <Ionicons
              name="bulb"
              size={22}
              color="#f9a825"
            />

            <Text style={styles.cardTitle}>
              نصيحة ذكية
            </Text>

          </View>

          <Text style={styles.adviceText}>
            {farmData?.smart_advice}
          </Text>

        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actionsRow}>

          <Pressable style={styles.actionButton}>

            <Ionicons
              name="camera"
              size={24}
              color="#fff"
            />

            <Text style={styles.actionText}>
              تشخيص مرض
            </Text>

          </Pressable>

          <Pressable style={styles.actionButton}>

            <Ionicons
              name="chatbubble"
              size={24}
              color="#fff"
            />

            <Text style={styles.actionText}>
              المساعد الذكي
            </Text>

          </Pressable>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#f4f9f4",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginBottom: 25,
    alignItems: "flex-end",
  },

  welcome: {
    fontSize: 16,
    color: "#666",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1b5e20",
    marginTop: 5,
  },

  locationRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 8,
  },

  locationText: {
    marginRight: 6,
    color: "#666",
    fontSize: 14,
  },

  healthCard: {
    backgroundColor: "#2e7d32",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  rowBetween: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },

  healthLabel: {
    color: "#c8e6c9",
    fontSize: 15,
  },

  healthValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  cardsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  sensorCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 4,
  },

  sensorTitle: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },

  sensorValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  adviceCard: {
    backgroundColor: "#fffde7",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },

  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
    color: "#333",
  },

  cardText: {
    fontSize: 16,
    color: "#555",
    textAlign: "right",
  },

  adviceText: {
    fontSize: 15,
    lineHeight: 26,
    color: "#5d4037",
    textAlign: "right",
  },

  actionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },

  actionButton: {
    width: "48%",
    backgroundColor: "#1b5e20",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "bold",
  },
});