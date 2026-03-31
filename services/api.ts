const BASE_URL = "http://192.168.1.17:8000";

type DiagnoseParams = {
  imageUri: string;
  temp: number;
  humidity: number;
  age: number;
};

export async function diagnoseCrop({
  imageUri,
  temp,
  humidity,
  age,
}: DiagnoseParams) {
  const formData = new FormData();

  formData.append("user_id", "mobile_user");

  // ✅ NEW inputs
  formData.append("temp", String(temp));
  formData.append("humidity", String(humidity));
  formData.append("age", String(age));

  formData.append("image", {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  } as any);

  const response = await fetch(`${BASE_URL}/diagnose`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return await response.json();
}