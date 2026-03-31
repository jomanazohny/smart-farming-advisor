import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const [form, setForm] = useState({ crop: "", size: "", soil: "" });

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* 🌿 HERO HEADER */}
          <View style={styles.headerSection}>
            <Text style={styles.welcomeText}>مرحباً بك في</Text>
            <Text style={styles.headerText}>مستشار الزراعة الذكي 🇪🇬</Text>
          </View>

          {/* 📊 DATA CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#2e7d32" />
              <Text style={styles.cardTitle}>تحليل بيانات المزرعة</Text>
            </View>
            
            <Text style={styles.cardSubtitle}>
              أدخل البيانات بدقة للحصول على توصيات مدعومة بالذكاء الاصطناعي
            </Text>

            {/* Input Group: Crop */}
            <View style={styles.inputWrapper}>
              <Ionicons name="leaf-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="نوع المحصول (مثال: قمح)"
                placeholderTextColor="#999"
                textAlign="right"
                value={form.crop}
                onChangeText={(t) => setForm({...form, crop: t})}
              />
            </View>

            {/* Input Group: Land Size */}
            <View style={styles.inputWrapper}>
              <Ionicons name="expand-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="مساحة الأرض (بالفدان)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                textAlign="right"
                value={form.size}
                onChangeText={(t) => setForm({...form, size: t})}
              />
            </View>

            {/* Input Group: Soil Type */}
            <View style={styles.inputWrapper}>
              <Ionicons name="layers-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="نوع التربة (مثال: طينية)"
                placeholderTextColor="#999"
                textAlign="right"
                value={form.soil}
                onChangeText={(t) => setForm({...form, soil: t})}
              />
            </View>

            {/* ACTION BUTTONS */}
            <Pressable style={({pressed}) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryText}>إصدار التقرير الذكي</Text>
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>

            <Pressable onPress={() => setForm({crop: "", size: "", soil: ""})}>
              <Text style={styles.secondaryText}>مسح البيانات</Text>
            </Pressable>
          </View>

          {/* ✨ QUICK TIPS SECTION (Added for Professionalism) */}
          <View style={styles.tipsSection}>
             <Ionicons name="bulb-outline" size={20} color="#fbc02d" />
             <Text style={styles.tipsText}>نصيحة اليوم: تأكد من فحص رطوبة التربة قبل الري بـ 4 ساعات.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f4f9f4" },
  container: { padding: 20 },
  headerSection: { marginVertical: 25, alignItems: 'flex-end' },
  welcomeText: { fontSize: 16, color: "#666", marginBottom: 4 },
  headerText: { fontSize: 26, fontWeight: "800", color: "#1b5e20" },
  
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginRight: 10, color: "#333" },
  cardSubtitle: { fontSize: 14, color: "#888", marginBottom: 25, textAlign: 'right', lineHeight: 20 },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f8fdf8",
    borderWidth: 1,
    borderColor: "#e8f5e9",
    borderRadius: 14,
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 15, color: "#333" },
  
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: "#2e7d32",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  primaryText: { color: "#fff", fontWeight: "bold", fontSize: 17, marginRight: 8 },
  secondaryText: { textAlign: "center", color: "#aaa", marginTop: 15, fontSize: 14 },
  
  tipsSection: {
    marginTop: 30,
    flexDirection: 'row-reverse',
    backgroundColor: "#fff9c4",
    padding: 15,
    borderRadius: 15,
    alignItems: 'center'
  },
  tipsText: { flex: 1, fontSize: 13, color: "#5d4037", marginRight: 10, textAlign: 'right' }
});