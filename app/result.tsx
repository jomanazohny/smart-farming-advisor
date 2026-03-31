import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ResultScreen() {
  const { data } = useLocalSearchParams();
  const router = useRouter();

  if (!data) return null;

  // Safe parsing
  let r;
  try {
    r = JSON.parse(data as string);
  } catch (e) {
    return <Text>Error loading data</Text>;
  }

  const disease = r.disease_name || "غير معروف";
  const confidence = Number(r.confidence) || 0;
  const explanation = r.arabic_explanation || {};

  const cause = explanation["السبب"] || "غير متوفر";
  const treatment = explanation["العلاج"] || "غير متوفر";
  const prevention = explanation["الوقاية"] || "غير متوفر";

  const isHigh = confidence >= 70;
  const isMedium = confidence >= 40 && confidence < 70;

  return (
    <SafeAreaView style={styles.safe}>
      {/* 🟢 CUSTOM HEADER */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backCircle}>
          <Ionicons name="chevron-forward" size={28} color="#2e7d32" />
        </Pressable>
        <Text style={styles.headerTitle}>تحليل الذكاء الاصطناعي</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 📈 CONFIDENCE METER */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>دقة التشخيص</Text>
            <Text style={[styles.statusValue, { color: isHigh ? "#2e7d32" : "#f57c00" }]}>
              {confidence.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${confidence}%`, backgroundColor: isHigh ? "#2e7d32" : "#fbc02d" }]} />
          </View>
        </View>

        {/* 🦠 MAIN RESULT */}
        <View style={styles.resultCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="bug" size={30} color="#fff" />
          </View>
          <Text style={styles.resultLabel}>الحالة المكتشفة:</Text>
          <Text style={styles.resultName}>{disease}</Text>
        </View>

        {/* 📋 DETAILED BREAKDOWN */}
        <View style={styles.detailsSection}>
          
          <DetailCard 
            icon="alert-circle" 
            title="السبب المحتمل" 
            value={cause} 
            color="#d32f2f" 
          />

          {(isHigh || isMedium) && (
            <DetailCard 
              icon="medkit" 
              title="العلاج المقترح" 
              value={treatment} 
              color="#2e7d32" 
            />
          )}

          {isHigh && (
            <DetailCard 
              icon="shield-checkmark" 
              title="خطوات الوقاية" 
              value={prevention} 
              color="#1976d2" 
            />
          )}

          {!isHigh && (
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={20} color="#666" />
              <Text style={styles.warningText}>
                نوصي بإعادة التصوير في إضاءة أفضل للحصول على دقة أعلى.
              </Text>
            </View>
          )}
        </View>

        {/* 🔄 ACTION BUTTON */}
        <Pressable style={styles.doneBtn} onPress={() => router.replace("/")}>
          <Text style={styles.doneBtnText}>العودة للرئيسية</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

// 🎨 COMPONENT FOR DETAILS
function DetailCard({ icon, title, value, color }: any) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHead}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.infoTitle, { color: color }]}>{title}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f9f4" },
  headerBar: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f7f0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1b5e20" },
  container: { padding: 20 },
  
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  statusRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 12 },
  statusLabel: { fontSize: 14, color: "#666", fontWeight: "600" },
  statusValue: { fontSize: 18, fontWeight: "800" },
  progressBg: { height: 8, backgroundColor: "#eee", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },

  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#e8f5e9",
    elevation: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  resultLabel: { fontSize: 14, color: "#888", marginBottom: 5 },
  resultName: { fontSize: 24, fontWeight: "900", color: "#2e7d32", textAlign: "center" },

  detailsSection: { gap: 15 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderRightWidth: 5,
  },
  infoHead: { flexDirection: "row-reverse", alignItems: "center", marginBottom: 8 },
  infoTitle: { fontWeight: "800", marginRight: 10, fontSize: 16 },
  infoValue: { color: "#444", textAlign: "right", lineHeight: 22, fontSize: 15 },

  warningBox: {
    flexDirection: "row-reverse",
    backgroundColor: "#fff9c4",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  warningText: { flex: 1, marginRight: 10, fontSize: 13, color: "#5d4037", textAlign: "right" },

  doneBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  doneBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});