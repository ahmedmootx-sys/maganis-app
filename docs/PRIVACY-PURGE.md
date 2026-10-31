# دليل تطهير البيانات الشخصية من تاريخ Git (Privacy Purge Guide)

> [!CAUTION]
> **تنبيه هام للخصوصية:**
> تم حذف ملف البيانات الشخصية `docs/owner-profile-dump.json` من شجرة العمل الحالية واستبداله بنموذج تجريبي مصطنع `fixtures/persona.synthetic.json`.
> **ومع ذلك، تظل بيانات الملف قابلة للقراءة في تاريخ Git السابق (55 commit منذ 18 أكتوبر 2026) وفي سجلات GitHub حتى يقوم المالك بتنفيذ عملية إعادة كتابة التاريخ ودفعها بالقوة (Force Push).**

---

## 1. الخطوات الدقيقة لإزالة الملف نهائياً من كافة الـ Commits السابقة

لإزالة الملف من تاريخ المستودع بالكامل دون التأثير على بقية الملفات، يُوصى باستخدام أداة `git-filter-repo` الرسمية:

### أ. تثبيت الأداة

```bash
# باستخدام pip
pip install git-filter-repo
```

### ب. أخذ نسخة احتياطية من المستودع أولاً

قبل أي تعديل على تاريخ Git، قم بعمل نسخة احتياطية كاملة للمجلد محلياً:

```bash
cp -r maganis-project maganis-project-backup
```

### ج. تشغيل أمر التطهير

في مجلد المشروع:

```bash
git filter-repo --path docs/owner-profile-dump.json --invert-paths
```

### د. إعادة ربط الـ Remote والدفع بالقوة (Force Push)

تقوم أداة filter-repo بإلغاء ربط الـ origin للحماية. أعد إضافته ثم ادفع:

```bash
git remote add origin <your-github-repo-url>
git push origin --force --all
git push origin --force --tags
```

---

## 2. التحذيرات والملاحظات التقنية (Caveats)

1. **النسخ المحلية والمستنسخات السابقة (Existing Clones & Forks):**
   - أي شخص قام بعمل `git clone` أو `Fork` للمستودع قبل عملية التطهير سيظل يمتلك النسخة القديمة من التاريخ.
   - إذا كان هناك مساهمون آخرون، يجب عليهم إعادة استنساخ المستودع (`git clone`) بدلاً من عمل `git pull`.

2. **التخزين المؤقت لـ GitHub (GitHub Caches & Pull Requests):**
   - الـ Commits القديمة قد تظل مخزنة مؤقتاً في GitHub وتظهر إذا تم الوصول إليها برابط مباشر للـ Commit SHA.
   - للتخلص من التخزين المؤقت، يمكن التواصل مع دعم GitHub (GitHub Support) لطلب "Running git gc on the remote repository" أو حذف الـ Pull Requests المرتبطة إن وجدت.

---

## 3. حماية البريد الإلكتروني للمؤلف في تاريخ Git

عنوان البريد الإلكتروني المستخدم في commits المستودع هو البريد الشخصي للمالك.
لحماية البريد الشخصي في أي commits مستقبلية:

1. توجّه إلى إعدادات GitHub: **Settings -> Emails**.
2. فعّل خيار **Keep my email addresses private**.
3. فعّل خيار **Block command line pushes that expose my email**.
4. اضبط Git محلياً لاستخدام بريد GitHub المجهول (no-reply):

```bash
git config --global user.email "ID+username@users.noreply.github.com"
```

أو للمستودع الحالي فقط:

```bash
git config user.email "ID+username@users.noreply.github.com"
```

---

## 4. تدقيق وتطهير المسارات والبيانات الشخصية (Task H4.7 Audit)

تم إجراء فحص شامل وكامل لجميع الملفات المتتبعة في المستودع (`git ls-files`):

1. **تطهير المسارات المطلقة:** تم فحص وإزالة كافة الروابط والمسارات التي تحتوي على مجلدات المستخدم الشخصية على Windows (مثل مسارات `file:///` ومجلدات المستخدمين المحلية) واستبدالها بروابط نسبية نظيفة (`./` أو `../`) في كافة التقارير والتوثيقات:
   - `docs/PROJECT_CONTEXT.md`
   - `docs/STATE.md`
   - `docs/f-report.md`
   - `docs/g-report.md`
   - `docs/g2-evidence/*.txt`
   - `reports/g5-a-report.md`, `g5-c-report.md`, `g6-b-report.md`, `g6-c-report.md`, `h1-report.md`, `h2-h3-report.md`
2. **استبدال الملفات الشخصية في السكربتات:** كافة سكربتات الاختبار والتقاط الأدلة (`scripts/check-ui.mjs`, `scripts/capture-g5a-screenshots.mjs`, `scripts/capture-g6b-evidence.mjs`, `qa/drive.ts`) تقرأ الآن حصرياً من النموذج التجريبي المصطنع `fixtures/persona.synthetic.json`.
3. **تحديث وتفعيل بوابة الخصوصية (`scripts/gate-no-personal-data.mjs`):**
   - تم تزويد البوابة بـ 6 قواعد صارمة لفحص:
     - أسماء الملفات المحظورة.
     - السجلات الطبية والتشخيصات في ملفات JSON.
     - المسارات المطلقة لنظام التشغيل في كافة الملفات النصية.
     - عناوين البريد الإلكتروني الحقيقية.
     - أرقام الهواتف الشخصية والدولية.
     - المعرفات والأسماء الشخصية المحظورة.
   - البوابة أظهرت **RED** أولاً (32 انتهاكاً موثقة في `evidence/h4/red/gate-no-personal-data.txt`).
   - بعد التطهير، البوابة خضراء تماماً (**0 violations**) في `evidence/h4/green/gate-no-personal-data.txt`.
