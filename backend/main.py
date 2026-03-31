import os
import uuid
import shutil
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

# ✅ YOUR ORIGINAL DATABASE IMPORTS
from database import (
    init_db,
    create_user_if_not_exists,
    save_diagnosis,
    get_user_history
)

# ✅ YOUR ORIGINAL VLM IMPORT
from vlm import CropVLM

# Load variables from .env (Make sure your GEMINI_API_KEY is in there!)
load_dotenv()

app = FastAPI(title="Smart Agriculture Backend")

# ✅ Allow the Mobile App to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Initialize System
init_db()
vlm_model = CropVLM()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ✅ Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class ChatRequest(BaseModel):
    message: str

# ==========================================
# 🤖 NEW: CHATBOT ENDPOINT (For Market Page)
# ==========================================
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # Specialized prompt for your agriculture project
        prompt = f"أنت مساعد زراعي خبير. أجب على هذا السؤال باختصار وباللغة العربية: {request.message}"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return {"reply": response.text}
    except Exception as e:
        print(f"Chat Error: {e}")
        return {"reply": "عذراً، واجهت مشكلة في الاتصال بالخادم."}

# ==========================================
# 🌱 ORIGINAL: DIAGNOSE ENDPOINT
# ==========================================
@app.post("/diagnose")
async def diagnose(
    user_id: str = Form(...),
    temp: float = Form(...),
    humidity: float = Form(...),
    age: float = Form(...),
    region: str = Form("unknown"),
    image: UploadFile = File(...)
):
    create_user_if_not_exists(user_id)

    # Save uploaded image
    image_path = os.path.join(
        UPLOAD_DIR,
        f"{uuid.uuid4()}_{image.filename}"
    )
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Call your VLM model logic
    result = vlm_model.predict_and_explain(
        image_path=image_path,
        temp=temp,
        humidity=humidity,
        age=age
    )

    disease = result["disease_name"]
    confidence = result["confidence"]
    explanation = result["arabic_explanation"]

    cause = explanation["السبب"]
    treatment = explanation["العلاج"]
    prevention = explanation["الوقاية"]

    # Save to Database
    explanation_text = f"السبب: {cause}\nالعلاج: {treatment}\nالوقاية: {prevention}"
    save_diagnosis(
        user_id=user_id,
        crop="unknown",
        region=region,
        disease=disease,
        confidence=confidence,
        explanation=explanation_text
    )

    return {
        "disease_name": disease,
        "confidence": confidence,
        "arabic_explanation": {
            "السبب": cause,
            "العلاج": treatment,
            "الوقاية": prevention
        }
    }

@app.get("/history/{user_id}")
def history(user_id: str):
    return get_user_history(user_id)