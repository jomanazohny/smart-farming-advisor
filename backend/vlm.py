import os
import tensorflow as tf
import numpy as np
import cv2

# =====================
# 1. PATHS & CONFIG
# =====================
MODEL_PATH = "models/egypt_crop_pro_v4.h5"
CLASSES_PATH = "models/classes_v4.npy"

# =====================
# 🔁 ARABIC → ENGLISH (optional)
# =====================
ARABIC_CROP_MAP = {
    "مانجو": "mango",
    "بطاطس": "potato",
    "قمح": "wheat"
}

# =====================
# 🔢 ARABIC NUMBERS → ENGLISH
# =====================
def normalize_number(value):
    if isinstance(value, str):
        arabic_to_english = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")
        value = value.translate(arabic_to_english)
    return float(value)

# =====================
# 2. MASTER KNOWLEDGE BASE
# =====================
DISEASE_KNOWLEDGE = {
    "brown rust": {"cause": "فطر يسبب بقع بنية مسحوقية", "treatment": "رش مبيد فطري تيلت (Tilt) 25سم/100لتر", "prevention": "زراعة أصناف مقاومة"},
    "fusarium head blight": {"cause": "عفن السنابل الفطري", "treatment": "رش مبيد توبسين (Topsin) عند طرد السنابل", "prevention": "تجنب الري وقت التزهير"},
    "mildew": {"cause": "البياض الدقيقي (بودرة بيضاء)", "treatment": "رش كبريت ميكروني أو مبيد أفوجان", "prevention": "تقليل الكثافة النباتية"},
    "mite": {"cause": "العنكبوت الأحمر (أكاروس)", "treatment": "رش مبيد أبامكتين متخصص", "prevention": "تجنب التعطيش الشديد"},
    "stem fly": {"cause": "ذبابة الساق التي تهاجم قلب النبات", "treatment": "رش مبيد حشري جهازي مثل ديميثويت", "prevention": "الزراعة في المواعيد الموصى بها"},
    "yellow rust": {"cause": "صدأ القمح الأصفر (الأخطر في مصر)", "treatment": "رش فوري بمبيد سومي ايت أو ريكس ديو", "prevention": "المتابعة اليومية فجراً"},
    "aphids": {"cause": "حشرة المن الماصة للعصارة", "treatment": "رش زيت معدني أو مبيد لانيت", "prevention": "إزالة الحشائش العائلة للمن"},
    "armyworms": {"cause": "الدودة الجياشة التي تأكل الأوراق", "treatment": "رش مبيد كوراجين أو بستبان", "prevention": "استخدام مصائد فرمونية"},
    "root rot": {"cause": "أعفان الجذور بسبب زيادة مياه الري", "treatment": "حقن مبيد مونكتين مع ماء الري", "prevention": "تحسين الصرف الزراعي"},
    "septoria leaf blotch": {"cause": "تبقع الأوراق السبتوري (فطري)", "treatment": "رش مبيد فطرى مانكوزيب", "prevention": "استخدام بذور معتمدة ونظيفة"},
    "stem rust": {"cause": "صدأ الساق الذي يسبب كسر النبات", "treatment": "رش مبيد فطري جهازي فوراً", "prevention": "الدورة الزراعية المتوازنة"},
    "wheat blast": {"cause": "مرض فطر اللافحة (يصيب السنابل)", "treatment": "رش مبيدات تحتوي على ستروبيلورين", "prevention": "تعديل مواعيد الزراعة"},

    "bacterial wilt": {"cause": "الذبول البكتيري", "treatment": "لا يوجد علاج", "prevention": "منع انتقال المياه"},
    "early blight": {"cause": "اللفحة المبكرة", "treatment": "رش مبيد فطري", "prevention": "إزالة النباتات المصابة"},
    "late blight": {"cause": "اللفحة المتأخرة", "treatment": "رش ريدوميل", "prevention": "تجنب الرطوبة العالية"},

    "anthracnose": {"cause": "فطر الانثراكنوز", "treatment": "رش نحاس", "prevention": "تقليم الأشجار"},
    "powdery mildew": {"cause": "البياض الدقيقي", "treatment": "رش كبريت", "prevention": "تهوية جيدة"},

    "healthy": {"cause": "النبات سليم", "treatment": "لا يحتاج علاج", "prevention": "استمرار العناية"}
}

# =====================
# 3. CORE VLM CLASS
# =====================
class CropVLM:
    def __init__(self, model_path=MODEL_PATH, classes_path=CLASSES_PATH):
        print("⏳ Loading Model...")
        self.model = tf.keras.models.load_model(model_path)
        self.classes = np.load(classes_path, allow_pickle=True)
        print("✅ Model Loaded")

    def preprocess_inputs(self, image_path, temp, humidity, age):
        # Normalize numbers (Arabic → English)
        temp = normalize_number(temp)
        humidity = normalize_number(humidity)
        age = normalize_number(age)

        # Image
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224)) / 255.0
        img_batch = np.expand_dims(img, axis=0)

        # Scale inputs
        meta_batch = np.array([[temp/50.0, humidity/100.0, age/120.0]], dtype='float32')

        return img_batch, meta_batch

    def predict_and_explain(self, image_path, temp, humidity, age):
        img_in, meta_in = self.preprocess_inputs(image_path, temp, humidity, age)

        preds = self.model.predict({
            "image_input": img_in,
            "meta_input": meta_in
        }, verbose=0)[0]

        idx = np.argmax(preds)
        raw_label = self.classes[idx]
        confidence = float(preds[idx])

        lookup_label = raw_label.lower().replace("_", " ")

        info = {"cause": "غير محدد", "treatment": "استشر خبير", "prevention": "نظافة الحقل"}
        for key in DISEASE_KNOWLEDGE:
            if key in lookup_label:
                info = DISEASE_KNOWLEDGE[key]
                break

        return {
            "disease_name": raw_label.replace("_", " ").title(),
            "confidence": float(confidence * 100),  # ✅ NUMBER not string
            "arabic_explanation": {
                "السبب": info["cause"],
                "العلاج": info["treatment"],
                "الوقاية": info["prevention"]
            }
        }