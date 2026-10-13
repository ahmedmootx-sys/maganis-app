import { useEffect } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import { navigationHistory } from '../../utils/navigationHistory.ts'

interface MacroGuideModalProps {
  onClose: () => void
}

export function MacroGuideModal({ onClose }: MacroGuideModalProps) {
  useEffect(() => {
    return navigationHistory.push('macroGuideModal', onClose)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '2px solid var(--accent)',
          padding: '24px',
          background: 'var(--card-bg)',
          color: 'var(--ink)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={assetUrl('branding/maganis-badge.png')}
              alt="د. مجانص"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                objectFit: 'contain',
              }}
            />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                }}
              >
                💡 دليل د. مجانص العلمي لحساب الماكروز
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                الأسس الفسيولوجية لتوزيع السعرات والمغذيات الكبرى
              </span>
            </div>
          </div>
          <button
            type="button"
            className="ghost tiny"
            onClick={onClose}
            style={{ fontSize: '16px', padding: '6px 12px' }}
          >
            ✕
          </button>
        </div>

        {/* Introduction Quote */}
        <div
          style={{
            background: 'var(--accent-soft)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13.5px',
            lineHeight: '1.6',
          }}
        >
          <strong style={{ color: 'var(--accent)' }}>كوتش مجانص بيقولك:</strong>{' '}
          «الماكروز مش طلاسم! هي ببساطة الوقود ومواد البناء لجسمك. السعرات هي
          الكمية الإجمالية، وتوزيع الماكروز هو اللي بيحدد هتزيد عضل صافي ولا
          دهون! ركّز في الأرقام دي وطبّقها.»
        </div>

        {/* Section 1: Calories Baseline */}
        <div style={{ marginBottom: '18px' }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 800,
              margin: '0 0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🔥 1. قاعدة الطاقة الإجمالية (TDEE):
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--ink)',
              lineHeight: '1.6',
              margin: 0,
            }}
          >
            قبل حساب الماكروز، بنحسب استهلاك الطاقة اليومي (TDEE) بمعادلة
            Mifflin-St Jeor أو Katch-McArdle + معامل النشاط الرياضي (METs).
            وبناءً على هدفك:
          </p>
          <ul
            style={{
              fontSize: '12.5px',
              lineHeight: '1.7',
              margin: '6px 0 0',
              paddingInlineStart: '20px',
            }}
          >
            <li>
              <strong>التضخيم (Hypertrophy):</strong> فائض سعرات مدروس (+10% إلى
              +15% فوق الثبات) لزيادة العضلات بأقل نسبة دهون.
            </li>
            <li>
              <strong>التنشيف (Cut):</strong> عجز سعرات آمن (-15% إلى -20% تحت
              الثبات) مع عدم النزول تحت معدل الأيض الأساسي (BMR) لحماية صحتك
              وهرموناتك.
            </li>
          </ul>
        </div>

        {/* Section 2: Macro Breakdown Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '22px',
          }}
        >
          {/* Protein */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '12px 14px',
              background: 'var(--card-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <strong style={{ color: '#ef4444', fontSize: '14px' }}>
                🥩 أولاً: البروتين (حجر بناء العضلات)
              </strong>
              <span
                style={{
                  fontSize: '11px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                1 جم بروتين = 4 سعرات حرارية
              </span>
            </div>
            <p
              style={{
                fontSize: '12.5px',
                lineHeight: '1.6',
                margin: '4px 0 0',
              }}
            >
              <strong>المعادلة:</strong> من <strong>1.8 إلى 2.2 جرام</strong>{' '}
              لكل كجم من وزن جسمك (أو من الكتلة اللحمية LBM).
              <br />
              <span style={{ color: 'var(--muted)' }}>
                مثال: لاعب وزنه 75 كجم يحتاج تقريباً 150 جم بروتين يومياً (تساوي
                600 سعرة حرارية).
              </span>
            </p>
          </div>

          {/* Fats */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '12px 14px',
              background: 'var(--card-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <strong style={{ color: '#f59e0b', fontSize: '14px' }}>
                🥑 ثانياً: الدهون الصحية (مصنع الهرمونات)
              </strong>
              <span
                style={{
                  fontSize: '11px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#d97706',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                1 جم دهون = 9 سعرات حرارية
              </span>
            </div>
            <p
              style={{
                fontSize: '12.5px',
                lineHeight: '1.6',
                margin: '4px 0 0',
              }}
            >
              <strong>المعادلة:</strong> تمثل من <strong>20% إلى 25%</strong> من
              إجمالي سعراتك اليومية كحد فسيولوجي أدنى لحماية إفراز هرمون الذكورة
              (التستوستيرون) وصحة المفاصل والمخ.
              <br />
              <span style={{ color: 'var(--muted)' }}>
                لا تقطع الدهون أبداً حتى أثناء أشد فترات التنشيف!
              </span>
            </p>
          </div>

          {/* Carbs */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: '10px',
              padding: '12px 14px',
              background: 'var(--card-subtle)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px',
              }}
            >
              <strong style={{ color: '#0ea5e9', fontSize: '14px' }}>
                🍚 ثالثاً: الكربوهيدرات (وقود التدريب والطاقة)
              </strong>
              <span
                style={{
                  fontSize: '11px',
                  background: 'rgba(14, 165, 233, 0.15)',
                  color: '#0284c7',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                1 جم كارب = 4 سعرات حرارية
              </span>
            </div>
            <p
              style={{
                fontSize: '12.5px',
                lineHeight: '1.6',
                margin: '4px 0 0',
              }}
            >
              <strong>المعادلة:</strong> باقي السعرات المتبقية بالكامل تخصص
              للكربوهيدرات:
              <br />
              <code>
                سعرات الكارب = السعرات الإجمالية - (سعرات البروتين + سعرات
                الدهون)
              </code>
              <br />
              ثم نقسم سعرات الكارب على 4 للحصول على الجرامات لملء مخازن
              الجليكوجين وقوة الرفع في الجيم.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}
        >
          <button
            type="button"
            className="button-primary full-width"
            onClick={onClose}
            style={{ padding: '10px', fontWeight: 800 }}
          >
            فهمت يا دكتور — جاهز لتحقيق أهدافي 💪
          </button>
        </div>
      </div>
    </div>
  )
}
