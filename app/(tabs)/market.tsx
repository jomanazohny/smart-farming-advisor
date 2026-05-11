import React, { useState, useRef } from "react";
import { 
  View, Text, StyleSheet, TextInput, Pressable, 
  SafeAreaView, ScrollView, ActivityIndicator, 
  KeyboardAvoidingView, Platform, Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { BASE_URL } from "../../services/api";

export default function MarketScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("Connection failed");

      const data = await res.json();
      const botReply = data.reply || "عذراً، لم أتمكن من الرد.";

      setMessages((prev) => [...prev, { role: "bot", text: botReply }]);
      Speech.speak(botReply, { language: "ar" });

    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "❌ فشل الاتصال بالخادم - تأكد من الـ IP" }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>💰 إدارة الموارد والسوق</Text>
          
          <View style={styles.card}>
            <Text style={styles.chatTitle}>🎙️ مساعد الدردشة الزراعي</Text>
            <ScrollView ref={scrollViewRef} style={styles.chatHistory}>
              {messages.map((m, i) => (
                <View key={i} style={[styles.bubble, m.role === "user" ? styles.userBubble : styles.botBubble]}>
                  <Text style={m.role === "user" ? styles.whiteText : styles.blackText}>{m.text}</Text>
                </View>
              ))}
              {loading && <ActivityIndicator color="#2e7d32" style={{ marginTop: 10 }} />}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="اكتب هنا..."
                value={input}
                onChangeText={setInput}
                textAlign="right"
              />
              <Pressable style={styles.sendButton} onPress={handleSend} disabled={loading}>
                <Ionicons name="send" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Keep your existing styles from the previous message ...
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eef7ee" },
  container: { padding: 16, flex: 1 },
  header: { fontSize: 22, fontWeight: "bold", color: "#2e7d32", textAlign: "center", marginBottom: 16 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 16, flex: 1, elevation: 2 },
  chatTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 16, color: "#333" },
  chatHistory: { flex: 1, marginVertical: 10 },
  bubble: { padding: 12, borderRadius: 15, marginVertical: 4, maxWidth: "85%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#2e7d32" },
  botBubble: { alignSelf: "flex-start", backgroundColor: "#f0f0f0" },
  whiteText: { color: "#fff", textAlign: "right" },
  blackText: { color: "#333", textAlign: "right" },
  inputContainer: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 10 },
  chatInput: { flex: 1, backgroundColor: "#f5f5f5", borderRadius: 15, padding: 12, textAlign: "right" },
  sendButton: { backgroundColor: "#2e7d32", width: 45, height: 45, borderRadius: 22, alignItems: "center", justifyContent: "center", marginLeft: 10 },
});