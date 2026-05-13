// services/api.ts

export const BASE_URL = "http://192.168.1.18:8000";

type DiagnoseParams = {
  imageUri: string;
  temp: number;
  humidity: number;
  age: number;
  crop: string;
  governorate: string;
};

export async function diagnoseCrop({
  imageUri,
  temp,
  humidity,
  age,
  crop,
  governorate,
}: DiagnoseParams) {

  const formData = new FormData();

  // USER
  formData.append("user_id", "mobile_user");

  // ENVIRONMENTAL DATA
  formData.append("temp", String(temp));

  formData.append("humidity", String(humidity));

  formData.append("age", String(age));

  // NEW REQUIRED FIELDS
  formData.append("crop", crop);

  formData.append("governorate", governorate);

  // IMAGE
  const filename =
    imageUri.split("/").pop() || "image.jpg";

  const match =
    /\.(\w+)$/.exec(filename);

  const type =
    match
      ? `image/${match[1]}`
      : `image/jpeg`;

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // REQUEST
  const response = await fetch(
    `${BASE_URL}/diagnose`,
    {
      method: "POST",

      body: formData,

      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // ERROR
  if (!response.ok) {

    const errorText =
      await response.text();

    console.log(errorText);

    throw new Error(errorText);
  }

  // SUCCESS
  return await response.json();
}