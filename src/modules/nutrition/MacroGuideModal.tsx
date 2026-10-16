import { Sheet } from '../../components/Sheet.tsx'
import { Callout } from '../../components/Callout.tsx'

export interface MacroGuideModalProps {
  onClose: () => void
}

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
      >
        {/* Introduction Callout */}
        <Callout variant="tip">
          <strong>الأسس الفسيولوجية لتوزيع المغذيات:</strong> المغذيات الكبرى هي
          الوقود ومواد البناء لجسمك. السعرات تمثل كمية الطاقة الإجمالية، بينما
          توزيع المغذيات يحدد نمو الكتلة العضلية والمحافظة عليها وخسارة الدهون.
        </Callout>

        {/* Section 1: TDEE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 800,
              margin: '0',
              color: 'var(--ink)',
            }}
          >
            1. قاعدة إجمالي الحرق اليومي
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--muted)',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            يتم احتساب إجمالي الحرق اليومي بمعادلة Mifflin-St Jeor أو
            Katch-McArdle مع معامل النشاط الرياضي ومعدل الحرق الأساسي:
          </p>
          <ul
            style={{
              fontSize: '13px',
              lineHeight: '1.7',
              margin: '4px 0 0',
              paddingInlineStart: '20px',
              color: 'var(--ink)',
            }}
          >
            <li>
              <strong>التضخيم:</strong> فائض سعرات مدروس (+10% إلى +15% فوق
              الثبات) لزيادة العضلات بأقل نسبة دهون.
            </li>
            <li>
              <strong>التنشيف:</strong> عجز سعرات آمن (-15% إلى -20% تحت الثبات)
              مع عدم النزول تحت معدل الحرق الأساسي لحماية الكتلة العضلية وصحة
              الهرمونات.
            </li>
          </ul>
        </div>

        {/* Section 2: Macro Breakdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Protein */}
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <strong
                style={{
                  color: 'var(--ink)',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  className="macro-marker macro-marker--protein"
                  aria-hidden="true"
                />
                أولاً: البروتين (حجر بناء العضلات)
              </strong>
              <span
                dir="ltr"
                style={{
                  fontSize: '11.5px',
                  background: 'var(--macro-protein-bg)',
                  color: 'var(--macro-protein)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                1 g = 4 kcal
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              <strong>المعيار العلمي:</strong> من{' '}
              <strong>1.8 إلى 2.2 جرام</strong> لكل كجم من وزن جسمك الكلي (أو من
              الكتلة الخالية من الدهون).
              <br />
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                مثال: لاعب وزنه 75 كجم يحتاج تقريباً 150 جم بروتين يومياً (تساوي
                600 سعرة حرارية).
              </span>
            </p>
          </div>

          {/* Fats */}
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <strong
                style={{
                  color: 'var(--ink)',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  className="macro-marker macro-marker--fats"
                  aria-hidden="true"
                />
                ثانياً: الدهون الصحية (التوازن الهرموني)
              </strong>
              <span
                dir="ltr"
                style={{
                  fontSize: '11.5px',
                  background: 'var(--macro-fats-bg)',
                  color: 'var(--macro-fats)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                1 g = 9 kcal
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              <strong>المعيار العلمي:</strong> تمثل من{' '}
              <strong>20% إلى 25%</strong> من إجمالي سعراتك اليومية كحد فسيولوجي
              أدنى لحماية إفراز الهرمونات وصحة المفاصل والأداء الذهني.
            </p>
          </div>

          {/* Carbs */}
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <strong
                style={{
                  color: 'var(--ink)',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  className="macro-marker macro-marker--carbs"
                  aria-hidden="true"
                />
                ثالثاً: الكربوهيدرات (وقود التدريب والطاقة)
              </strong>
              <span
                dir="ltr"
                style={{
                  fontSize: '11.5px',
                  background: 'var(--macro-carbs-bg)',
                  color: 'var(--macro-carbs)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                1 g = 4 kcal
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              <strong>المعيار العلمي:</strong> تخصص باقي السعرات المتبقية
              بالكامل للكربوهيدرات لملء مخازن الجليكوجين العضلي وتوفير طاقة
              الرفع في التدريب:
              <br />
              <code
                dir="ltr"
                style={{
                  display: 'inline-block',
                  margin: '4px 0',
                  padding: '3px 8px',
                  background: 'var(--card-bg)',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                Carbs (g) = (Total Calories - (Protein cal + Fat cal)) / 4
              </code>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            className="btn-primary-action full-width"
            onClick={onClose}
            style={{ height: '48px', fontSize: '15px', fontWeight: 800 }}
          >
            فهمت الدليل العلمي
          </button>
        </div>
      </div>
    </Sheet>
  )
}
