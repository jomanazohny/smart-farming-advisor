import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

// ❗ IMPORTANT: Double-check your laptop's IP address (192.168.1.3)
const API_URL = "http://192.168.1.3:8000/chat"; 

export default function MarketScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 🧠 SEND MESSAGE FUNCTION
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data = await res.json();
      const botReply = data.reply || "عذراً، لم أتمكن من الرد.";

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);

      // 🔊 VOICE OUTPUT (TTS) - The AI speaks the answer
      Speech.speak(botReply, { language: "ar" });

    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "❌ فشل الاتصال بالخادم" }]);
    } finally {
      setLoading(false);
      // Auto-scroll to show the latest message
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // 🎤 VOICE INPUT HELPER
  const handleVoiceInput = () => {
    Alert.alert(
      "إدخال صوتي", 
      "استخدم زر الميكروفون الموجود في لوحة المفاتيح للتحدث مباشرة باللغة العربية."
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <Text style={styles.header}>💰 إدارة الموارد والسوق</Text>

          {/* TOP UTILITY BUTTONS */}
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

          {/* MAIN CHAT CARD */}
          <View style={styles.card}>
            <Text style={styles.chatTitle}>🎙️ مساعد الدردشة الزراعي</Text>
            
            {/* Scrollable conversation history */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.chatHistory}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {messages.length === 0 && (
                <Text style={styles.placeholderText}>مرحبًا، كيف يمكنني مساعدتك في مزرعتك اليوم؟</Text>
              )}
              {messages.map((m, i) => (
                <View key={i} style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.botBubble]}>
                  <Text style={m.role === "user" ? styles.whiteText : styles.blackText}>{m.text}</Text>
                </View>
              ))}
              {loading && <ActivityIndicator color="#2e7d32" style={{ marginTop: 10 }} />}
            </ScrollView>

            {/* INPUT AREA */}
            <View style={styles.inputContainer}>
              {/* Voice Mic Icon */}
              <Pressable style={styles.micButton} onPress={handleVoiceInput}>
                <Ionicons name="mic" size={24} color="#2e7d32" />
              </Pressable>

              <TextInput
                style={styles.chatInput}
                placeholder="اكتب أو تحدث هنا..."
                placeholderTextColor="#999"
                value={input}
                onChangeText={setInput}
                multiline
                textAlign="right"
              />

              <Pressable 
                style={[styles.sendButton, !input.trim() && { opacity: 0.5 }]} 
                onPress={handleSend}
                disabled={loading}
              >
                <Ionicons name="send" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef7ee" },
  container: { padding: 16, flex: 1 },
  header: { fontSize: 22, fontWeight: "bold", color: "#2e7d32", textAlign: "center", marginBottom: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  smallCard: { width: "48%", backgroundColor: "#f1f8e9", borderRadius: 14, padding: 18, alignItems: "center" },
  smallText: { marginTop: 8, fontSize: 14, fontWeight: "500" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, flex: 1, elevation: 2 },
  chatTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 16, color: "#333" },
  chatHistory: { flex: 1, marginVertical: 10 },
  placeholderText: { color: "#aaa", textAlign: "center", marginTop: 20 },
  bubble: { padding: 12, borderRadius: 15, marginVertical: 4, maxWidth: "85%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#2e7d32" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#f0f0f0" },
  whiteText: { color: "#fff", textAlign: "right" },
  blackText: { color: "#333", textAlign: "right" },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderTopWidth: 1, 
    borderTopColor: "#eee", 
    paddingTop: 10 
  },
  micButton: {
    backgroundColor: "#f1f8e9",
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  chatInput: { 
    flex: 1, 
    backgroundColor: "#f5f5f5", 
    borderRadius: 15, 
    padding: 12, 
    minHeight: 45, 
    maxHeight: 100, 
    textAlign: "right" 
  },
  sendButton: { 
    backgroundColor: "#2e7d32", 
    width: 45, 
    height: 45, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center", 
    marginLeft: 10 
  },
});