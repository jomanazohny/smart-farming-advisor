
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function HistoryScreen() {

  const [history, setHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // =====================
  // FETCH HISTORY
  // =====================
  const fetchHistory = async () => {

    try {

      const response = await fetch("http://192.168.1.18:8000/history/mobile_user");

      const data = await response.json();

      setHistory(data || []);

    } catch (error) {

      console.log("HISTORY ERROR:", error);

    } finally {

      setLoading(false);

      setRefreshing(false);
    }
  };

  // =====================
  // INITIAL LOAD
  // =====================
  useEffect(() => {

    fetchHistory();

  }, []);

  // =====================
  // REFRESH
  // =====================
  const onRefresh = () => {

    setRefreshing(true);

    fetchHistory();
  };

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
          جاري تحميل السجل...
        </Text>

      </SafeAreaView>
    );
  }

  // =====================
  // EMPTY STATE
  // =====================
  if (history.length === 0) {

    return (
      <SafeAreaView style={styles.emptyContainer}>

        <Ionicons
          name="time-outline"
          size={70}
          color="#bbb"
        />

        <Text style={styles.emptyText}>
          لا يوجد سجل تشخيصات حتى الآن
        </Text>

      </SafeAreaView>
    );
  }

  // =====================
  // MAIN UI
  // =====================
  return (

    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>
        سجل التشخيصات 🌱
      </Text>

      <FlatList
        data={history}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }

        keyExtractor={(item, index) =>
          item.created_at || index.toString()
        }

        renderItem={({ item }) => (

          <View style={styles.card}>

            {/* HEADER */}
            <View style={styles.cardHeader}>

              <View style={styles.dateRow}>

                <Ionicons
                  name="calendar"
                  size={14}
                  color="#888"
                />

                <Text style={styles.date}>
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "غير معروف"}
                </Text>

              </View>

              <Text style={styles.crop}>
                {item.crop}
              </Text>

            </View>

            {/* DISEASE */}
            <Text style={styles.disease}>
              {item.disease}
            </Text>

            {/* REGION */}
            <Text style={styles.region}>
              📍 {item.region}
            </Text>

            {/* CONFIDENCE */}
            <View style={styles.confidenceBox}>

              <Text style={styles.confidenceText}>
                الدقة: {Number(item.confidence).toFixed(1)}%
              </Text>

            </View>

            {/* EXPLANATION */}
            <Text style={styles.explanation}>
              {item.explanation}
            </Text>

          </View>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f4f9f4",
    padding: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f9f4",
  },

  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "#777",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1b5e20",
    marginBottom: 20,
    textAlign: "right",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    elevation: 4,
    borderRightWidth: 5,
    borderRightColor: "#2e7d32",
  },

  cardHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  crop: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#666",
  },

  dateRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },

  date: {
    marginRight: 5,
    fontSize: 12,
    color: "#999",
  },

  disease: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1b5e20",
    textAlign: "right",
    marginBottom: 8,
  },

  region: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginBottom: 10,
  },

  confidenceBox: {
    backgroundColor: "#e8f5e9",
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },

  confidenceText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },

  explanation: {
    color: "#444",
    lineHeight: 24,
    textAlign: "right",
  },
});
