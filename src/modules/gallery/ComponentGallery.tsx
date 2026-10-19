import { useState } from 'react'
import {
  TopBar,
  Section,
  Card,
  Button,
  IconButton,
  Chip,
  ChipRow,
  ToggleChip,
  Segmented,
  Field,
  Callout,
  EmptyState,
  Sheet,
  ConfirmSheet,
} from '../../ui/index.ts'
import { ExerciseThumb } from '../../components/ExerciseThumb.tsx'
import { plural } from '../../utils/plural.ts'

export function ComponentGallery() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [fontScale, setFontScale] = useState<'1' | '1.3'>('1')
  const [viewportWidth, setViewportWidth] = useState<'360' | '100%'>('360')
  const [segmentedVal, setSegmentedVal] = useState('sets')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [textareaVal, setTextareaVal] = useState('')

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Gallery Header Controls */}
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto 16px',
          background: theme === 'dark' ? '#1e293b' : '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--line, #334155)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            معرض المكونات (Component Gallery)
          </h2>
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              window.location.hash = '#/home'
            }}
          >
            ← العودة للرئيسية
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          <div>
            <div
              style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}
            >
              المظهر (Theme)
            </div>
            <Segmented
              options={[
                { value: 'dark', label: 'داكن' },
                { value: 'light', label: 'فاتح' },
              ]}
              value={theme}
              onChange={(val) => setTheme(val as 'light' | 'dark')}
            />
          </div>

          <div>
            <div
              style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}
            >
              حجم الخط (Scale)
            </div>
            <Segmented
              options={[
                { value: '1', label: '1.0×' },
                { value: '1.3', label: '1.3×' },
              ]}
              value={fontScale}
              onChange={(val) => setFontScale(val as '1' | '1.3')}
            />
          </div>

          <div>
            <div
              style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}
            >
              عرض الإطار (Width)
            </div>
            <Segmented
              options={[
                { value: '360', label: '360px' },
                { value: '100%', label: 'كامل' },
              ]}
              value={viewportWidth}
              onChange={(val) => setViewportWidth(val as '360' | '100%')}
            />
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div
        data-theme={theme}
        style={{
          width: viewportWidth === '360' ? '360px' : '100%',
          maxWidth: '680px',
          margin: '0 auto',
          fontSize: fontScale === '1.3' ? '130%' : '100%',
          border:
            viewportWidth === '360'
              ? '2px dashed var(--brand, #e65100)'
              : 'none',
          borderRadius: '16px',
          padding: '12px',
          boxSizing: 'border-box',
          background: 'var(--bg, #0f172a)',
          color: 'var(--ink, #f1f5f9)',
          transition: 'all 0.2s ease',
        }}
      >
        <TopBar
          title="معرض المكونات المتطابقة"
          subtitle="اختبار الحالات والحدود وضغط الشاشة 360px"
          onBack={() => {
            window.location.hash = '#/home'
          }}
        />

        {/* 1. Buttons & IconButtons */}
        <Section title="1. الأزرار وحالاتها">
          <Card padding="md">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <Button variant="primary" size="large" fullWidth>
                زر أساسي (Primary LG)
              </Button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="normal" style={{ flex: 1 }}>
                  ثانوي (Secondary)
                </Button>
                <Button variant="ghost" size="normal" style={{ flex: 1 }}>
                  شفاف (Ghost)
                </Button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="danger" size="normal" style={{ flex: 1 }}>
                  حرج (Danger)
                </Button>
                <Button
                  variant="primary"
                  size="normal"
                  disabled
                  style={{ flex: 1 }}
                >
                  معطل (Disabled)
                </Button>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '6px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  أزرار أيقونات (44×44px):
                </span>
                <IconButton name="plus" aria-label="إضافة" />
                <IconButton name="trash-2" aria-label="حذف" variant="danger" />
                <IconButton name="info" aria-label="معلومات" />
              </div>
            </div>
          </Card>
        </Section>

        {/* 2. Media / ExerciseThumb */}
        <Section title="2. صور ومصغرات التمارين (ExerciseThumb 56px)">
          <Card padding="md">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <ExerciseThumb
                  exercise={{
                    id: 'barbell-bench-press',
                    nameAr: 'بنش برس بالبار',
                    name: 'Barbell Bench Press',
                    category: 'chest',
                  }}
                  size={56}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '14px' }}>
                    بنش برس بالبار المستوي
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    تمرين له صورة حقيقية مصغرة
                  </div>
                </div>
                <bdi dir="ltr" style={{ fontWeight: 700, fontSize: '14px' }}>
                  3 × 8
                </bdi>
              </div>

              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <ExerciseThumb
                  exercise={{
                    id: 'unknown-custom-exercise',
                    nameAr: 'تمرين مخصص بدون صورة',
                    name: 'Custom Exercise',
                    category: 'back',
                  }}
                  size={56}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '14px' }}>
                    تمرين مخصص بدون صورة
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    يستخدم SVG تشريحي افتراضي
                  </div>
                </div>
                <bdi dir="ltr" style={{ fontWeight: 700, fontSize: '14px' }}>
                  4 × 12
                </bdi>
              </div>
            </div>
          </Card>
        </Section>

        {/* 3. Text & Plural Rules (Part A5 Text Gate) */}
        <Section title="3. قواعد جمع الكلمات العربية والأرقام LTR">
          <Card padding="md">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13.5px',
              }}
            >
              <div>
                <strong>العدد 1: </strong>
                <span>{plural(1, 'مجموعة')}</span>
              </div>
              <div>
                <strong>العدد 2: </strong>
                <span>{plural(2, 'مجموعة')}</span>
              </div>
              <div>
                <strong>العدد 3 إلى 10 (جمع تكسير): </strong>
                <span>
                  {plural(3, 'مجموعة')}، {plural(7, 'تكرار')}،{' '}
                  {plural(4, 'تمرين')}
                </span>
              </div>
              <div>
                <strong>العدد 11 إلى 99 (مفرد منصوب): </strong>
                <span>
                  {plural(12, 'تكرار')}، {plural(15, 'تمرين')}
                </span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--line)',
                  paddingTop: '8px',
                }}
              >
                <strong>عزل الأرقام LTR: </strong>
                <span>ترتيب المجموعات والتكرارات: </span>
                <bdi
                  dir="ltr"
                  style={{ fontWeight: 800, color: 'var(--brand)' }}
                >
                  3 × 8
                </bdi>
                <span> ثم </span>
                <bdi
                  dir="ltr"
                  style={{ fontWeight: 800, color: 'var(--brand)' }}
                >
                  4 × 12-15
                </bdi>
              </div>
            </div>
          </Card>
        </Section>

        {/* 4. Segmented & Chips */}
        <Section title="4. عناصر التبديل والشيبس (Segmented & Chips)">
          <Card padding="md">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Segmented
                options={[
                  { value: 'sets', label: 'المجموعات' },
                  { value: 'history', label: 'السجل السابق' },
                  { value: 'notes', label: 'ملاحظات' },
                ]}
                value={segmentedVal}
                onChange={setSegmentedVal}
              />
              <ChipRow>
                <Chip active>صدر</Chip>
                <Chip>ترايسبس</Chip>
                <Chip>كتف أمامي</Chip>
                <ToggleChip checked={true} onChange={() => {}}>
                  تمرين مركب
                </ToggleChip>
              </ChipRow>
            </div>
          </Card>
        </Section>

        {/* 5. Inputs & Textareas */}
        <Section title="5. حقول الإدخال ومربعات النصوص">
          <Card padding="md">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <Field
                label="الوزن المستهدف"
                unit="كجم"
                placeholder="مثال: 85"
                defaultValue="80"
              />
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <label style={{ fontSize: '13px', fontWeight: 700 }}>
                  ملاحظات التمرين (3 أسطر على الأقل وبدون شريط تمرير)
                </label>
                <textarea
                  rows={3}
                  value={textareaVal}
                  onChange={(e) => setTextareaVal(e.target.value)}
                  placeholder="مثال: تركيز على النزول البطيء وثبات الكوعين..."
                  style={{
                    width: '100%',
                    minHeight: '84px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--line)',
                    fontSize: '13.5px',
                    background: 'var(--card-bg)',
                    color: 'var(--ink)',
                    boxSizing: 'border-box',
                    resize: 'none',
                    textAlign: 'start',
                  }}
                />
              </div>
            </div>
          </Card>
        </Section>

        {/* 6. Callout & EmptyState */}
        <Section title="6. التنبيهات والحالات الفارغة">
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <Callout tone="info">
              هذا تنبيه إرشادي للعضلات المساعدة في الحركة.
            </Callout>
            <Callout tone="warning">لديك تمرين لم تسجل وزنه في الجلسة.</Callout>
            <Callout tone="danger">يرجى تصحيح الوزن المدخل قبل الحفظ.</Callout>

            <Card padding="md">
              <EmptyState
                title="لا توجد تمارين مضافة"
                description="ابدأ بإضافة تمرين أول لجلسة اليوم"
                actionLabel="إضافة تمرين"
                onAction={() => setIsSheetOpen(true)}
              />
            </Card>
          </div>
        </Section>

        {/* 7. Stress Testing (Long titles at 360px) */}
        <Section title="7. اختبار النصوص الطويلة والمزدوجة">
          <Card padding="md">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ lineHeight: 1.6 }}>
                <strong style={{ fontSize: '15px' }}>
                  تمرين ضغط الصدر بالدمبل على بنش مائل بزاوية 30 درجة مع دوران
                  المعصم للداخل في أعلى الحركة
                </strong>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    marginTop: '4px',
                  }}
                >
                  Incline Dumbbell Bench Press with Pronation
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setIsSheetOpen(true)}
                >
                  تجربة النافذة السفلية (Sheet)
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  تأكيد الحذف (Confirm)
                </Button>
              </div>
            </div>
          </Card>
        </Section>
      </div>

      {/* Demo Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="نافذة سفلية تجريبية"
        footer={
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <Button
              variant="ghost"
              onClick={() => setIsSheetOpen(false)}
              style={{ flex: 1 }}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsSheetOpen(false)}
              style={{ flex: 2 }}
            >
              حفظ وتطبيق
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>
          هذه النافذة تعرض ارتفاع الشيت وعناصره مع الالتزام بقياسات الهاتف 360px
          وتجاوب الأزرار جنباً إلى جنب.
        </p>
      </Sheet>

      {/* Demo ConfirmSheet */}
      <ConfirmSheet
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
        title="تأكيد حذف التمرين"
        message="هل أنت متأكد من حذف هذا التمرين من الجلسة الحالية؟"
        confirmLabel="حذف التمرين"
        cancelLabel="تراجع"
        isDestructive
      />
    </div>
  )
}
