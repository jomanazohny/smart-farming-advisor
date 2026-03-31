import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
    if (!perm.granted) return Alert.alert("تنبيه", "يجب السماح باستخدام الكاميرا");
    const res = await ImagePicker.launchCameraAsync({ 
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1] 
    });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const pickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ 
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const handleDiagnose = async () => {
    if (!image) return Alert.alert("تنبيه", "الرجاء اختيار صورة أولاً");

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
      Alert.alert("خطأ", "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <Text style={styles.header}>تشخيص الأمراض الذكي</Text>
          <Text style={styles.sub}>التقط صورة واضحة للورقة المصابة للتحليل</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. حدد نوع المحصول</Text>
          <View style={styles.cropRow}>
            {["wheat", "potato", "mango"].map((item) => (
              <Pressable
                key={item}
                style={[styles.cropBtn, crop === item && styles.cropActive]}
                onPress={() => setCrop(item as any)}
              >
                <Text style={[styles.cropText, crop === item && styles.cropTextActive]}>
                  {item === "wheat" ? "🌾 قمح" : item === "potato" ? "🥔 بطاطس" : "🥭 مانجو"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>2. معاينة الصورة</Text>
          <View style={styles.imageContainer}>
            <View style={styles.imageFrame}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="camera-outline" size={50} color="#ccc" />
                  <Text style={styles.placeholderText}>لم يتم اختيار صورة</Text>
                </View>
              )}
              {/* Decorative Scanning Corners */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.iconBtn} onPress={pickCamera}>
              <Ionicons name="camera" size={24} color="#2e7d32" />
              <Text style={styles.iconBtnText}>الكاميرا</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.iconBtn} onPress={pickGallery}>
              <Ionicons name="images" size={24} color="#2e7d32" />
              <Text style={styles.iconBtnText}>المعرض</Text>
            </Pressable>
          </View>

          <Pressable 
            style={({pressed}) => [styles.mainBtn, pressed && styles.btnPressed]} 
            onPress={handleDiagnose}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.mainText}>بدء التحليل الذكي</Text>
                <Ionicons name="sparkles" size={20} color="#fff" style={{marginLeft: 10}} />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f9f4" },
  container: { padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: "800", color: "#1b5e20" },
  sub: { fontSize: 14, color: "#666", marginTop: 4 },
  
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12, textAlign: 'right' },
  cropRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 25 },
  cropBtn: { 
    width: "31%", 
    paddingVertical: 12, 
    borderRadius: 12, 
    backgroundColor: "#f8fdf8", 
    borderWidth: 1, 
    borderColor: "#e8f5e9", 
    alignItems: "center" 
  },
  cropActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  cropText: { fontSize: 14, fontWeight: "600", color: "#2e7d32" },
  cropTextActive: { color: "#fff" },

  imageContainer: { alignItems: 'center', marginBottom: 20 },
  imageFrame: { 
    width: "100%", 
    height: 250, 
    backgroundColor: "#fafafa", 
    borderRadius: 20, 
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  image: { width: "100%", height: "100%" },
  placeholder: { alignItems: 'center' },
  placeholderText: { marginTop: 10, color: "#ccc", fontSize: 14 },
  
  // Scanning Corner Styles
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#2e7d32', borderWidth: 3 },
  topLeft: { top: 15, left: 15, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 15, right: 15, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 15, left: 15, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 15, right: 15, borderLeftWidth: 0, borderTopWidth: 0 },

  actionRow: { 
    flexDirection: 'row', 
    backgroundColor: '#f8fdf8', 
    borderRadius: 15, 
    padding: 10, 
    marginBottom: 20,
    alignItems: 'center'
  },
  iconBtn: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  iconBtnText: { marginLeft: 8, fontWeight: '600', color: '#2e7d32' },
  divider: { width: 1, height: 20, backgroundColor: '#e0e0e0' },

  mainBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  mainText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});