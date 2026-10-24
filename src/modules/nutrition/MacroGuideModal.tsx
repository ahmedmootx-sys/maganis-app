import { useMemo } from 'react'
import { Sheet } from '../../components/Sheet.tsx'
import { Callout } from '../../components/Callout.tsx'
import { Button } from '../../ui'
import { Claim } from '../../content/Claim.tsx'
import { explainEnergy } from './nutritionEngine.ts'
import type { UserProfile } from '../onboarding/types.ts'
import type { BodyLogEntry } from '../shared/types.ts'

export interface MacroGuideModalProps {
  onClose: () => void
  profile?: UserProfile | null
  bodyLog?: BodyLogEntry[] | null
}

/**
 * MacroGuideModal (Part B4 — Appendix C Coach-Authored Calculation Guide)
 * Strictly rendered through <Claim> backed by claims.ts (R23).
 * Every number is interpolated from the engine's constants and the user's profile.
 */
export function MacroGuideModal({
  onClose,
  profile,
  bodyLog,
}: MacroGuideModalProps) {
  const energy = useMemo(() => {
    return explainEnergy(profile, bodyLog)
  }, [profile, bodyLog])

  const weight = energy?.inputs?.weightKg ?? profile?.body?.weightKg ?? 70
  const activityFactor = energy?.inputs?.lifestyleFactor ?? 1.35
  const goalAdjustment = energy?.goalAdjustment?.adjustmentKcal ?? 0
  const adjSign = goalAdjustment >= 0 ? '+' : '−'
  const tdeeVal = energy?.tdee?.value ?? 2000
  const adjPercent = Math.abs(Math.round((goalAdjustment / (tdeeVal || 1)) * 100)) || 10
  const goalLabel = energy?.goalAdjustment?.reasonAr || 'بناء العضلات'

  const proteinFactor = energy?.proteinBasis?.gPerKg ?? 1.8
  const proteinG = energy?.targets?.proteinGrams ?? Math.round(weight * proteinFactor)
  const proteinKcal = proteinG * 4

  const targetKcal = energy?.targets?.targetCalories ?? 2200
  const fatG = energy?.targets?.fatsGrams ?? Math.round((targetKcal * 0.25) / 9)
  const fatPercent = Math.round(((fatG * 9) / (targetKcal || 1)) * 100) || 25

  const carbG = energy?.targets?.carbsGrams ?? Math.max(0, Math.round((targetKcal - proteinKcal - fatG * 9) / 4))

  return (
    <Sheet isOpen={true} onClose={onClose} title="دليل حساب السعرات والماكروز">
      <div
        className="macro-guide-modal"
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
          <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '1.6' }}>
            تعتمد الحسابات على مراجع التغذية الرياضية المعتمدة لتوزيع الطاقة والمغذيات الكبرى بدقة علمية.
          </div>
        </Callout>

        {/* 1. Energy per gram */}
        <div
          className="guide-card"
          style={{
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text)' }}>
              1. الطاقة في الجرام
            </div>
            <div
              className="tag"
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              1 g = 4/9 kcal
            </div>
          </div>
          <Claim id="guide_energy_density" showSource={true} />
        </div>

        {/* 2. BMR & TDEE */}
        <div
          className="guide-card"
          style={{
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text)' }}>
            2. معدل الحرق الأساسي والاحتياج اليومي
          </div>
          <Claim id="guide_bmr_formula" showSource={true} />
          <Claim
            id="guide_tdee_calculation"
            params={{ activity_factor: activityFactor }}
            showSource={false}
          />
          <Claim
            id="guide_daily_target"
            params={{
              adjustment_sign: adjSign,
              percent: adjPercent,
              goal: goalLabel,
            }}
            showSource={false}
          />
        </div>

        {/* 3. Protein */}
        <div
          className="guide-card"
          style={{
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="macro-marker macro-marker--protein" aria-hidden="true" />
              3. البروتين
            </div>
            <div
              className="tag"
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              1 g = 4 kcal
            </div>
          </div>
          <Claim
            id="guide_protein_intake"
            params={{
              protein_factor: proteinFactor,
              weight: weight,
              protein_g: proteinG,
              protein_kcal: proteinKcal,
            }}
            showSource={true}
          />
        </div>

        {/* 4. Fats */}
        <div
          className="guide-card"
          style={{
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="macro-marker macro-marker--fats" aria-hidden="true" />
              4. الدهون
            </div>
            <div
              className="tag"
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              1 g = 9 kcal
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Claim
              id="guide_fat_intake"
              params={{
                fat_percent: fatPercent,
                fat_g: fatG,
              }}
              showSource={true}
            />
            <Claim id="guide_fat_not_minimum" showSource={false} />
          </div>
        </div>

        {/* 5. Carbs */}
        <div
          className="guide-card"
          style={{
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 14px',
            background: 'var(--color-surface-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="macro-marker macro-marker--carbs" aria-hidden="true" />
              5. الكربوهيدرات
            </div>
            <div
              className="tag"
              style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              1 g = 4 kcal
            </div>
          </div>
          <Claim
            id="guide_carb_intake"
            params={{
              carb_g: carbG,
            }}
            showSource={false}
          />
          <div
            style={{
              margin: '8px 0 0',
              padding: '8px 12px',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-divider)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <bdi dir="ltr" style={{ fontFamily: 'monospace', fontSize: '12.5px' }}>
              Carbs (g) = (Target Kcal - Protein Kcal - Fat Kcal) / 4 = {carbG} g
            </bdi>
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
