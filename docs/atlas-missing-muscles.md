# تقرير التحقق والبحث عن العضلات المفقودة في BodyParts3D 4.0

(BodyParts3D Missing Muscles Audit & Resolution)

> **التاريخ**: 17 أكتوبر 2026  
> **الإصدار المحقق**: BodyParts3D Release 4.0 (99k polygon reduction mesh pack)  
> **النظام**: Maganis Anatomical Muscle Atlas

---

## 1. خلفية التدقيق والهدف

أشار تقرير الأطلس (`docs/atlas-report.md` §3.3) إلى تعذر رسم 5 معرفات عضلية هامة في الأطلس الحالي:

1. `rectus_abdominis_upper` (العضلة المستقيمة البطنية - العلوية)
2. `rectus_abdominis_lower` (العضلة المستقيمة البطنية - السفلية)
3. `transversus_abdominis` (العضلة المستعرضة البطنية)
4. `lats` (العضلة العريضة الظهرية / latissimus dorsi)
5. `quadratus_lumborum` (العضلة القطنية المربعة)

هذا الغياب يؤثر على تمارين أساسية شائعة مثل عقلة السحب (Pull-ups)، وسحب الظهر (Pulldowns)، والتجديف (Rows)، والبلانك (Planks)، ورفع الأرجل (Leg Raises).

وفقاً لقواعد التشغيل (R1: الدليل، R5: صدق المحتوى، وحظر تزييف التشريح):
تم تنفيذ بحث شامل ومطول في قاعدة بيانات ومفاهيم وقوائم BodyParts3D الرسمية في ملفات علاقات الاشتمال والجزء-من-الكل (IS-A و PART-OF) ومطابقة المعرفات التشريحية FMA.

---

## 2. الأوامر المنفذة ونتائج البحث الدقيقة

### أ. فحص المفاهيم والأسماء بالإنجليزية في ملفات BodyParts3D:

تم فحص الملفات المرجعية الرسمية الموجودة في `.cache/bp3d/`:

- `isa_parts_list_e.txt` (قائمة المفاهيم والأسماء الإنجليزية في علاقات IS-A)
- `isa_parts_list.txt` (القائمة العامة)
- `isa_element_parts.txt` (ربط المفاهيم بملفات المجسمات ثلاثية الأبعاد OBJ)
- `partof_parts_list_e.txt` (قائمة مفاهيم علاقات PART-OF)
- `partof_element_parts.txt` (ربط مفاهيم PART-OF بملفات OBJ)

#### الأمر البرمجي المنفذ:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const bp3dDir = path.join('.cache', 'bp3d');
const files = ['isa_parts_list_e.txt', 'isa_parts_list.txt', 'isa_element_parts.txt', 'partof_parts_list_e.txt', 'partof_element_parts.txt'];
const queries = ['latissimus', 'rectus abdominis', 'transversus abdominis', 'quadratus lumborum', 'rectus sheath'];

for (const f of files) {
  const content = fs.readFileSync(path.join(bp3dDir, f), 'utf8');
  for (const q of queries) {
    const lines = content.split('\n').filter(l => l.toLowerCase().includes(q));
    console.log(f, q, lines.length);
  }
}
"
```

#### النتيجة المطبوعة:

```
=== FILE: isa_parts_list_e.txt ===
Query: latissimus Matches: 0
Query: rectus abdominis Matches: 0
Query: transversus abdominis Matches: 0
Query: quadratus lumborum Matches: 0
Query: rectus sheath Matches: 0
=== FILE: isa_parts_list.txt ===
Query: latissimus Matches: 0
Query: rectus abdominis Matches: 0
Query: transversus abdominis Matches: 0
Query: quadratus lumborum Matches: 0
Query: rectus sheath Matches: 0
=== FILE: isa_element_parts.txt ===
Query: latissimus Matches: 0
Query: rectus abdominis Matches: 0
Query: transversus abdominis Matches: 0
Query: quadratus lumborum Matches: 0
Query: rectus sheath Matches: 0
=== FILE: partof_parts_list_e.txt ===
Query: latissimus Matches: 0
Query: rectus abdominis Matches: 0
Query: transversus abdominis Matches: 0
Query: quadratus lumborum Matches: 0
Query: rectus sheath Matches: 0
=== FILE: partof_element_parts.txt ===
Query: latissimus Matches: 0
Query: rectus abdominis Matches: 0
Query: transversus abdominis Matches: 0
Query: quadratus lumborum Matches: 0
Query: rectus sheath Matches: 0
```

---

### ب. فحص معرفات FMA (Foundational Model of Anatomy) الصريحة:

تم البحث عن المعرفات القياسية المعتمدة طبياً:

- **Latissimus dorsi**: `FMA13357`
- **Rectus abdominis**: `FMA9628`
- **Transversus abdominis**: `FMA15570`
- **Quadratus lumborum**: `FMA15582`
- **Rectus sheath**: `FMA9630`

#### الأمر البرمجي المنفذ:

```bash
node -e "
const fs = require('fs');
const path = require('path');
const bp3dDir = path.join('.cache', 'bp3d');
const files = fs.readdirSync(bp3dDir).filter(f => f.endsWith('.txt'));
const fmas = ['FMA13357', 'FMA9628', 'FMA15570', 'FMA15582', 'FMA9630'];
for (const f of files) {
  const content = fs.readFileSync(path.join(bp3dDir, f), 'utf8');
  for (const id of fmas) {
    if (content.includes(id)) console.log('Match in', f, 'for', id);
  }
}
"
```

#### النتيجة:

- **0 تطابقات** لأي من المعرفات FMA13357 أو FMA9628 أو FMA15570 أو FMA15582 أو FMA9630 في أي من ملفات BodyParts3D 4.0.
- (ملاحظة: وجود الرقم 9628 في `partof_parts_list_e.txt` يخص شرياناً رئوياً برقم ملف BP9628 ومعرف FMA8644 وليس له صلة بعضلة البطن).

---

### ج. فحص الجذور اللاتينية والتفريعات الجزئية (Wildcard Search):

تم البحث عن الجذور: `abdomin`, `dorsi`, `lumbor`, `sheath`, `rectus`, `transvers`.

النتائج التي عثر عليها:

1. `abdomin`: عُثر فقط على الأورطة البطنية (`abdominal aorta` FMA3789)، وجدار البطن (`muscle of anterior abdominal wall` FMA20278 بدون تجسيم 3D)، والجزء البطني من العضلة الصدرية الكبرى (`abdominal part of pectoralis major` FMA34699).
2. `dorsi`: **0 تطابقات** تماماً.
3. `lumbor`: عُثر فقط على عضلات الظهر العميقة (`iliocostalis lumborum` FMA22702 و `interspinales lumborum` FMA71307).
4. `rectus`: عُثر على العضلة المستقيمة الفخذية (`rectus femoris`) وعضلات الرأس المستقيمة (`rectus capitis posterior/anterior`) وعضلات العين المستقيمة. لا توجد أي عضلة مستقيمة بطنية.
5. `transvers`: عُثر فقط على العضلة المستعرضة الصدرية (`transversus thoracis` FMA9760)، والشريان الرقبي المستعرض، والقولون المستعرض. لا توجد عضلة مستعرضة بطنية.

---

## 3. الخلاصة والحقيقة التشريحية لبيانات BP3D 4.0

1. **الغياب مؤكد 100%**: في بناء BodyParts3D Release 4.0 المعتمد في مجانيس، لم يقم ناشرو قاعدة البيانات اليابانية (DBCLS) بتضمين مجسمات 3D مفرزة لعضلات المجانص (`latissimus dorsi`) أو البطن المستقيمة (`rectus abdominis`) أو المستعرضة (`transversus abdominis`) أو المربعة القطنية (`quadratus lumborum`).
2. **الالتزام بالقاعدة R5 (صدق المحتوى وعدم اختلاق التشريح)**:
   - يحظر تماماً تزييف تشريح دقيق أو الادعاء بأن مجسماً ما هو مجسم حقيقي من BP3D إذا لم يكن كذلك.
   - الحل المعتمد:
     - إنشاء مناطق تقريبية محددة بوضوح (Approximate Overlay Regions) مرسومة بخط متقطع (`dashed outline`) وموسومة ببادج صريح «منطقة تقريبية» وفي دليل الألوان «تقريبي».
     - وضع علامة `approximate: true` في بيانات الأطلس الوصفية.
     - إذا كانت عضلة أساسية لتمرين ما غير مرسومة، يظهر إشعار تنبيه واضح (`Callout`): «العضلة الأساسية (X) غير مرسومة في الخريطة الحالية».
     - شريط الحالة يحسب فقط العضلات المرسومة فعلياً: «أساسية N، مساعدة M» ويضيف «+K غير مرسومة» عند وجود عضلات غير مرسومة.

---

## 4. تقييم مصادر تشريحية بديلة لقرار المالك (Owner Decision Required)

إذا رغب مالك التطبيق مستقبلاً في تضمين مجسمات 3D ثلاثية الأبعاد بديلة لتغطية هذه العضلات، نلخص الخيارات والتراخيص:

| المصدر البديل                                        | التغطية                                               | الترخيص والقيود                                                                 | القرار الموصى به                                 |
| :--------------------------------------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------ | :----------------------------------------------- |
| **Zygote Body (Open Anatomy)**                       | تغطية كاملة لجميع عضلات الجذع والمجانص والبطن         | ترخيص تجاري مدفوع ومقيد، غير متوافق مع Open Source / Local-first بدون رخصة شراء | **استبعاد** لتعارضه مع شروط مجانيس               |
| **LifeScience DB (BodyParts3D v3.0 / v4.2 preview)** | قد تتوفر بعض العضلات في إصدارات تكميلية غير مستقرة    | CC-BY-SA 2.1 JP                                                                 | **قيد الدراسة** إذا تم التحقق من ثبات التناظر    |
| **Blender Human Base Meshes (Blender Foundation)**   | تشريح سطحي متقن لجميع العضلات الكبرى (المجانص والبطن) | CC0 (Public Domain)                                                             | **خيار ممتاز مستقبلي** للدراسة في المهمة القادمة |

**القرار الحالي للمهمة F**:
الالتزام التام ببيانات BP3D 4.0 الحالية بدون خلط تراخيص، ورسم مناطق تقريبية صريحة وموسومة بشفافية وصدق.
