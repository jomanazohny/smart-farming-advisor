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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { diagnoseCrop } from "@/services/api"; // تأكد من تحديث ملف api.ts أيضاً
import { Ionicons } from "@expo/vector-icons";

export default function DiagnoseScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState<"wheat" | "potato" | "mango">("wheat");

  // 📊 حالات البيانات البيئية (المهمة لنموذج v4)
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [age, setAge] = useState("");

  const router = useRouter();

  // فتح الكاميرا
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

  // فتح المعرض
  const pickGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ 
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1]
    });
    
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  // إرسال البيانات للتشخيص
  const handleDiagnose = async () => {
    if (!image) return Alert.alert("تنبيه", "الرجاء اختيار صورة أولاً");
    if (!temp || !humidity || !age) {
      return Alert.alert("تنبيه", "الرجاء إدخال كافة البيانات البيئية لضمان دقة التشخيص");
    }

    try {
      setLoading(true);
      
      // إرسال الصورة + المتغيرات الثلاثة (temp, humidity, age)
      const result = await diagnoseCrop({
        imageUri: image,
        temp: parseFloat(temp),
        humidity: parseFloat(humidity),
        age: parseFloat(age),
      });

      // الانتقال لصفحة النتائج مع البيانات المستلمة
      router.push({
        pathname: "/result",
        params: { data: JSON.stringify(result) },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "فشل الاتصال بالسيرفر. تأكد من تشغيل الكمبيوتر وصحة الـ IP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* رأس الصفحة */}
          <View style={styles.headerSection}>
            <Text style={styles.header}>التشخيص الذكي المتكامل</Text>
            <Text style={styles.sub}>أدخل بيانات البيئة والتقط الصورة للتحليل العميق</Text>
          </View>

          <View style={styles.card}>
            
            {/* 1. اختيار المحصول */}
            <Text style={styles.sectionTitle}>1. نوع المحصول</Text>
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

            {/* 2. المدخلات البيئية (مهمة جداً للنموذج) */}
            <Text style={styles.sectionTitle}>2. بيانات المزرعة الحالية</Text>
            <View style={styles.featureRow}>
              <View style={styles.inputBox}>
                <Ionicons name="thermometer-outline" size={18} color="#2e7d32" />
                <TextInput
                  placeholder="الحرارة °C"
                  keyboardType="numeric"
                  style={styles.featureInput}
                  value={temp}
                  onChangeText={setTemp}
                />
              </View>
              <View style={styles.inputBox}>
                <Ionicons name="water-outline" size={18} color="#2e7d32" />
                <TextInput
                  placeholder="الرطوبة %"
                  keyboardType="numeric"
                  style={styles.featureInput}
                  value={humidity}
                  onChangeText={setHumidity}
                />
              </View>
            </View>

            <View style={styles.inputBoxFull}>
               <Ionicons name="calendar-outline" size={18} color="#2e7d32" />
               <TextInput
                  placeholder="عمر المحصول (بالأيام)"
                  keyboardType="numeric"
                  style={styles.featureInput}
                  value={age}
                  onChangeText={setAge}
                />
            </View>

            {/* 3. معاينة الصورة */}
            <Text style={styles.sectionTitle}>3. صورة ورقة المحصول</Text>
            <View style={styles.imageContainer}>
              <View style={styles.imageFrame}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="camera-outline" size={50} color="#ccc" />
                    <Text style={styles.placeholderText}>اضغط لالتقاط صورة</Text>
                  </View>
                )}
                {/* زوايا ديكورية توحي بالمسح الضوئي */}
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            {/* أزرار اختيار الصورة */}
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

            {/* زر البدء */}
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
                  <Ionicons name="analytics" size={20} color="#fff" style={{marginLeft: 10}} />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f9f4" },
  container: { padding: 20 },
  headerSection: { alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: "800", color: "#1b5e20" },
  sub: { fontSize: 13, color: "#666", marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#333", marginBottom: 12, textAlign: 'right' },
  cropRow: { flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 20 },
  cropBtn: { 
    width: "31%", 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: "#f8fdf8", 
    borderWidth: 1, 
    borderColor: "#e8f5e9", 
    alignItems: "center" 
  },
  cropActive: { backgroundColor: "#2e7d32", borderColor: "#2e7d32" },
  cropText: { fontSize: 13, fontWeight: "600", color: "#2e7d32" },
  cropTextActive: { color: "#fff" },

  featureRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 10 },
  inputBox: { 
    width: '48%', 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    backgroundColor: '#f9f9f9', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 45,
    borderWidth: 1,
    borderColor: '#eee'
  },
  inputBoxFull: { 
    width: '100%', 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    backgroundColor: '#f9f9f9', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 45,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  featureInput: { flex: 1, textAlign: 'right', fontSize: 14, color: '#333', marginRight: 10 },

  imageContainer: { alignItems: 'center', marginVertical: 15 },
  imageFrame: { 
    width: "100%", 
    height: 200, 
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
  placeholderText: { marginTop: 8, color: "#ccc", fontSize: 12 },
  
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#2e7d32', borderWidth: 3 },
  topLeft: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0 },

  actionRow: { 
    flexDirection: 'row', 
    backgroundColor: '#f8fdf8', 
    borderRadius: 15, 
    padding: 8, 
    marginBottom: 20,
    alignItems: 'center'
  },
  iconBtn: { flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  iconBtnText: { marginLeft: 8, fontWeight: '600', color: '#2e7d32', fontSize: 14 },
  divider: { width: 1, height: 20, backgroundColor: '#e0e0e0' },

  mainBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  mainText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});