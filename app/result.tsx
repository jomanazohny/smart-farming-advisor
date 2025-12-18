import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ResultScreen() {
  const { data } = useLocalSearchParams();
  if (!data) return null;

  const r = JSON.parse(data as string);
  const confidence = Number(r.confidence) || 0;

  const confidenceLevel =
    confidence >= 70 ? "high" : confidence >= 40 ? "medium" : "low";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#2e7d32" />
          </Pressable>
          <Text style={styles.header}>نتيجة التشخيص</Text>
        </View>

        {/* Confidence always visible */}
        <Card
          title="📊 نسبة الثقة"
          value={`${confidence}%`}
          highlight={confidenceLevel === "high"}
        />

        {/* LOW CONFIDENCE */}
        {confidenceLevel === "low" && (
          <>
            <Card
              title="🦠 المرض المحتمل"
              value={r.disease || "غير محدد"}
            />
            <Card
              title="⚠️ ملاحظة مهمة"
              value="الثقة في هذا التشخيص منخفضة. قد تكون الصورة غير واضحة أو لا تظهر أعراضًا كافية."
            />
            <Card
              title="📌 ماذا يمكنك فعله؟"
              value="أعد التقاط صورة واضحة في إضاءة جيدة، مع التركيز على الورقة المصابة، أو استشر مهندسًا زراعيًا للحصول على تشخيص أدق."
            />
          </>
        )}

        {/* MEDIUM CONFIDENCE */}
        {confidenceLevel === "medium" && (
          <>
            <Card
              title="🦠 المرض المحتمل"
              value={r.disease}
            />
            <Card
              title="❗ أسباب محتملة"
              value={
                r.cause ||
                "قد يكون ناتجًا عن إجهاد نباتي، رطوبة زائدة، أو نقص عناصر غذائية."
              }
            />
            <Card
              title="💊 نصائح عامة"
              value="راقب النبات خلال الأيام القادمة، حسّن التهوية والري، ويمكن استخدام علاج وقائي عام."
            />
          </>
        )}

        {/* HIGH CONFIDENCE */}
        {confidenceLevel === "high" && (
          <>
            <Card title="🦠 المرض" value={r.disease} />
            <Card title="❗ السبب" value={r.cause} />
            <Card title="💊 العلاج" value={r.treatment} />
            <Card title="🛡️ الوقاية" value={r.prevention} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({
  title,
  value,
  highlight,
}: {
  title: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#eef7ee",
  },
  container: {
    padding: 16,
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  highlight: {
    borderWidth: 2,
    borderColor: "#2e7d32",
  },
  title: {
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 6,
  },
  value: {
    color: "#444",
    lineHeight: 22,
  },
});
