import { useState, useId, useMemo } from 'react'
import type { UserProfile } from '../onboarding/types.ts'
import type { WorkoutProgram } from '../shared/types.ts'
import { Sheet, Button, Toggle, Icon, Card, Field } from '../../ui'
import { Select } from '../../components/Select'
import { buildAiDesignerPrompt } from './aiPromptBuilder.ts'
import { importProgramFromJson, type ImportResult } from './programImporter.ts'
import { ImportPreviewSheet } from './ImportPreviewSheet.tsx'
import type { UserLimitation } from './limitations.ts'
import { GOALS } from '../onboarding/types.ts'

export interface AiDesignerModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  limitations?: UserLimitation[] | null
  onSaveDraft: (program: WorkoutProgram) => void
  onSaveAndActivate: (program: WorkoutProgram) => void
  onOpenImport?: () => void
  showToast: (msg: string) => void
}

export function AiDesignerModal({
  isOpen,
  onClose,
  profile,
  limitations,
  onSaveDraft,
  onSaveAndActivate,
  onOpenImport,
  showToast,
}: AiDesignerModalProps) {
  const [includeProfileData, setIncludeProfileData] = useState(true)
  const [copyFailed, setCopyFailed] = useState(false)
  const [showImportSection, setShowImportSection] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // Editable preview profile state
  const [editAge, setEditAge] = useState<string>(
    profile?.body?.age ? String(profile.body.age) : '25',
  )
  const [editSex, setEditSex] = useState<'male' | 'female'>(
    profile?.body?.sex || 'male',
  )
  const [editHeight, setEditHeight] = useState<string>(
    profile?.body?.heightCm ? String(profile.body.heightCm) : '175',
  )
  const [editWeight, setEditWeight] = useState<string>(
    profile?.body?.weightKg ? String(profile.body.weightKg) : '75',
  )
  const [editGoal, setEditGoal] = useState<string>(
    profile?.primaryGoal || 'hypertrophy',
  )
  const [editDays, setEditDays] = useState<number>(
    profile?.trainingDaysPerWeek || 4,
  )
  const [editEquipment, setEditEquipment] = useState<string>(
    profile?.equipmentAvailable && profile.equipmentAvailable.length > 0
      ? profile.equipmentAvailable.join(', ')
      : 'barbell, dumbbell, machine, bodyweight',
  )

  const promptTextareaId = useId()
  const importTextareaId = useId()

  // Construct effective profile from editable preview
  const effectiveProfile = useMemo<UserProfile | null>(() => {
    if (!profile) return null
    return {
      ...profile,
      primaryGoal: editGoal as any,
      trainingDaysPerWeek: editDays,
      equipmentAvailable: editEquipment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      body: {
        ...profile.body,
        age: parseInt(editAge, 10) || profile.body?.age || 25,
        sex: editSex,
        heightCm: parseFloat(editHeight) || profile.body?.heightCm || 175,
        weightKg: parseFloat(editWeight) || profile.body?.weightKg || 75,
      },
    }
  }, [
    profile,
    editAge,
    editSex,
    editHeight,
    editWeight,
    editGoal,
    editDays,
    editEquipment,
  ])

  const promptInfo = useMemo(() => {
    return buildAiDesignerPrompt({
      profile: effectiveProfile,
      includeProfileData,
      includeInjuryData: false, // Never auto-included per Privacy Rule
    })
  }, [effectiveProfile, includeProfileData])

  if (!isOpen) return null

  async function handleCopyPrompt() {
    let copied = false
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptInfo.prompt)
        copied = true
      }
    } catch {
      copied = false
    }

    if (!copied && typeof document !== 'undefined') {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = promptInfo.prompt
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        textarea.style.top = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        copied = document.execCommand('copy')
        document.body.removeChild(textarea)
      } catch {
        copied = false
      }
    }

    if (copied) {
      showToast('تم نسخ البرومبت بنجاح!')
      setCopyFailed(false)
    } else {
      showToast('النسخ التلقائي منفعش، تقدر تنسخ النص من المربع اللي تحت')
      setCopyFailed(true)
    }
  }

  async function handleSharePrompt() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'برومبت تصميم جدول مجانس',
          text: promptInfo.prompt,
        })
        showToast('تمت مشاركة البرومبت بنجاح')
      } catch {
        // User cancelled or share failed
      }
    }
  }

  function handleProcessImport() {
    setImportError(null)
    if (!importText.trim()) {
      setImportError('يرجى لصق كود JSON الخاص بالجدول.')
      return
    }

    const res = importProgramFromJson(importText, { limitations })
    if (res.success && res.program) {
      setImportResult(res)
      setIsPreviewOpen(true)
    } else {
      setImportError(
        res.errors[0] || 'تعذر استيراد الجدول، تأكد من صحة كود JSON.',
      )
    }
  }

  const canShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <>
      <Sheet
        isOpen={isOpen}
        onClose={onClose}
        title="صمم لي جدولي الخاص"
      >
        <div
          className="ai-designer-modal"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingBottom: '24px',
          }}
        >
          {/* Two Short Egyptian-Arabic Lines */}
          <div
            style={{
              fontSize: '13.5px',
              color: 'var(--color-text-2)',
              lineHeight: 1.6,
              background: 'var(--color-surface-2)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <div>هنجهزلك برومبت علمي مفصل تاخده لأي ذكاء اصطناعي (زي ChatGPT أو Claude) يصمملك جدول تدريبي دقيق على مقاسك.</div>
            <div style={{ marginTop: '4px' }}>المدرب الذكي هيعمل معاك مقابلة كاملة ويسألك عن كل أهدافك ومستواك وإصاباتك خطوة بخطوة.</div>
          </div>

          {/* Privacy Switch */}
          <Card padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Toggle
                label="ضمّن بياناتي من التطبيق"
                checked={includeProfileData}
                onChange={(val) => setIncludeProfileData(val)}
              />

              {includeProfileData && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '4px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-divider)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--color-text)',
                    }}
                  >
                    معاينة البيانات (تقدر تعدّلها قبل النسخ):
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '8px',
                    }}
                  >
                    <Field label="السن">
                      <input
                        type="number"
                        className="input"
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                      />
                    </Field>
                    <Field label="النوع">
                      <Select
                        id="ai-designer-sex"
                        value={editSex}
                        onChange={(val) => setEditSex(val as any)}
                        options={[
                          { value: 'male', labelAr: 'ذكر' },
                          { value: 'female', labelAr: 'أنثى' },
                        ]}
                      />
                    </Field>
                    <Field label="الطول (سم)">
                      <input
                        type="number"
                        className="input"
                        value={editHeight}
                        onChange={(e) => setEditHeight(e.target.value)}
                      />
                    </Field>
                    <Field label="الوزن (كجم)">
                      <input
                        type="number"
                        className="input"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                      />
                    </Field>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Field label="الهدف الأساسي">
                      <Select
                        id="ai-designer-goal"
                        value={editGoal}
                        onChange={(val) => setEditGoal(val)}
                        options={GOALS.map((g) => ({
                          value: g.value,
                          labelAr: g.labelAr,
                        }))}
                      />
                    </Field>

                    <Field label="أيام التدريب في الأسبوع">
                      <Select
                        id="ai-designer-days"
                        value={String(editDays)}
                        onChange={(val) => setEditDays(Number(val))}
                        options={[2, 3, 4, 5, 6].map((d) => ({
                          value: String(d),
                          labelAr: `${d} أيام`,
                        }))}
                      />
                    </Field>

                    <Field label="الأدوات المتاحة">
                      <input
                        type="text"
                        className="input"
                        value={editEquipment}
                        onChange={(e) => setEditEquipment(e.target.value)}
                        placeholder="barbell, dumbbell, machine, bodyweight"
                      />
                    </Field>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-2)',
                      lineHeight: 1.4,
                      background: 'var(--color-surface)',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-control)',
                    }}
                  >
                    🛡️ الخصوصية: لا يتم تضمين بيانات الإصابات أو الصحة تلقائياً، حيث يجمعها المدرب مباشرة أثناء المقابلة.
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons: Copy & Share */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              fullWidth={!canShare}
              style={{ flex: canShare ? '1 1 auto' : undefined }}
              onClick={handleCopyPrompt}
            >
              <Icon name="copy" size={16} />
              <span>انسخ البرومبت</span>
            </Button>

            {canShare && (
              <Button
                variant="secondary"
                style={{ flex: '0 0 auto', minWidth: '80px' }}
                onClick={handleSharePrompt}
              >
                <Icon name="share-2" size={16} />
                <span>شارك</span>
              </Button>
            )}
          </div>

          {/* Selectable Fallback Textarea on Copy Failure */}
          {copyFailed && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <label
                htmlFor={promptTextareaId}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-warning)',
                }}
              >
                اضغط هنا لتحديد النص كاملاً ونسخه:
              </label>
              <textarea
                id={promptTextareaId}
                readOnly
                value={promptInfo.prompt}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                style={{
                  width: '100%',
                  height: '140px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  direction: 'ltr',
                  padding: '8px',
                  borderRadius: 'var(--radius-control)',
                  border: '1.5px solid var(--color-warning)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          )}

          {/* Next Step Callout & Button */}
          <Card padding="md">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                }}
              >
                بعد ما المدرب يديك الجدول، الصقه في «استيراد الجدول»
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  if (onOpenImport) {
                    onOpenImport()
                  } else {
                    setShowImportSection(true)
                  }
                }}
              >
                <Icon name="upload" size={16} />
                <span>استيراد الجدول</span>
              </Button>
            </div>
          </Card>

          {/* Inline Import Section (when activated) */}
          {showImportSection && (
            <Card padding="md">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                  }}
                >
                  الصق كود JSON المستلم من المدرب:
                </div>
                <textarea
                  id={importTextareaId}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value)
                    setImportError(null)
                  }}
                  placeholder='{"title": "برنامجي", "days": [...] }'
                  rows={6}
                  style={{
                    width: '100%',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    direction: 'ltr',
                    padding: '8px',
                    borderRadius: 'var(--radius-control)',
                    border: importError
                      ? '1px solid var(--color-danger)'
                      : '1px solid var(--color-divider)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                  }}
                />
                {importError && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-danger)',
                    }}
                  >
                    {importError}
                  </div>
                )}
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleProcessImport}
                >
                  معاينة واعتماد الجدول
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Sheet>

      {/* Import Preview Sheet */}
      {importResult && (
        <ImportPreviewSheet
          isOpen={isPreviewOpen}
          importResult={importResult}
          onClose={() => setIsPreviewOpen(false)}
          onSaveAndActivate={(prog: WorkoutProgram) => {
            setIsPreviewOpen(false)
            onSaveAndActivate(prog)
            onClose()
          }}
          onSaveDraft={(prog: WorkoutProgram) => {
            setIsPreviewOpen(false)
            onSaveDraft(prog)
            onClose()
          }}
        />
      )}
    </>
  )
}
