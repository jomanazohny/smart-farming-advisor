import os
import tensorflow as tf
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =====================
# MODEL PATHS
# =====================
MODEL_PATHS = {
    "wheat": os.path.join(BASE_DIR, "models", "wheat.h5"),
    "potato": os.path.join(BASE_DIR, "models", "potato.h5"),
    "mango": os.path.join(BASE_DIR, "models", "mango.h5"),
}

# =====================
# CLASS NAMES
# =====================
CLASS_NAMES = {
    "wheat": [
        "Brown Rust", "Fusarium head blight", "Healthy", "Mildew", "Mite",
        "Stem fly", "Yellow Rust", "aphids", "armyworms", "root rot",
        "septoria leaf blotch", "stem rust", "wheat blast"
    ],
    "potato": [
        "Bacterial wilt", "Blackleg", "Common scab", "Cutworms", "Flea Beetle",
        "Healthy", "PVY", "aphids", "blackspot bruising", "dry rot",
        "early_blight", "late_blight", "potato_tuber_moth", "soft rot", "whiteflies"
    ],
    "mango": [
        "Anthracnose", "Bacterial Canker", "DieBack", "Healthy",
        "Mango Fruit Fly", "Mango Mealybug", "Thrips", "Weevil",
        "gall midge", "mango_hopper", "powdery mildew", "sooty Mold", "stem-end-rot"
    ],
}

# =====================
# DISEASE KNOWLEDGE (ALL CLASSES)
# =====================
DISEASE_KNOWLEDGE = {
    "wheat": {
        "brown rust": {
            "cause": "مرض فطري يصيب أوراق القمح",
            "treatment": "استخدام مبيد فطري مناسب عند ظهور الأعراض",
            "prevention": "زراعة أصناف مقاومة والمتابعة المبكرة"
        },
        "fusarium head blight": {
            "cause": "فطر يصيب سنابل القمح في ظروف رطوبة عالية",
            "treatment": "استخدام مبيد فطري معتمد",
            "prevention": "تجنب الرطوبة الزائدة والدورة الزراعية"
        },
        "mildew": {
            "cause": "فطر ينمو في ظروف رطوبة مرتفعة",
            "treatment": "رش مبيد فطري مناسب",
            "prevention": "تحسين التهوية وتقليل الرطوبة"
        },
        "mite": {
            "cause": "إصابة حشرية تمتص عصارة النبات",
            "treatment": "استخدام مبيد أكاروسي مناسب",
            "prevention": "المتابعة الدورية والمكافحة المتكاملة"
        },
        "stem fly": {
            "cause": "حشرة تهاجم ساق القمح",
            "treatment": "استخدام مبيد حشري مناسب",
            "prevention": "المتابعة المبكرة وإزالة النباتات المصابة"
        },
        "yellow rust": {
            "cause": "فطر ينتشر في الطقس البارد والرطب",
            "treatment": "رش مبيد فطري وقائي",
            "prevention": "زراعة أصناف مقاومة"
        },
        "aphids": {
            "cause": "حشرات ماصة تضعف النبات",
            "treatment": "استخدام مبيد حشري",
            "prevention": "المراقبة المبكرة"
        },
        "armyworms": {
            "cause": "يرقات تتغذى على أوراق القمح",
            "treatment": "استخدام مبيد حشري",
            "prevention": "المتابعة الدورية"
        },
        "root rot": {
            "cause": "فطر يصيب جذور النبات",
            "treatment": "تحسين الصرف واستخدام مبيد فطري",
            "prevention": "تجنب الري الزائد"
        },
        "septoria leaf blotch": {
            "cause": "فطر يسبب بقع على أوراق القمح",
            "treatment": "رش مبيد فطري",
            "prevention": "زراعة أصناف مقاومة"
        },
        "stem rust": {
            "cause": "فطر يصيب ساق وأوراق القمح",
            "treatment": "مبيد فطري مناسب",
            "prevention": "الدورة الزراعية"
        },
        "wheat blast": {
            "cause": "فطر يصيب سنابل القمح",
            "treatment": "استخدام مبيد فطري",
            "prevention": "زراعة أصناف مقاومة"
        },
        "healthy": {
            "cause": "النبات سليم",
            "treatment": "لا يحتاج علاج",
            "prevention": "الاستمرار في الرعاية الجيدة"
        }
    },

    "potato": {
        "bacterial wilt": {
            "cause": "بكتيريا تصيب الجذور",
            "treatment": "لا يوجد علاج مباشر",
            "prevention": "الدورة الزراعية"
        },
        "blackleg": {
            "cause": "بكتيريا تصيب الساق",
            "treatment": "إزالة النباتات المصابة",
            "prevention": "استخدام تقاوي سليمة"
        },
        "common scab": {
            "cause": "بكتيريا في التربة",
            "treatment": "تحسين التربة",
            "prevention": "ضبط درجة حموضة التربة"
        },
        "cutworms": {
            "cause": "يرقات تقطع الساق",
            "treatment": "مبيد حشري",
            "prevention": "المراقبة المبكرة"
        },
        "flea beetle": {
            "cause": "حشرة تتغذى على الأوراق",
            "treatment": "مبيد حشري",
            "prevention": "المتابعة الدورية"
        },
        "late blight": {
            "cause": "فطر يصيب الأوراق والدرنات",
            "treatment": "مبيد فطري",
            "prevention": "تجنب الرطوبة"
        },
        "early blight": {
            "cause": "فطر يصيب الأوراق",
            "treatment": "رش مبيد فطري",
            "prevention": "الدورة الزراعية"
        },
        "healthy": {
            "cause": "النبات سليم",
            "treatment": "لا يحتاج علاج",
            "prevention": "الاستمرار في الرعاية الجيدة"
        }
    },

    "mango": {
        "anthracnose": {
            "cause": "فطر يصيب الأوراق والثمار",
            "treatment": "مبيد فطري",
            "prevention": "تقليل الرطوبة"
        },
        "bacterial canker": {
            "cause": "بكتيريا تصيب الشجرة",
            "treatment": "إزالة الأجزاء المصابة",
            "prevention": "التقليم الجيد"
        },
        "dieback": {
            "cause": "فطر يسبب جفاف الأفرع",
            "treatment": "تقليم الأفرع المصابة",
            "prevention": "تحسين التهوية"
        },
        "mango fruit fly": {
            "cause": "حشرة تصيب الثمار",
            "treatment": "مصائد حشرية",
            "prevention": "جمع الثمار المصابة"
        },
        "powdery mildew": {
            "cause": "فطر يظهر كبودرة بيضاء",
            "treatment": "مبيد فطري",
            "prevention": "تحسين التهوية"
        },
        "healthy": {
            "cause": "النبات سليم",
            "treatment": "لا يحتاج علاج",
            "prevention": "الاستمرار في الرعاية الجيدة"
        }
    }
}

# =====================
# LOAD MODELS
# =====================
MODELS = {}
for crop, path in MODEL_PATHS.items():
    MODELS[crop] = tf.keras.models.load_model(path)
    print(f"✅ Loaded model: {crop}")

# =====================
# UTIL
# =====================
def normalize(name: str) -> str:
    return name.lower().replace("_", " ").strip()

# =====================
# PREDICTION
# =====================
def predict_disease(image_path, crop):
    model = MODELS[crop]

    img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
    img = tf.keras.utils.img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = tf.keras.applications.efficientnet.preprocess_input(img)

    preds = model.predict(img, verbose=0)[0]
    idx = int(np.argmax(preds))
    return CLASS_NAMES[crop][idx], float(preds[idx])

# =====================
# VLM FUNCTION (FINAL)
# =====================
def vlm_predict_and_explain(image_path, crop_type):
    disease, confidence = predict_disease(image_path, crop_type)
    confidence_pct = round(confidence * 100, 2)

    certainty = (
        "ثقة عالية في التشخيص" if confidence >= 0.85
        else "ثقة متوسطة في التشخيص" if confidence >= 0.6
        else "ثقة منخفضة – يفضل مراجعة خبير"
    )

    info = DISEASE_KNOWLEDGE[crop_type].get(normalize(disease))

    return {
        "disease": disease,
        "confidence": confidence_pct,
        "certainty": certainty,
        "cause": info["cause"],
        "treatment": info["treatment"],
        "prevention": info["prevention"],
    }
