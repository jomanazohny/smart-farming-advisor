from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uuid
import shutil
import os

from database import (
    init_db,
    create_user_if_not_exists,
    save_diagnosis,
    get_user_history
)

from vlm import vlm_predict_and_explain

app = FastAPI(title="Smart Agriculture Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

init_db()


@app.post("/diagnose")
async def diagnose(
    user_id: str = Form(...),
    crop: str = Form(...),
    region: str = Form("unknown"),
    image: UploadFile = File(...)
):
    create_user_if_not_exists(user_id)

    image_path = os.path.join(
        UPLOAD_DIR,
        f"{uuid.uuid4()}_{image.filename}"
    )

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    result = vlm_predict_and_explain(
        image_path=image_path,
        crop_type=crop
    )

    # ✅ Build explanation text from structured data
    explanation_text = f"""
السبب: {result['cause']}
العلاج: {result['treatment']}
الوقاية: {result['prevention']}
""".strip()

    save_diagnosis(
        user_id=user_id,
        crop=crop,
        region=region,
        disease=result["disease"],
        confidence=result["confidence"],
        explanation=explanation_text
    )

    return {
        "disease": result["disease"],
        "confidence": result["confidence"],
        "certainty": result["certainty"],
        "cause": result["cause"],
        "treatment": result["treatment"],
        "prevention": result["prevention"]
    }


@app.get("/history/{user_id}")
def history(user_id: str):
    return get_user_history(user_id)
