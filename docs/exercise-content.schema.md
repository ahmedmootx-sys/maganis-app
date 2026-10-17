# معيار ومخطط محتوى التمارين — Exercise Content Schema

تاريخ التوثيق: 17 أكتوبر 2026  
المرجع: TASK F — بند 2.7 (تبويب الفهم والتوثيق العلمي التشريحي)

---

## 1. الغرض والمبادئ

وفقاً لقاعدة الحقيقة المطلقة في البيانات (Data Truth) والقاعدة R3 وR5، يُحظر استخدام النصوص التوليدية العامة أو العبارات المكررة الجاهزة (Boilerplate) مثل «تطوير القوة العضلية والتحمل العضلي لعضلات... مع تحسين التوافق العضلي العصبي».
إذا لم يتم تدقيق وصياغة المحتوى التشريحي والميكانيكي للتمرين من مراجع علمية معتمدة ومراجعتها من قبل متخصص، يجب على التطبيق أن يُصرّح بصدق أن المحتوى «قيد المراجعة والتوثيق».

---

## 2. مخطط البيانات (JSON Schema)

الملف المرجعي: [`src/data/exercise-content.json`](file:///src/data/exercise-content.json)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ExerciseContentDatabase",
  "type": "object",
  "description": "قاعدة التوثيق التشريحي والميكانيكي الحيوي لتمارين مجانص",
  "patternProperties": {
    "^[a-z0-9_-]+$": {
      "type": "object",
      "required": ["exerciseId", "whyThisExerciseAr", "howItWorksAr"],
      "properties": {
        "exerciseId": {
          "type": "string",
          "description": "المعرّف الفريد للتمرين المطابق لقاعدة EXERCISES"
        },
        "whyThisExerciseAr": {
          "type": "string",
          "description": "الجدوى التدريبية الحقيقية والميزة الميكانيكية للتمرين دون حشو"
        },
        "howItWorksAr": {
          "type": "string",
          "description": "المسار الحركي والمفاصل النشطة ومنحنى المقاومة (Resistance Curve)"
        },
        "anatomicalFocusAr": {
          "type": "string",
          "description": "الرؤوس العضلية المستهدفة وعلاقة الشد بالاستطالة (Stretch-mediated hypertrophy)"
        },
        "commonMistakesAr": {
          "type": "array",
          "items": { "type": "string" },
          "description": "الأخطاء الشائعة المؤثرة على الأمان والفاعلية"
        },
        "scientificReferences": {
          "type": "array",
          "items": { "type": "string" },
          "description": "المراجع الطبية والرياضية المحكّمة (دراسات، كتب ميكانيكا حيوية)"
        },
        "reviewedBy": {
          "type": "string",
          "description": "اسم المراجع أو اللجنة المعتمدة"
        },
        "reviewedAt": {
          "type": "string",
          "format": "date",
          "description": "تاريخ الاعتماد"
        }
      }
    }
  }
}
```

---

## 3. سلوك العرض البرمجي في تبويب «الفهم»

1. **إذا وُجد محتوى موثق ومُعتمد في `exercise-content.json`**:
   - يتم عرض كارت «ليه التمرين ده؟» (Why This Exercise).
   - يتم عرض كارت «إزاي بيشتغل ومساره الميكانيكي» (How It Works).
   - يتم عرض كارت «التركيز التشريحي» (Anatomical Focus).
   - يتم عرض قائمة المراجع العلمية مع وسم `<bdi dir="ltr">`.
2. **إذا لم يتوفر محتوى موثق للتمرين**:
   - يُعرض كارت صادق وأصيل بعنوان:
     «تفاصيل الفهم التشريحي لهذا التمرين قيد المراجعة والتوثيق».
   - لا يُعرض أي نص عام مكرر أو افتراضي.
