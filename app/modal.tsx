import { StyleSheet, TextInput, Pressable, Image, Alert } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { diagnoseCrop } from "../services/api"; // adjust path if needed

export default function ModalScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [temp, setTemp] = useState("");
  const [humidity, setHumidity] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  // 📸 Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🚀 Send data to backend
  const handleDiagnose = async () => {
    if (!image) {
      Alert.alert("خطأ", "يرجى اختيار صورة");
      return;
    }

    if (!temp || !humidity || !age) {
      Alert.alert("خطأ", "يرجى إدخال جميع البيانات");
      return;
    }

    try {
      setLoading(true);

      const response = await diagnoseCrop({
        imageUri: image,
        temp: Number(temp),
        humidity: Number(humidity),
        age: Number(age),
      });

      router.push({
        pathname: "/result",
        params: {
          data: JSON.stringify(response),
        },
      });
    } catch (error: any) {
      Alert.alert("خطأ", error.message || "فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">تشخيص النبات 🌱</ThemedText>

      {/* Image Picker */}
      <Pressable style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <ThemedText>📸 اضغط لاختيار صورة</ThemedText>
        )}
      </Pressable>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="🌡️ درجة الحرارة (مثال: 30)"
        keyboardType="numeric"
        value={temp}
        onChangeText={setTemp}
      />

      <TextInput
        style={styles.input}
        placeholder="💧 الرطوبة (مثال: 60)"
        keyboardType="numeric"
        value={humidity}
        onChangeText={setHumidity}
      />

      <TextInput
        style={styles.input}
        placeholder="🌱 عمر النبات بالأيام (مثال: 45)"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      {/* Button */}
      <Pressable
        style={styles.button}
        onPress={handleDiagnose}
        disabled={loading}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? "جاري التحليل..." : "تشخيص"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#eef7ee",
  },
  imageBox: {
    height: 200,
    backgroundColor: "#ddd",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2e7d32",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});