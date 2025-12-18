const BASE_URL = "http://192.168.1.17:8000"; // your laptop IP

type DiagnoseParams = {
  imageUri: string;
  crop: string;
};

export async function diagnoseCrop({ imageUri, crop }: DiagnoseParams) {
  const formData = new FormData();

  formData.append("user_id", "mobile_user");
  formData.append("crop", crop);

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
