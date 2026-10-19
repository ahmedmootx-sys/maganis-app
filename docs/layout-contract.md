# وثيقة العقد التخطيطي لمجانيس (Maganis Layout Contract)

> **الإصدار**: 2.0 (Task F)  
> **الهدف**: القضاء الجذري على مشاكل الحواف المقصوصة، تسرب النصوص خارج الحاويات، تراكب العناصر التفاعلية، والأشرطة العائمة فوق القاع على الأجهزة المحمولة الحقيقية.

---

## 1. مبادئ الحاوية الأساسية (AppShell & Scrolling Contract)

1. **ارتفاع الشاشة**:
   - يستخدم إطار التطبيق الخارجي (`.maganis-shell`, `.app--shell`, `.fullscreen-route`) الارتفاع الحقيقي `100dvh` دائماً، مع منع التمرير المزدوج (`overflow: hidden` على مستوى الحاوية الخارجية العليا).
   - يوجد **ممرر صفحة رئيسي واحد فقط** (`one page scroller`) للمحتوى الرئيسي (`.app-main`).

2. **حساب التباعد السفلي الصارم (Scroller Padding-Bottom)**:
   - **المسارات التي تحتوي على شريط التنقل السفلي (`BottomNav`)**:
     ```css
     padding-bottom: calc(
       var(--bottom-nav-h) + env(safe-area-inset-bottom) + 24px
     );
     ```
   - **المسارات التي لا تحتوي على شريط التنقل السفلي** (مثل الشاشات الكاملة والنماذج):
     ```css
     padding-bottom: calc(env(safe-area-inset-bottom) + 24px);
     ```
   - هذا يضمن وصول آخر عنصر في الصفحة دائماً إلى أعلى شريط التنقل بمقدار 24px على الأقل، بحيث لا يُحجب أي زر أو بطاقة تحت شريط التنقل على شاشات 360px أو شاشات الأندرويد ذات شريط الإيماءات.

---

## 2. عقد اللوحات السفلية والنوافذ المنبثقة (Sheets Contract)

1. **الحد الأقصى للارتفاع والتمرير**:
   - اللوحات المنبثقة (`.sheet`, `.sheet__content`):
     ```css
     max-height: calc(100dvh - 48px);
     display: flex;
     flex-direction: column;
     ```
   - الرأس (`.sheet__header`): ثابت في الأعلى مع زر الإغلاق وعنوان اللوحة.
   - الجسم (`.sheet__body`): ممرر مستقل (`overflow-y: auto; -webkit-overflow-scrolling: touch`).
2. **التذييل الثابت (Sticky Footer)**:
   - تذييل اللوحة (`.sheet__footer`) مثبت في أسفل اللوحة:
     ```css
     position: sticky;
     bottom: 0;
     z-index: 10;
     background: var(--bg-surface);
     padding-bottom: calc(env(safe-area-inset-bottom) + 12px);
     box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
     ```
   - **حظر الفجوات**: لا يُسمح بأي فراغ فارغ تحت التذييل، ولا يظهر أي محتوى يتسلل من تحته أثناء التمرير.
   - **إخفاء أشرطة التمرير**: إخفاء شريط التمرير الرأسي مع الإبقاء على حركة التمرير الطبيعية السلسة باللمس.

---

## 3. عقد أشرطة الإجراءات العائمة (Action Bars Contract)

1. **أشرطة معالج البدء (Wizard) ومصمم الجداول (Program Designer)**:
   - يجب أن ترتكز أشرطة الإجراءات السفلية (`.wizard-actions`, `.designer-actions`, `.sticky-action-bar`) على قاع إطار العرض الحقيقي (`bottom: 0` مع `padding-bottom: calc(env(safe-area-inset-bottom) + 12px)`).
   - حظر الطفو غير المبرر: منع ثغرة طفو شريط «إنشاء الجدول» على ارتفاع ~130px فوق القاع مع ظهور محتوى يمر تحته.
   - خلفية مصمتة (`solid background`) تحجب ما خلفها تماماً.

---

## 4. عقد النصوص والحاويات المرنة (Typography & Flex/Grid Child Contract)

1. **قاعدة الأبناء المرنة**:
   - كل عنصر ابن في `flex` أو `grid` يحتوي على نص يحصل إجبارياً على:
     ```css
     min-width: 0;
     ```
   - الكلمات اللاتينية الطويلة والمعرفات تحصل على:
     ```css
     overflow-wrap: anywhere;
     word-break: break-word;
     ```
2. **صفوف القوائم (List Rows Grid Contract)**:
   - كل صف قائمة (`.list-row`) يعتمد شبكة ثلاثية صريحة:
     ```css
     display: grid;
     grid-template-columns: 56px minmax(0, 1fr) auto;
     align-items: center;
     gap: 12px;
     ```
   - الصورة المصغرة (`thumbnail`): 56px ثابتة في البداية.
   - الاسم والبيانات: تتمدد وتنكسر بسلاسة بدون اقتصاص.
   - الأزرار التفاعلية (`trailing`): زر 44×44px ثابت في النهاية.
3. **حظر العروض الثابتة وقطع النصوص**:
   - منع `width` الثابت بوحدات البكسل على أي حاوية نصية.
   - حظر `white-space: nowrap` إلا في العناصر الموسومة صراحة بـ `data-ellipsis` والمزودة بـ `text-overflow: ellipsis`.

---

## 5. عقد صفوف الرقائق وممرات المحتوى (Chip Rows & Inner Scrollers)

1. **إخفاء أشرطة التمرير القبيحة**:
   - صفوف الرقائق (`.chips-row`, `.filter-chips`, `.tab-chips`) وجميع الممرات الأفقية:
     ```css
     scrollbar-width: none; /* Firefox */
     -ms-overflow-style: none; /* IE 10+ */
     ```
     ومع قاعدة WebKit:
     ```css
     &::-webkit-scrollbar {
       display: none;
     }
     ```
2. **التمرير الطبيعي والحواف**:
   - الحفاظ على التمرير السلس باللمس (`-webkit-overflow-scrolling: touch`).
   - هوامش داخلية للبداية والنهاية (`scroll-padding: 16px`) لضمان عدم قطع الرقاقة الأولى أو الأخيرة عند حافة الشاشة.
   - تظليل تلاشي حوافي خفيف (`edge fade`) للإشارة بوجود عناصر قابلة للتمرير.
