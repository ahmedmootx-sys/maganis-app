import React, { useState } from 'react'
import {
  TopBar,
  Section,
  Card,
  Button,
  IconButton,
  Chip,
  ChipRow,
  ToggleChip,
  Toggle,
  Segmented,
  Tabs,
  Field,
  Select,
  DateField,
  FileField,
  ListRow,
  Stat,
  KeyValueList,
  Callout,
  EmptyState,
  Skeleton,
  ProgressBar,
  WizardProgress,
  OptionList,
  Sheet,
  ConfirmSheet,
} from '../ui/index.ts'
import { fmtNumber, fmtDate, fmtWeight } from '../utils/bidi.ts'

export const Styleguide: React.FC = () => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Interactive demo states
  const [toggleVal, setToggleVal] = useState(false)
  const [segmentedVal, setSegmentedVal] = useState('day')
  const [activeTab, setActiveTab] = useState('t1')
  const [chipSelected, setChipSelected] = useState('c1')
  const [toggleChipVal, setToggleChipVal] = useState(true)
  const [selectVal, setSelectVal] = useState('opt2')
  const [multiSelectVal, setMultiSelectVal] = useState<string[]>([
    'opt1',
    'opt3',
  ])
  const [dateVal, setDateVal] = useState('2026-10-15')
  const [fileName, setFileName] = useState<string | undefined>(
    'workout-plan.json',
  )
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [optionListVal, setOptionListVal] = useState('chest')
  const [wizardStep, setWizardStep] = useState(2)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <div
      className="styleguide-container"
      data-theme={theme}
      style={{
        paddingBottom: '80px',
        maxWidth: '640px',
        marginInline: 'auto',
      }}
    >
      <TopBar
        title="دليل التصميم والمكونات"
        actions={[
          {
            icon: theme === 'light' ? 'moon' : 'sun',
            ariaLabel: 'تبديل المظهر',
            onClick: toggleTheme,
          },
        ]}
      />

      <div style={{ padding: '16px' }}>
        {/* Section 0: Theme Toggle */}
        <Card style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong style={{ fontSize: '15px' }}>المظهر الحالي: </strong>
              <span>{theme === 'light' ? 'فاتح (Light)' : 'داكن (Dark)'}</span>
            </div>
            <Button variant="secondary" onClick={toggleTheme}>
              تبديل إلى {theme === 'light' ? 'الداكن' : 'الفاتح'}
            </Button>
          </div>
        </Card>

        {/* Section 1: Color Tokens & Reserved Muscle Colors */}
        <Section title="1. رموز الألوان والسمات (Color Tokens)">
          <Card>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div>
                <span
                  style={{ fontSize: '12px', color: 'var(--color-text-2)' }}
                >
                  اللون الأساسي والخطوة المشتقة للنص (WCAG AA):
                </span>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--color-accent)',
                      color: 'var(--color-accent-contrast)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    البرتقالي الأساسي (#f95700)
                  </div>
                  <div
                    style={{
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-accent-text)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1px solid var(--color-divider)',
                    }}
                  >
                    نص برتقالي مطابق (4.75:1 AA)
                  </div>
                </div>
              </div>

              <div>
                <span
                  style={{ fontSize: '12px', color: 'var(--color-text-2)' }}
                >
                  ألوان خريطة العضلات المحجوزة حصرياً للأطلس:
                </span>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--muscle-primary)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    عضلة أساسية (#E53935)
                  </div>
                  <div
                    style={{
                      background: 'var(--muscle-secondary)',
                      color: '#14161A',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1.2px dashed var(--muscle-secondary-outline)',
                    }}
                  >
                    عضلة مساعدة (#FDD835)
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Section>

        {/* Section 2: Typography & Numbers */}
        <Section title="2. مقياس الخطوط والأرقام اللاتينية (Typography & Bidi)">
          <Card>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div
                style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}
              >
                عنوان شاشة رئيسي 28px (<bdi>{fmtNumber(1250)}</bdi> كجم)
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
                عنوان قسم بارز 22px
              </div>
              <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                عنوان فرعي متوسط 18px
              </div>
              <div
                style={{ fontSize: 'var(--font-size-base)', fontWeight: 400 }}
              >
                نص عادي أساسي 16px مع وزن تدريبي <bdi>{fmtWeight(85.5)}</bdi>
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-2)',
                }}
              >
                نص مساعد وحواشي 14px بتاريخ <bdi>{fmtDate(dateVal)}</bdi>
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-2)',
                }}
              >
                تسمية مقتضبة وتبويبات 12px
              </div>
            </div>
          </Card>
        </Section>

        {/* Section 3: Buttons */}
        <Section title="3. الأزرار (Buttons & Targets >= 44px)">
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Button variant="primary" fullWidth size="large">
              زر أساسي عريض (ارتفاع 52px)
            </Button>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <Button variant="secondary" leadingIcon="dumbbell">
                زر ثانوي
              </Button>
              <Button variant="danger" leadingIcon="trash-2">
                زر خطر
              </Button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <Button variant="tertiary">زر نصي شفاف</Button>
              <Button variant="primary" loading>
                زر تحميل
              </Button>
            </div>

            <Button variant="secondary" disabled>
              زر معطل (Disabled)
            </Button>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <IconButton name="plus" aria-label="إضافة عنصر" />
              <IconButton name="filter" aria-label="تصفية" />
              <IconButton name="settings" aria-label="إعدادات" />
              <IconButton name="chevron-left" aria-label="للأمام" mirrorRtl />
            </div>
          </div>
        </Section>

        {/* Section 4: Selection Controls */}
        <Section title="4. أدوات الاختيار (Chips, Toggles, Tabs)">
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* ChipRow */}
            <div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                شريط الرقاقات القابل للتمرير (ChipRow):
              </span>
              <ChipRow>
                <Chip
                  active={chipSelected === 'c1'}
                  onClick={() => setChipSelected('c1')}
                >
                  الكل
                </Chip>
                <Chip
                  active={chipSelected === 'c2'}
                  onClick={() => setChipSelected('c2')}
                >
                  الصدر
                </Chip>
                <Chip
                  active={chipSelected === 'c3'}
                  onClick={() => setChipSelected('c3')}
                >
                  الظهر
                </Chip>
                <Chip
                  active={chipSelected === 'c4'}
                  onClick={() => setChipSelected('c4')}
                >
                  الأرجل
                </Chip>
                <Chip
                  active={chipSelected === 'c5'}
                  onClick={() => setChipSelected('c5')}
                >
                  الأكتاف
                </Chip>
                <Chip
                  active={chipSelected === 'c6'}
                  onClick={() => setChipSelected('c6')}
                >
                  الذراعين
                </Chip>
              </ChipRow>
            </div>

            {/* ToggleChip */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ToggleChip checked={toggleChipVal} onChange={setToggleChipVal}>
                عضلات عميقة متضمنة
              </ToggleChip>
            </div>

            {/* Toggle switch */}
            <Card>
              <Toggle
                id="st-toggle"
                checked={toggleVal}
                onChange={setToggleVal}
                label="التنبيهات الصوتية للجلسة"
              />
            </Card>

            {/* Segmented */}
            <div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                محدد المقاطع المتساوي (Segmented Control):
              </span>
              <Segmented
                options={[
                  { value: 'day', label: 'يومي' },
                  { value: 'week', label: 'أسبوعي' },
                  { value: 'month', label: 'شهري' },
                ]}
                value={segmentedVal}
                onChange={setSegmentedVal}
              />
            </div>

            {/* Tabs */}
            <Tabs
              sticky={false}
              tabs={[
                { id: 't1', label: 'التمارين', count: 12 },
                { id: 't2', label: 'الإحماء', count: 3 },
                { id: 't3', label: 'الإطالة' },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </Section>

        {/* Section 5: Form Fields */}
        <Section title="5. حقول الإدخال بدون عناصر متصفح أصلية (Form Fields)">
          <Card>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <Field
                label="اسم التمرين"
                helper="أدخل اسماً واضحاً للبحث"
                required
              >
                <input
                  type="text"
                  className="field-input"
                  placeholder="مثال: بنش برس مستوٍ"
                  defaultValue="تمرين بنش برس"
                />
              </Field>

              <Field label="الوزن المستهدف" unitSuffix="كجم">
                <input
                  type="text"
                  inputMode="decimal"
                  className="field-input"
                  defaultValue="80"
                />
              </Field>

              <Field
                label="حقل يحتوي على خطأ"
                error="الوزن يجب أن يكون قيمة رقمية موجبة"
              >
                <input
                  type="text"
                  className="field-input field-input--error"
                  defaultValue="-15"
                />
              </Field>

              {/* Sheet Select (Single) */}
              <Field label="المستوى التدريبي (بديل Native Select)">
                <Select
                  label="اختر المستوى التدريبي"
                  options={[
                    { value: 'opt1', label: 'مبتدئ (Beginner)' },
                    { value: 'opt2', label: 'متوسط (Intermediate)' },
                    { value: 'opt3', label: 'متقدم (Advanced)' },
                  ]}
                  value={selectVal}
                  onChange={(v) => setSelectVal(v as string)}
                />
              </Field>

              {/* Sheet Select (Multi) */}
              <Field label="العضلات المستهدفة (متعدد الاختيار)">
                <Select<string[]>
                  label="اختر العضلات المستهدفة"
                  multiple
                  options={[
                    { value: 'opt1', label: 'الصدر العلوي' },
                    { value: 'opt2', label: 'الصدر الأوسط' },
                    { value: 'opt3', label: 'الترايسبس' },
                    { value: 'opt4', label: 'الكتف الأمامي' },
                  ]}
                  values={multiSelectVal}
                  onChange={(v) => setMultiSelectVal(v)}
                />
              </Field>

              {/* DateField (Sheet Calendar) */}
              <Field label="تاريخ البدء (بديل Native Date)">
                <DateField
                  label="اختر تاريخ البدء"
                  value={dateVal}
                  onChange={setDateVal}
                />
              </Field>

              {/* FileField */}
              <Field label="ملف النسخة الاحتياطية (بديل Native File)">
                <FileField
                  fileName={fileName}
                  onChange={(f) => setFileName(f ? f.name : undefined)}
                />
              </Field>
            </div>
          </Card>
        </Section>

        {/* Section 6: Cards, ListRows & Stats */}
        <Section title="6. القوائم والصفوف والبيانات (ListRows & Stats)">
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Card>
              <ListRow
                leadingIcon="dumbbell"
                title="تمرين الرفرفة الجانبية بالدمبلز مع التركيز العضلي الكامل"
                subtitle="3 مجموعات × 12 تكرار • 14 كجم"
                showChevron
                onClick={() => {}}
              />
              <ListRow
                leadingIcon="flame"
                title="تسخين وإحماء حركي للكتف"
                subtitle="5 دقائق حبل أو دراجة"
                showChevron
                onClick={() => {}}
              />
            </Card>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
              }}
            >
              <Card compact>
                <Stat
                  label="إجمالي الحجم التدريبي"
                  value={14250}
                  unit="كجم"
                  trend={{ value: '+8%', direction: 'up' }}
                />
              </Card>
              <Card compact>
                <Stat
                  label="السعرات المحروقة"
                  value={460}
                  unit="ك.س"
                  icon="flame"
                />
              </Card>
            </div>

            <Card>
              <KeyValueList
                items={[
                  { key: 'الهدف الأساسي', value: 'زيادة الكتلة العضلية' },
                  { key: 'أيام التمرين الأسبوعية', value: '4 أيام', bdi: true },
                  { key: 'مؤشر كتلة الجسم (BMI)', value: '23.4', bdi: true },
                ]}
              />
            </Card>
          </div>
        </Section>

        {/* Section 7: Feedback, Callouts & Progress */}
        <Section title="7. التنبيهات والتقدم (Callouts & Progress)">
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Callout variant="info" title="تنبيه علمي">
              ينصح بالحفاظ على راحة لا تقل عن 90 ثانية بين المجموعات الأساسية.
            </Callout>

            <Callout variant="warning" title="محاذير الإصابة">
              تجنب النزول الحاد بالدمبلز أسفل مستوى الكتف لتفادي أوتار الكفة
              المدورة.
            </Callout>

            <Callout variant="success" title="إنجاز جديد">
              تم إكمال كافة تكرارات المجموعة الأخيرة بوزن قياسي جديد!
            </Callout>

            <Card>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                شريط التقدم التدريجي:
              </span>
              <ProgressBar value={75} max={100} showLabel variant="accent" />
            </Card>

            <Card>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                تقدم معالج الخطوات (WizardProgress):
              </span>
              <WizardProgress currentStep={wizardStep} totalSteps={5} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="small"
                  onClick={() => setWizardStep((s) => Math.max(1, s - 1))}
                  disabled={wizardStep <= 1}
                >
                  الخطوة السابقة
                </Button>
                <Button
                  size="small"
                  variant="primary"
                  onClick={() => setWizardStep((s) => Math.min(5, s + 1))}
                  disabled={wizardStep >= 5}
                >
                  الخطوة التالية
                </Button>
              </div>
            </Card>

            <Card>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                هيكل التحميل الوهمي (Skeleton):
              </span>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <Skeleton height={20} width="60%" />
                <Skeleton height={14} width="90%" />
                <Skeleton height={44} radius="control" />
              </div>
            </Card>

            <Card>
              <EmptyState
                icon="book-open"
                title="لا توجد تمارين مخصصة بعد"
                description="يمكنك إنشاء أول تمرين مخصص لجدولك بسهولة."
                action={{
                  label: 'إضافة تمرين جديد',
                  onClick: () => {},
                }}
              />
            </Card>
          </div>
        </Section>

        {/* Section 8: OptionList & Sheets */}
        <Section title="8. القوائم واللوحات السفلية (OptionList & Sheets)">
          <Card style={{ marginBottom: '16px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px',
              }}
            >
              قائمة الخيارات المتناسقة (OptionList):
            </span>
            <OptionList
              options={[
                {
                  value: 'chest',
                  title: 'تمارين الصدر',
                  subtitle: 'بنش برس، تفتيح، غطس',
                },
                {
                  value: 'back',
                  title: 'تمارين الظهر',
                  subtitle: 'عقلة، سحب أرضي، بار',
                },
                {
                  value: 'legs',
                  title: 'تمارين الأرجل',
                  subtitle: 'سكوات، طعن، ضغط أرجل',
                },
              ]}
              value={optionListVal}
              onChange={(v) => setOptionListVal(v as string)}
            />
          </Card>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >
            <Button variant="secondary" onClick={() => setIsSheetOpen(true)}>
              فتح لوحة سفلية (Sheet)
            </Button>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              فتح تأكيد الحذف
            </Button>
          </div>
        </Section>
      </div>

      {/* Demo Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="نافذة سفلية تجريبية"
        footer={
          <Button
            variant="primary"
            fullWidth
            onClick={() => setIsSheetOpen(false)}
          >
            حفظ وإغلاق
          </Button>
        }
      >
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--color-text)',
          }}
        >
          هذه نافذة سفلية مصممة بنمط Hevy مع شريط سحب علوي وتوافق كامل مع قارئات
          الشاشة وزر إغلاق وزر الهروب Esc وملاءمة تامة لأجهزة الهاتف.
        </p>
      </Sheet>

      {/* Demo ConfirmSheet */}
      <ConfirmSheet
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {}}
        title="هل أنت متأكد من مسح البيانات؟"
        consequences={[
          'سيتم مسح كافة سجلات التمارين والتغذية نهائياً.',
          'لن تتمكن من استرجاع البيانات إلا في حال وجود نسخة احتياطية.',
        ]}
        confirmLabel="مسح البيانات نهائياً"
        isDestructive={true}
        requiredWord="مسح"
      />
    </div>
  )
}
