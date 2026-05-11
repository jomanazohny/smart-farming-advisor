import os
import uuid
import shutil
import requests

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

# Local imports
from database import (
    init_db,
    create_user_if_not_exists,
    save_diagnosis,
    get_user_history
)

from vlm import CropVLM

# =====================
# APP SETUP
# =====================
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# INITIALIZE SYSTEMS
# =====================
init_db()

vlm_model = CropVLM(
    "models/best_model.h5",
    "models/classes_v4.npy"
)

groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =====================
# EGYPT CROP ZONES
# =====================
CROP_ZONES = {

    "mango": {
        "ismailia": "منطقة الإسماعيلية للمانجو",
        "sharkia": "منطقة الشرقية للمانجو",
        "luxor": "صعيد مصر للمانجو",
        "aswan": "صعيد مصر للمانجو"
    },

    "wheat": {
        "beheira": "دلتا القمح",
        "dakahlia": "دلتا القمح",
        "minya": "الوجه القبلي للقمح",
        "new valley": "الوادي الجديد للقمح"
    },

    "potato": {
        "beheira": "غرب الدلتا للبطاطس",
        "menofia": "وسط الدلتا للبطاطس",
        "minya": "مصر الوسطى للبطاطس"
    }
}

# =====================
# LIVE SOIL MOISTURE
# =====================
def get_live_soil_moisture(lat, lon):

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}"
            f"&hourly=soil_moisture_0_to_1cm"
        )

        response = requests.get(url, timeout=5)

        data = response.json()

        moisture = data["hourly"]["soil_moisture_0_to_1cm"][0]

        return round(moisture * 100, 1)

    except Exception as e:
        print("❌ Soil API Error:", e)

        return 25.0

# =====================
# CHAT MODEL
# =====================
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat_with_ai(request: ChatRequest):

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "system",
                    "content": (
                        "أنت مساعد زراعي خبير في المحاصيل المصرية "
                        "(قمح، بطاطس، مانجو). "
                        "أجب باختصار وباللغة العربية."
                    )
                },

                {
                    "role": "user",
                    "content": request.message
                }
            ],

            temperature=0.7,
        )

        reply = completion.choices[0].message.content

        return {
            "reply": reply
        }

    except Exception as e:

        print(f"❌ Groq Error: {e}")

        return {
            "reply": "عذراً، حدث خطأ في نظام الدردشة."
        }

# =====================
# DIAGNOSIS ENDPOINT
# =====================
@app.post("/diagnose")
async def diagnose(

    user_id: str = Form(...),

    crop: str = Form(...),

    governorate: str = Form(...),

    temp: float = Form(...),

    humidity: float = Form(...),

    age: float = Form(...),

    lat: float = Form(30.0444),

    lon: float = Form(31.2357),

    image: UploadFile = File(...)
):

    try:

        # =====================
        # CREATE USER
        # =====================
        create_user_if_not_exists(user_id)

        # =====================
        # SAVE IMAGE
        # =====================
        file_ext = os.path.splitext(image.filename)[1]

        image_path = os.path.join(
            UPLOAD_DIR,
            f"{uuid.uuid4()}{file_ext}"
        )

        contents = await image.read()

        with open(image_path, "wb") as f:
            f.write(contents)

        # =====================
        # REGION LOGIC
        # =====================
        specific_region = CROP_ZONES.get(
            crop.lower(),
            {}
        ).get(
            governorate.lower(),
            f"منطقة عامة لزراعة {crop}"
        )

        # =====================
        # LIVE SOIL MOISTURE
        # =====================
        moisture = get_live_soil_moisture(lat, lon)

        # =====================
        # AI PREDICTION
        # =====================
        result = vlm_model.predict_and_explain(
            image_path,
            temp,
            humidity,
            age
        )

        # =====================
        # SMART ADVISOR
        # =====================
        behavior_advice = vlm_model.generate_behavior_advice(
            result["disease_name"],
            moisture,
            temp,
            humidity,
            crop,
            specific_region
        )

        # =====================
        # DEBUG LOGS
        # =====================
        print(
            f"📊 {result['disease_name']} | "
            f"{result['confidence']:.2f}"
        )

        # =====================
        # SAVE TO DATABASE
        # =====================
        save_diagnosis(
            user_id,
            crop,
            specific_region,
            result["disease_name"],
            result["confidence"] * 100,
            str(result["arabic_explanation"])
        )

        # =====================
        # FINAL RESPONSE
        # =====================
        return {

            "disease_name": result["disease_name"],

            "confidence": round(
                result["confidence"] * 100,
                2
            ),

            "arabic_explanation":
                result["arabic_explanation"],

            "region": specific_region,

            "soil_moisture": moisture,

            "behavior_advice": behavior_advice
        }

    except Exception as e:

        print(f"❌ Prediction Error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================
# HISTORY ENDPOINT
# =====================
@app.get("/history/{user_id}")
def history(user_id: str):

    return get_user_history(user_id)

# =====================
# LIVE FARM STATUS
# =====================
@app.get("/farm-status")
def farm_status(

    crop: str,
    governorate: str,
    temp: float,
    humidity: float,
    lat: float = 30.0444,
    lon: float = 31.2357
):

    try:

        # Region
        specific_region = CROP_ZONES.get(
            crop.lower(),
            {}
        ).get(
            governorate.lower(),
            f"منطقة عامة لزراعة {crop}"
        )

        # Moisture
        moisture = get_live_soil_moisture(
            lat,
            lon
        )

        # Smart Advice
        advice = vlm_model.generate_behavior_advice(
            "general",
            moisture,
            temp,
            humidity,
            crop,
            specific_region
        )

        # Farm health logic
        if moisture < 20:
            health = "ضعيفة"

        elif moisture > 45:
            health = "خطر رطوبة مرتفعة"

        else:
            health = "ممتازة"

        return {

            "region": specific_region,

            "soil_moisture": moisture,

            "farm_health": health,

            "temperature": temp,

            "humidity": humidity,

            "smart_advice": advice
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )