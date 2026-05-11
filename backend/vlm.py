import os
import tensorflow as tf
import numpy as np
import cv2

# =====================
# 1. PATHS & CONFIG
# =====================
# Ensure these files are in your working directory after the Kaggle commit finishes
MODEL_PATH = "models/best_model.h5"
CLASSES_PATH = "models/classes_v4.npy"
# =====================
# 2. MASTER KNOWLEDGE BASE (41 CLASSES)
# =====================
DISEASE_KNOWLEDGE = {
    # WHEAT
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

    # POTATO
    "bacterial wilt": {"cause": "الذبول البكتيري (بكتيريا التربة)", "treatment": "لا يوجد علاج (يجب قلع وحرق النبات)", "prevention": "منع انتقال مياه الري من مكان مصاب"},
    "blackleg": {"cause": "بكتيريا الساق السوداء", "treatment": "إزالة النباتات المصابة فوراً", "prevention": "فرز التقاوي قبل الزراعة"},
    "common scab": {"cause": "الجرب العادي (بكتيريا في التربة)", "treatment": "معاملة التربة بالكبريت الزراعي", "prevention": "ضبط حموضة التربة"},
    "cutworms": {"cause": "ديدان تقرض الساق عند سطح التربة", "treatment": "استخدام طعوم سامة حول النبات", "prevention": "الحرث العميق للتربة"},
    "flea beetle": {"cause": "خنفساء البراغيث (ثقوب صغيرة بالأوراق)", "treatment": "رش مبيد حشري لمبادا", "prevention": "إزالة بقايا المحاصيل السابقة"},
    "pvy": {"cause": "فيروس البطاطس Y (ينتقل بالمن)", "treatment": "لا يوجد (يجب مكافحة حشرة المن)", "prevention": "استخدام شتلات خالية من الفيروس"},
    "blackspot bruising": {"cause": "كدمات سوداء بسبب سوء التداول", "treatment": "تحسين عمليات النقل والتعبئة", "prevention": "الحصاد عند اكتمال النضج فقط"},
    "dry rot": {"cause": "العفن الجاف للدرنات", "treatment": "تطهير المخازن والصناديق", "prevention": "تجنب تجريح البطاطس أثناء الحصاد"},
    "early blight": {"cause": "اللفحة المبكرة (فطرية)", "treatment": "رش مبيد سكور أو مانكوزيب", "prevention": "التخلص من النباتات المصابة"},
    "late blight": {"cause": "اللفحة المتأخرة (بسبب الرطوبة والبرودة)", "treatment": "رش مبيد ريدوميل جولد أو كوبروزات", "prevention": "تجنب الري بالرش ليلاً"},
    "potato tuber moth": {"cause": "سوسة درنات البطاطس", "treatment": "رش مبيد بروتكتو (Protecto)", "prevention": "الترديم العميق وتغطية الشقوق"},
    "soft rot": {"cause": "العفن البكتيري الطري", "treatment": "تهوية المخازن وتقليل الرطوبة", "prevention": "تجفيف الدرنات قبل التخزين"},
    "whiteflies": {"cause": "الذبابة البيضاء (تنقل الفيروسات)", "treatment": "رش مبيد موفنتو أو زيت صيفي", "prevention": "استخدام المصائد الصفراء"},

    # MANGO
    "anthracnose": {"cause": "فطر الانثراكنوز (يصيب الورق والثمار)", "treatment": "رش هيدروكسيد النحاس بعد التقليم", "prevention": "تقليم الأفرع المتداخلة"},
    "bacterial canker": {"cause": "التقرح البكتيري (بقع سوداء مرفوعة)", "treatment": "رش مركبات نحاسية بعد العواصف", "prevention": "حماية الأشجار بمصدات رياح"},
    "dieback": {"cause": "موت الأفرع من القمة للأسفل", "treatment": "قص الأجزاء المصابة ودهان مكان القص", "prevention": "تنظيم الري وتجنب الملوحة"},
    "mango fruit fly": {"cause": "ذبابة فاكهة المانجو (تدود الثمار)", "treatment": "استخدام مصائد فرمونية ورش طعوم", "prevention": "جمع الثمار المتساقطة ودفنها"},
    "mango mealybug": {"cause": "البق الدقيقي (تجمعات قطنية بيضاء)", "treatment": "رش زيوت صيفية ومبيد كلوربيريفوس", "prevention": "غسل السيقان بضغط ماء قوي"},
    "thrips": {"cause": "حشرة التربس (تسبب تشوه الأوراق)", "treatment": "رش مبيد سبينوساد حيوي", "prevention": "مكافحة الحشائش دورياً"},
    "weevil": {"cause": "سوسة بذور المانجو", "treatment": "التخلص من الثمار المصابة", "prevention": "حرث التربة تحت الأشجار صيفاً"},
    "gall midge": {"cause": "ذبابة الجال (تسبب تدرنات بالأوراق)", "treatment": "رش مبيد حشري جهازي", "prevention": "التقليم والتخلص من الأوراق المصابة"},
    "mango hopper": {"cause": "نطاطات المانجو (تمتص الأزهار)", "treatment": "رش مبيد كونفيدور (Confidor)", "prevention": "تفتيح قلب الشجرة للشمس"},
    "powdery mildew": {"cause": "البياض الدقيقي (بودرة بيضاء على الزهر)", "treatment": "رش كبريت ميكروني أو مبيد توباس", "prevention": "المتابعة الدقيقة وقت التزهير"},
    "sooty mold": {"cause": "العفن الهبابي الأسود (بسبب الندوة العسلية)", "treatment": "غسل الشجرة بمحلول صابوني", "prevention": "مكافحة الحشرات المفرزة للندوة العسلية"},
    "stem-end-rot": {"cause": "عفن نهاية الثمرة عند القطف", "treatment": "غمس الثمار في محلول مطهر", "prevention": "تجنب القطف في الجو الرطب"},
    "healthy": {"cause": "النبات سليم وبحالة جيدة", "treatment": "لا يتطلب علاج كيميائي", "prevention": "الاستمرار في الري والتسميد المتوازن"}
}

# =====================
# 3. CORE VLM CLASS
# =====================
class CropVLM:

    def __init__(self, model_path, classes_path):

        print("⏳ Loading Multimodal Brain...")

        try:
            self.model = tf.keras.models.load_model(model_path)

            self.classes = np.load(
                classes_path,
                allow_pickle=True
            )

            print("✅ System Ready.")

        except Exception as e:

            print(f"❌ Error loading models: {e}")

    # =====================
    # PREPROCESSING
    # =====================
    def preprocess_inputs(
        self,
        image_path,
        temp,
        humidity,
        age
    ):

        # Image
        img = cv2.imread(image_path)

        img = cv2.cvtColor(
            img,
            cv2.COLOR_BGR2RGB
        )

        # ✅ FIXED SIZE
        img = cv2.resize(img, (300, 300))

        img = img / 255.0

        img_batch = np.expand_dims(
            img,
            axis=0
        )

        # Metadata normalization
        meta_batch = np.array(
            [[
                temp / 50.0,
                humidity / 100.0,
                age / 120.0
            ]],
            dtype='float32'
        )

        return img_batch, meta_batch

    # =====================
    # MAIN PREDICTION
    # =====================
    def predict_and_explain(
        self,
        image_path,
        temp,
        humidity,
        age
    ):

        img_in, meta_in = self.preprocess_inputs(
            image_path,
            temp,
            humidity,
            age
        )

        preds = self.model.predict(
            {
                "image_input": img_in,
                "meta_input": meta_in
            },
            verbose=0
        )[0]

        idx = np.argmax(preds)

        raw_label = self.classes[idx]

        confidence = float(preds[idx])

        # Normalize label
        lookup_label = raw_label.lower().replace("_", " ")

        # Default knowledge
        info = {
            "cause": "غير محدد",
            "treatment": "استشر خبيراً",
            "prevention": "نظافة الحقل"
        }

        for key in DISEASE_KNOWLEDGE:

            if key in lookup_label:

                info = DISEASE_KNOWLEDGE[key]

                break

        # Final response
        return {

            "disease_name":
                raw_label.replace("_", " ").title(),

            # ✅ FLOAT not string
            "confidence": confidence,

            "arabic_explanation": {

                "السبب": info["cause"],

                "العلاج": info["treatment"],

                "الوقاية": info["prevention"]
            }
        }

    # =====================
    # SMART ADVISOR
    # =====================
    def generate_behavior_advice(
        self,
        disease,
        moisture,
        temp,
        humidity,
        crop,
        region
    ):

        advice = []

        # =====================
        # REGIONAL LOGIC
        # =====================

        # Mango / Upper Egypt
        if crop.lower() == "mango":

            if "صعيد" in region:

                if temp > 38:

                    advice.append(
                        "⚠️ الحرارة مرتفعة في صعيد مصر. "
                        "يُفضل الري مساءً لتقليل إجهاد أشجار المانجو."
                    )

        # Wheat / Delta
        if crop.lower() == "wheat":

            if "دلتا" in region:

                if humidity > 80:

                    advice.append(
                        "⚠️ الرطوبة مرتفعة في الدلتا. "
                        "يزداد خطر الصدأ الأصفر."
                    )

        # Potato / Humidity
        if crop.lower() == "potato":

            if humidity > 85:

                advice.append(
                    "⚠️ الرطوبة العالية قد تزيد خطر "
                    "اللفحة المتأخرة في البطاطس."
                )

        # =====================
        # SOIL MOISTURE LOGIC
        # =====================

        if moisture < 20:

            advice.append(
                f"💧 التربة جافة ({moisture}%). "
                "ابدأ الري فوراً."
            )

        elif moisture > 45:

            advice.append(
                f"🚫 رطوبة التربة مرتفعة ({moisture}%). "
                "قلل الري لتجنب أعفان الجذور."
            )

        else:

            advice.append(
                f"✅ رطوبة التربة مناسبة ({moisture}%)."
            )

        return " ".join(advice)