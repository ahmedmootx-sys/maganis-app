# توثيق تراخيص الوسائط وحقوق الملكية (Media Licensing & Attribution)

تاريخ المراجعة: 17 أكتوبر 2026  
الحالة: تدقيق كامل لبيئة التطوير والإنتاج التجريبي

---

## 1. مصادر الوسائط الحالية

تعتمد النسخة الحالية من تطبيق **مجانص** في مكتبة التمارين على المصادر المفتوحة التالية:

### أ. قاعدة بيانات التمارين المفتوحة (Free Exercise DB / Gym Visual)

- **المستودع الأصلي**: [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- **المصدر البصري**: رسومات ورسوم متحركة مستخرجة من رسومات Gym Visual ومكتبات التمارين المفتوحة.
- **نوع الوسائط**: صور رقمية بصيغة JPG (إطاران: وضعية البداية `0.jpg` وقمة الانقباض `1.jpg`).
- **شروط الاستخدام**:
  - تقتضي شروط المصدر الأصلي ذكر الإسناد وحفظ حقوق الملكية الفكرية.
  - الاستخدام الحالي محصور في بيئة التشغيل المحلي والأغراض غير التجارية والتجريبية.

### ب. النماذج التشريحية (BodyParts3D / Anatomography - الإصدار 4.0)

- **المصدر**: BodyParts3D, © The Database Center for Life Science (DBCLS).
- **الرخصة**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
- **النص الرسمي الصريح (Exact Official DBCLS Quote)**:
  > "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International."
- **التوثيق**: مفصل بالكامل في `docs/atlas-missing-muscles.md`.

---

## 2. الإسناد داخل واجهة التطبيق (In-App Attribution)

1. تم تفعيل الإسناد البصري الصريح أسفل كل وسيط تمرين في مكون `ExerciseVisual.tsx`:
   - يُعرض سطر مرجعي يوضح المصدر.
   - في حال كان التمرين يحتوي على مرجع طبي معتمد، يُعرض كمرجع علمي منفصل في تبويب «الفهم».
2. لا يُسمح بإخفاء حقوق Gym Visual أو DBCLS عند عرض المواد.

---

## 3. خطة العمل للإطلاق التجاري (Commercial Launch Checklist)

- [ ] استبدال صور ورسوم Gym Visual بمحتوى أصلي مصور أو مصمم ثلاثي الأبعاد خاص بتطبيق مجانص (3D / Motion Graphics) قبل الإطلاق التجاري العام.
- [ ] إجراء تدقيق نهائي على جميع روابط CDN لتجنب أي اعتماد خارجي على خوادم طرف ثالث دون اتصال إنترنت (Offline-first readiness).
- [ ] حفظ حزم الصور الأساسية محلياً داخل مجلد `public/exercises/` لضمان عمل التطبيق بالكامل بدون إنترنت.
