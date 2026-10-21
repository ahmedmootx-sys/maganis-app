import { Sheet } from '../../components/Sheet.tsx'
import { Callout } from '../../components/Callout.tsx'
import { Button } from '../../ui'

export interface MacroGuideModalProps {
  onClose: () => void
}

/**
 * MacroGuideModal (Part 6.1 — Appendix C Coach-Authored Calculation Guide)
 * Contains accredited physiological sources and accurate Dietary Reference Intakes.
 */
export function MacroGuideModal({ onClose }: MacroGuideModalProps) {
  return (
    <Sheet isOpen={true} onClose={onClose} title="دليل حساب السعرات والماكروز">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '8px 0 24px',
        }}
        dir="rtl"
      >
        <Callout variant="tip">
          <strong>الأسس المعتمدة لحساب الطاقة والماكروز:</strong>
          <div
            style={{ marginTop: '4px', fontSize: '13px', lineHeight: '1.6' }}
          >
            تعتمد الحسابات على مراجع التغذية الرياضية المعتمدة لتوزيع الطاقة
            والمغذيات الكبرى بدقة علمية.
          </div>
        </Callout>

        {/* 1. Energy per gram */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 14px',
            background: 'var(--card-subtle)',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '14.5px',
              marginBottom: '6px',
              color: 'var(--color-text)',
            }}
          >
            1. الطاقة في الجرام
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--color-text)',
            }}
          >
            البروتين 4 سعرات، الكربوهيدرات 4 سعرات، الدهون 9 سعرات.
          </p>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--color-text-2)',
            }}
          >
            المصدر: معاملات أتواتر العامة (
            <bdi dir="ltr">Atwater general factors</bdi>)
          </div>
        </div>

        {/* 2. Protein */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 14px',
            background: 'var(--card-subtle)',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '14.5px',
              marginBottom: '6px',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              className="macro-marker macro-marker--protein"
              aria-hidden="true"
            />
            2. البروتين
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--color-text)',
            }}
          >
            المدى الشائع لمن يتدرب بالأثقال حوالي 1.6 إلى 2.2 جم لكل كجم من وزن
            الجسم يوميًا.
          </p>
          <div
            style={{
              margin: '6px 0 0',
              fontSize: '12.5px',
              color: 'var(--color-text)',
            }}
          >
            مثال حسابي: 75 كجم × 1.6 = 120 جم بروتين = 480 سعرة.
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--color-text-2)',
            }}
          >
            المصدر: Morton وآخرون، 2018،{' '}
            <bdi dir="ltr">British Journal of Sports Medicine</bdi>.
          </div>
        </div>

        {/* 3. Fats */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 14px',
            background: 'var(--card-subtle)',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '14.5px',
              marginBottom: '6px',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              className="macro-marker macro-marker--fats"
              aria-hidden="true"
            />
            3. الدهون
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--color-text)',
            }}
          >
            المدى الغذائي المقبول للبالغين من 20% إلى 35% من إجمالي السعرات.
          </p>
          <div
            style={{
              margin: '6px 0 0',
              fontSize: '12.5px',
              color: 'var(--color-text-2)',
            }}
          >
            نسبة الدهون التي يختارها التطبيق لا تُسمّى «حدًا أدنى»؛ تُعرض
            كاختيار داخل المدى أعلاه.
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--color-text-2)',
            }}
          >
            المصدر: <bdi dir="ltr">Institute of Medicine</bdi>، 2005،{' '}
            <bdi dir="ltr">Dietary Reference Intakes</bdi>.
          </div>
        </div>

        {/* 4. Carbs */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: '12px',
            padding: '12px 14px',
            background: 'var(--card-subtle)',
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: '14.5px',
              marginBottom: '6px',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              className="macro-marker macro-marker--carbs"
              aria-hidden="true"
            />
            4. الكربوهيدرات
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: '1.6',
              color: 'var(--color-text)',
            }}
          >
            ما يتبقى من السعرات بعد البروتين والدهون.
          </p>
          <div
            style={{
              margin: '8px 0',
              padding: '8px 12px',
              background: 'var(--color-surface)',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            الكارب بالجرام = (إجمالي السعرات − سعرات البروتين − سعرات الدهون) ÷
            4
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'var(--color-text-2)',
            }}
          >
            المصدر: المبادئ التوجيهية للجمعية الدولية للتغذية الرياضية (
            <bdi dir="ltr">ISSN</bdi>)
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '8px' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onClose}
            style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
          >
            فهمت الدليل العلمي
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
