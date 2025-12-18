import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>🌾 مستشار الزراعة الذكي لمصر</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 استشارات زراعية</Text>
          <Text style={styles.cardSubtitle}>
            أدخل بيانات مزرعتك للحصول على أفضل التوصيات
          </Text>

          <TextInput
            style={styles.input}
            placeholder="المحصول المستهدف (قمح، بطاطس، مانجو)"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="حجم الأرض (مثال: 5 فدان)"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="نوع التربة (طينية، رملية، صفراء)"
            placeholderTextColor="#999"
          />

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryText}>احصل على التقرير</Text>
          </Pressable>

          <Pressable>
            <Text style={styles.secondaryText}>مسح</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eef7ee",
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
  },
  cardSubtitle: {
    color: "#666",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryText: {
    textAlign: "center",
    color: "#888",
    marginTop: 10,
  },
});
