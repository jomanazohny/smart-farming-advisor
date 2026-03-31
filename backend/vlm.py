import os
import tensorflow as tf
import numpy as np
import cv2

# --- الإعدادات (يجب أن تطابق كود تدريب Kaggle) ---
MODEL_PATH = "models/egypt_crop_pro_v4.h5"
CLASSES_PATH = "models/classes_v4.npy"
IMG_SIZE = (300, 300)

# قاموس ترجمة أسماء الأمراض من الإنجليزية (الموجودة في الموديل) إلى العربية
DISEASE_TRANSLATION = {
    "brown rust": "صدأ القمح البني",
    "fusarium head blight": "عفن السنابل (فيوزاريوم)",
    "mildew": "البياض الدقيقي",
    "mite": "العنكبوت الأحمر (أكاروس)",
    "stem fly": "ذبابة الساق",
    "yellow rust": "صدأ القمح الأصفر",
    "aphids": "حشرة المن",
    "armyworms": "الدودة الجياشة",
    "root rot": "أعفان الجذور",
    "septoria leaf blotch": "تبقع الأوراق السبتوري",
    "stem rust": "صدأ الساق",
    "wheat blast": "لفحة القمح",
    "bacterial wilt": "الذبول البكتيري",
    "blackleg": "الساق السوداء",
    "common scab": "الجرب العادي",
    "cutworms": "الديدان القارضة",
    "flea beetle": "خنفساء البراغيث",
    "pvy": "فيروس البطاطس Y",
    "blackspot bruising": "كدمات البقع السوداء",
    "dry rot": "العفن الجاف",
    "early blight": "اللفحة المبكرة",
    "late blight": "اللفحة المتأخرة",
    "potato tuber moth": "سوسة درنات البطاطس",
    "soft rot": "العفن البكتيري الطري",
    "whiteflies": "الذبابة البيضاء",
    "anthracnose": "الأنثراكنوز",
    "bacterial canker": "التقرح البكتيري",
    "dieback": "موت الأفرع (Dieback)",
    "mango fruit fly": "ذبابة فاكهة المانجو",
    "mango mealybug": "البق الدقيقي",
    "thrips": "حشرة التربس",
    "weevil": "سوسة بذور المانجو",
    "gall midge": "ذبابة الجال",
    "mango hopper": "نطاطات المانجو",
    "powdery mildew": "البياض الدقيقي",
    "sooty mold": "العفن الهبابي الأسود",
    "stem-end-rot": "عفن نهاية الثمرة",
    "healthy": "نبات سليم"
}

# قاعدة البيانات المعرفية التي أرسلتها
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
    "early blight": {"cause": "اللفحة المبكرة (فطري)", "treatment": "رش مبيد سكور أو مانكوزيب", "prevention": "التخلص من النباتات المصابة"},
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

class CropVLM:
    def __init__(self):
        print("⏳ Loading Pro-Level Multimodal Model...")
        try:
            self.model = tf.keras.models.load_model(MODEL_PATH)
            self.classes = np.load(CLASSES_PATH, allow_pickle=True)
            print(f"✅ Model Ready. Target: {IMG_SIZE}")
        except Exception as e:
            print(f"❌ Error: {e}")

    def preprocess_inputs(self, image_path, temp, humidity, age):
        # 1. معالجة الصورة (Resize to 300x300)
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, IMG_SIZE)
        img_array = np.array(img, dtype='float32') / 255.0
        img_batch = np.expand_dims(img_array, axis=0)

        # 2. تطبيع البيانات البيئية (Scaling)
        # استخدام نطاقات تقريبية لضمان قيم بين 0 و 1
        s_temp = (float(temp) - 10.0) / 35.0
        s_hum = (float(humidity) - 20.0) / 80.0
        s_age = float(age) / 120.0
        
        meta_values = np.clip([s_temp, s_hum, s_age], 0, 1)
        meta_batch = np.array([meta_values], dtype='float32')

        return img_batch, meta_batch

    def predict_and_explain(self, image_path, temp, humidity, age):
        try:
            img_in, meta_in = self.preprocess_inputs(image_path, temp, humidity, age)
            
            # Predict using the named inputs from your training script
            preds = self.model.predict({
                "image_input": img_in, 
                "meta_input": meta_in
            }, verbose=0)[0]

            idx = np.argmax(preds)
            confidence = float(preds[idx])
            
            # --- STEP A: CLEAN THE KEY ---
            # Model output 'Yellow_Rust' -> cleaned 'yellow rust'
            raw_label = str(self.classes[idx]).lower().replace("_", " ").strip()

            # --- STEP B: THE "RANDOM PHOTO" FIX ---
            # If the model is < 45% sure, it's likely a random object
            if confidence < 0.45:
                return {
                    "disease_name": "غير معروف",
                    "confidence": confidence,
                    "arabic_explanation": {
                        "السبب": "لم يتم التعرف على ورقة محصول (قمح، بطاطس، مانجو) بشكل مؤكد.",
                        "العلاج": "يرجى تصوير الورقة بوضوح في إضاءة جيدة.",
                        "الوقاية": "تأكد من أن الكاميرا تركز على الورقة المصابة فقط."
                    }
                }

            # --- STEP C: TRANSLATION ---
            # Match 'yellow rust' to your Arabic dictionary
            arabic_name = DISEASE_TRANSLATION.get(raw_label, raw_label.title())

            # --- STEP D: KNOWLEDGE BASE ---
            info = DISEASE_KNOWLEDGE.get(raw_label, {
                "cause": "إصابة غير مسجلة بالتفصيل.",
                "treatment": "يرجى استشارة خبير زراعي.",
                "prevention": "حافظ على نظافة الحقل."
            })

            return {
                "disease_name": arabic_name,
                "confidence": confidence,
                "arabic_explanation": {
                    "السبب": info["cause"],
                    "العلاج": info["treatment"],
                    "الوقاية": info["prevention"]
                }
            }
        except Exception as e:
            print(f"VLM Error: {e}")
            return {"disease_name": "خطأ", "confidence": 0, "arabic_explanation": {}}