import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useRouter } from "expo-router";
import { diagnoseCrop } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

export default function DiagnoseScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState<"wheat" | "potato" | "mango">("wheat");

  const router = useRouter();

  const pickCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return alert("يجب السماح باستخدام الكاميرا");
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const pickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const handleDiagnose = async () => {
    if (!image) return alert("الرجاء اختيار صورة");

    try {
      setLoading(true);
      const result = await diagnoseCrop({
        imageUri: image,
        crop: crop,
      });

      router.push({
        pathname: "/result",
        params: { data: JSON.stringify(result) },
      });
    } catch {
      alert("حدث خطأ أثناء التشخيص");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>تشخيص أمراض المحاصيل</Text>
        <Text style={styles.sub}>اختر المحصول ثم التقط صورة واضحة للورقة</Text>

        <View style={styles.card}>
          {/* Crop Selector */}
          <Text style={styles.sectionTitle}>🌱 اختر المحصول</Text>
          <View style={styles.cropRow}>
            <Pressable
              style={[styles.cropBtn, crop === "wheat" && styles.cropActive]}
              onPress={() => setCrop("wheat")}
            >
              <Text
                style={[
                  styles.cropText,
                  crop === "wheat" && styles.cropTextActive,
                ]}
              >
                قمح
              </Text>
            </Pressable>

            <Pressable
              style={[styles.cropBtn, crop === "potato" && styles.cropActive]}
              onPress={() => setCrop("potato")}
            >
              <Text
                style={[
                  styles.cropText,
                  crop === "potato" && styles.cropTextActive,
                ]}
              >
                بطاطس
              </Text>
            </Pressable>

            <Pressable
              style={[styles.cropBtn, crop === "mango" && styles.cropActive]}
              onPress={() => setCrop("mango")}
            >
              <Text
                style={[
                  styles.cropText,
                  crop === "mango" && styles.cropTextActive,
                ]}
              >
                مانجو
              </Text>
            </Pressable>
          </View>

          {/* Image Box */}
          <View style={styles.imageBox}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Ionicons name="leaf" size={70} color="#2e7d32" />
            )}
          </View>

          {/* Pick Buttons */}
          <View style={styles.row}>
            <Pressable style={styles.smallBtn} onPress={pickCamera}>
              <Text>📸 كاميرا</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={pickGallery}>
              <Text>🖼️ المعرض</Text>
            </Pressable>
          </View>

          {/* Diagnose Button */}
          <Pressable style={styles.mainBtn} onPress={handleDiagnose}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.mainText}>تشخيص الآن</Text>
            )}
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
    padding: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2e7d32",
    textAlign: "center",
    marginBottom: 6,
  },
  sub: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2e7d32",
  },
  cropRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cropBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#f1f8e9",
    alignItems: "center",
  },
  cropActive: {
    backgroundColor: "#2e7d32",
  },
  cropText: {
    fontWeight: "600",
    color: "#2e7d32",
  },
  cropTextActive: {
    color: "#fff",
  },
  imageBox: {
    height: 230,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2e7d32",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  smallBtn: {
    width: "48%",
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    alignItems: "center",
  },
  mainBtn: {
    backgroundColor: "#2e7d32",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  mainText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
