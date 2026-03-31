const BASE_URL = "http://172.20.10.2:8000"; // 🟢 IMPORTANT: CHANGE TO YOUR CURRENT IP

type DiagnoseParams = {
  imageUri: string;
  temp: number;
  humidity: number;
  age: number;
};

export async function diagnoseCrop({ imageUri, temp, humidity, age }: DiagnoseParams) {
  const formData = new FormData();

  formData.append("user_id", "mobile_user");
  formData.append("temp", String(temp));
  formData.append("humidity", String(humidity));
  formData.append("age", String(age));

  // Add Image
  const filename = imageUri.split('/').pop() || "image.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: type,
  } as any);

  const response = await fetch(`${BASE_URL}/diagnose`, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return await response.json();
}