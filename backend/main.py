import os
import uuid
import shutil
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

# استيراد ملفات مشروعك الخاصة
from database import (
    init_db,
    create_user_if_not_exists,
    save_diagnosis,
    get_user_history
)
from vlm import CropVLM

# تحميل متغيرات البيئة من ملف .env
load_dotenv()

app = FastAPI(title="Smart Agriculture Backend")

# إعدادات CORS للسماح لتطبيق الموبايل بالاتصال
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تهيئة النظام عند التشغيل
init_db()
vlm_model = CropVLM()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class ChatRequest(BaseModel):
    message: str

# ==========================================
# 🤖 نظام المحادثة الآلي
# ==========================================
@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        prompt = f"أنت مساعد زراعي خبير ومستشار تقني. أجب على هذا السؤال باختصار ووضوح باللغة العربية: {request.message}"
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return {"reply": response.text}
    except Exception as e:
        print(f"Chat Error: {e}")
        return {"reply": "عذراً، واجهت مشكلة في الاتصال بخدمة الذكاء الاصطناعي."}

# ==========================================
# 🌱 نظام التشخيص (تم إصلاح الخطأ البرمجي هنا)
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
    try:
        # 1. التأكد من وجود المستخدم
        create_user_if_not_exists(user_id)

        # 2. حفظ الصورة
        file_extension = os.path.splitext(image.filename)[1]
        image_name = f"{uuid.uuid4()}{file_extension}"
        image_path = os.path.join(UPLOAD_DIR, image_name)
        
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        # 3. تشغيل التشخيص (VLM)
        result = vlm_model.predict_and_explain(
            image_path=image_path, 
            temp=temp, 
            humidity=humidity, 
            age=age
        )

        # 4. تجهيز البيانات
        disease = result["disease_name"]
        # تحويل الدقة لنسبة مئوية (0-100) لواجهة التطبيق
        confidence_pct = result["confidence"] * 100 
        explanation = result["arabic_explanation"]

        # 5. حفظ في قاعدة البيانات (اختياري ولكن مفيد للسجل)
        save_diagnosis(
            user_id=user_id,
            crop="unknown",
            region=region,
            disease=disease,
            confidence=confidence_pct,
            explanation=str(explanation)
        )

        # 6. إرجاع النتيجة النهائية
        return {
            "disease_name": disease,
            "confidence": confidence_pct,
            "arabic_explanation": explanation
        }

    except Exception as e:
        print(f"Diagnosis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# 📜 استرجاع سجل التشخيصات
# ==========================================
@app.get("/history/{user_id}")
def history(user_id: str):
    try:
        return get_user_history(user_id)
    except Exception as e:
        print(f"History Error: {e}")
        return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)