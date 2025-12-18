import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MarketScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>💰 إدارة الموارد والسوق</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Pressable style={styles.smallCard}>
              <Ionicons name="water" size={28} color="#2e7d32" />
              <Text style={styles.smallText}>الري الذكي</Text>
            </Pressable>

            <Pressable style={styles.smallCard}>
              <Ionicons name="stats-chart" size={28} color="#2e7d32" />
              <Text style={styles.smallText}>تحليل السوق</Text>
            </Pressable>
          </View>

          <Text style={styles.chatTitle}>🎙️ مساعد الدردشة باللغة العربية</Text>

          <TextInput
            style={styles.chatInput}
            placeholder="مرحبًا، كيف يمكنني مساعدتك في مزرعتك؟"
            placeholderTextColor="#999"
            multiline
          />

          <Pressable style={styles.sendButton}>
            <Ionicons name="send" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef7ee" },
  container: { padding: 16, paddingTop: 10 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  smallCard: {
    width: "48%",
    backgroundColor: "#f1f8e9",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  smallText: { marginTop: 8, fontSize: 14 },
  chatTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  chatInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
  },
  sendButton: {
    backgroundColor: "#2e7d32",
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: 10,
  },
});
