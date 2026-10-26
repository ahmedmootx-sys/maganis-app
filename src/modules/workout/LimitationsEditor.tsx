import {
  REGIONS,
  STATUS_OPTIONS,
  type LimitationRegion,
  type LimitationStatus,
  type UserLimitation,
} from './limitations.ts'
import { Choice } from '../../ui/Choice.tsx'
import { Callout } from '../../ui'

export interface LimitationsEditorState {
  hasIssues: boolean | null
  limitations: UserLimitation[]
  notes?: string
  redFlag?: boolean | null
}

export interface LimitationsEditorProps {
  value: LimitationsEditorState
  onChange: (value: LimitationsEditorState) => void
  showRedFlagQuestion?: boolean
}

/**
 * Shared LimitationsEditor component (Part 2.4)
 * Used across:
 * - OnboardingWizard (Step 3: صحتك)
 * - SettingsScreen (Edit Profile)
 *
 * Uses unified Choice component (segmented variant) with:
 * - Equal-width grid layout
 * - Labels wrapping up to 2 lines, stacking if narrow
 * - Solid accent fill, dark contrast text (>4.5:1), NO check icon
 * - Zero overflow outside container
 */
export function LimitationsEditor({
  value,
  onChange,
  showRedFlagQuestion = true,
}: LimitationsEditorProps) {
  const { hasIssues, limitations, notes = '', redFlag } = value

  const handleToggleHasIssues = (val: 'yes' | 'no') => {
    const isYes = val === 'yes'
    onChange({
      ...value,
      hasIssues: isYes,
      limitations: isYes ? limitations : [],
      redFlag: isYes ? redFlag : false,
    })
  }

  const handleToggleRegion = (regionId: LimitationRegion) => {
    const exists = limitations.some((l) => l.region === regionId)
    let next: UserLimitation[]
    if (exists) {
      next = limitations.filter((l) => l.region !== regionId)
    } else {
      next = [...limitations, { region: regionId, status: 'current_pain' }]
    }
    onChange({ ...value, limitations: next })
  }

  const handleUpdateStatus = (
    regionId: LimitationRegion,
    status: LimitationStatus,
  ) => {
    const next = limitations.map((l) =>
      l.region === regionId ? { ...l, status } : l,
    )
    onChange({ ...value, limitations: next })
  }

  const handleUpdateRegionNote = (regionId: LimitationRegion, note: string) => {
    const next = limitations.map((l) =>
      l.region === regionId ? { ...l, note } : l,
    )
    onChange({ ...value, limitations: next })
  }

  return (
    <div
      className="limitations-editor"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        boxSizing: 'border-box',
      }}
      dir="rtl"
    >
      {/* 1. هل لديك إصابة أو حالة صحية؟ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          style={{
            fontSize: '14.5px',
            fontWeight: 700,
            color: 'var(--color-text)',
          }}
        >
          هل لديك إصابة أو حالة صحية تؤثر على التمرين؟
        </label>
        <Choice
          variant="segmented"
          options={[
            { value: 'no', label: 'لا' },
            { value: 'yes', label: 'نعم' },
          ]}
          value={hasIssues === null ? undefined : hasIssues ? 'yes' : 'no'}
          onChange={handleToggleHasIssues}
          ariaLabel="وجود إصابات سابقة أو حالية"
        />
      </div>

      {hasIssues === true && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 2. اختيار المناطق */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              اختر منطقة الإصابة أو الألم (واحدة أو أكثر)
            </span>
            <div
              role="group"
              aria-label="مناطق الإصابة"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {REGIONS.map((region) => {
                const isSelected = limitations.some(
                  (l) => l.region === region.id,
                )
                return (
                  <button
                    key={region.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => handleToggleRegion(region.id)}
                    style={{
                      borderRadius: 'var(--radius-control, 10px)',
                      minHeight: '44px',
                      padding: '8px 12px',
                      border: isSelected
                        ? '1px solid var(--color-accent)'
                        : '1px solid var(--color-divider)',
                      background: isSelected
                        ? 'var(--color-accent)'
                        : 'var(--color-surface-2)',
                      color: isSelected ? '#0b0c0e' : 'var(--color-text)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontSize: '13.5px',
                      fontWeight: isSelected ? 700 : 500,
                      transition: 'all 0.15s ease',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span>{region.labelAr}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. حالة كل منطقة محددة */}
          {limitations.length > 0 && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}
              >
                حالة كل منطقة
              </span>
              {limitations.map((lim) => {
                const regionInfo = REGIONS.find((r) => r.id === lim.region)
                const regionLabel = regionInfo ? regionInfo.labelAr : lim.region
                return (
                  <div
                    key={lim.region}
                    className="card"
                    style={{
                      background: 'var(--color-surface-2)',
                      padding: '12px',
                      borderRadius: 'var(--radius-card, 12px)',
                      border: '1px solid var(--color-divider)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxSizing: 'border-box',
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                      }}
                    >
                      {regionLabel}
                    </div>

                    {/* Condition Status Control (Using Choice segmented: no overflow, no check mark) */}
                    <Choice
                      variant="segmented"
                      layout="stacked"
                      options={STATUS_OPTIONS.map((s) => ({
                        value: s.id,
                        label: s.labelAr,
                      }))}
                      value={lim.status}
                      onChange={(val) =>
                        handleUpdateStatus(lim.region, val as LimitationStatus)
                      }
                      ariaLabel={`حالة إصابة ${regionLabel}`}
                    />

                    {/* Optional regional note */}
                    <input
                      type="text"
                      placeholder={`ملاحظات خاصة بـ ${regionLabel} (اختياري)...`}
                      value={lim.note || ''}
                      onChange={(e) =>
                        handleUpdateRegionNote(lim.region, e.target.value)
                      }
                      className="field-input"
                      style={{
                        height: '36px',
                        fontSize: '12.5px',
                        marginTop: '2px',
                      }}
                      dir="rtl"
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* 4. ملاحظات صحية عامة */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="limitation-general-notes"
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              ملاحظات صحية أو تفاصيل إضافية (اختياري)
            </label>
            <textarea
              id="limitation-general-notes"
              value={notes}
              onChange={(e) => onChange({ ...value, notes: e.target.value })}
              placeholder="اكتب أي ملاحظات أخرى يهم المدرب معرفتها..."
              className="field-input"
              rows={2}
              dir="rtl"
              style={{
                resize: 'vertical',
                minHeight: '64px',
                fontSize: '13px',
                textAlign: 'start',
              }}
            />
          </div>

          {/* 5. السؤال التحذيري (Red Flag) */}
          {showRedFlagQuestion && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--color-divider)',
              }}
            >
              <label
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  lineHeight: 1.45,
                }}
              >
                هل عندك تنميل أو ضعف مفاجئ أو ألم شديد بعد إصابة قوية؟
              </label>
              <Choice
                variant="segmented"
                options={[
                  { value: 'no', label: 'لا' },
                  { value: 'yes', label: 'نعم' },
                ]}
                value={redFlag === null ? undefined : redFlag ? 'yes' : 'no'}
                onChange={(val) =>
                  onChange({ ...value, redFlag: val === 'yes' })
                }
                ariaLabel="أعراض حمراء تتطلب استشارة طبية"
              />

              {redFlag === true && (
                <div style={{ marginTop: '6px' }}>
                  <Callout variant="warning">
                    لو عندك تنميل أو ضعف مفاجئ أو وجع شديد بعد إصابة قوية،
                    استشير دكتور قبل أي تمرين. تقدر تكمّل، بس متبدأش أي تمرين
                    بيحمّل على المنطقة دي قبل ما تكشف.
                  </Callout>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
