import React, { useState, useId } from 'react'
import type { UserProfile } from '../onboarding/types.ts'
import type { WorkoutProgram } from '../shared/types.ts'
import { Sheet, Button, Toggle, Callout, Icon, Card } from '../../ui'
import { buildAiDesignerPrompt } from './aiPromptBuilder.ts'
import { importProgramFromJson, type ImportResult } from './programImporter.ts'
import { ImportPreviewSheet } from './ImportPreviewSheet.tsx'
import { saveFile } from '../../utils/saveFile.ts'
import type { UserLimitation } from './limitations.ts'

export interface AiDesignerModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  limitations?: UserLimitation[] | null
  onSaveDraft: (program: WorkoutProgram) => void
  onSaveAndActivate: (program: WorkoutProgram) => void
  showToast: (msg: string) => void
}

export function AiDesignerModal({
  isOpen,
  onClose,
  profile,
  limitations,
  onSaveDraft,
  onSaveAndActivate,
  showToast,
}: AiDesignerModalProps) {
  const [includeProfileData, setIncludeProfileData] = useState(true)
  const [includeInjuryData, setIncludeInjuryData] = useState(true)
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const promptTextareaId = useId()
  const importTextareaId = useId()
  const fileInputId = useId()

  if (!isOpen) return null

  const promptInfo = buildAiDesignerPrompt({
    profile,
    includeProfileData,
    includeInjuryData,
  })

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(promptInfo.prompt)
      showToast('تم نسخ البرومبت إلى الحافظة بنجاح')
    } catch {
      showToast('تعذر النسخ التلقائي، يمكنك نسخ النص من المعاينة أدناه')
    }
  }

  async function handleDownloadPrompt() {
    try {
      const blob = new Blob([promptInfo.prompt], {
        type: 'text/plain;charset=utf-8',
      })
      const res = await saveFile(blob, 'maganis-ai-prompt.txt', 'text/plain')
      if (res.downloadNoticeNeeded) {
        showToast('تم حفظ ملف البرومبت في التنزيلات')
      } else {
        showToast('تم حفظ ملف البرومبت بنجاح')
      }
    } catch {
      showToast('تعذر حفظ ملف البرومبت')
    }
  }

  function handleProcessImport() {
    setImportError(null)
    if (!importText.trim()) {
      setImportError('يرجى لصق كود JSON الخاص بالجدول أو رفع ملف البرنامج.')
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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setImportText(content)
        const res = importProgramFromJson(content, { limitations })
        if (res.success && res.program) {
          setImportResult(res)
          setIsPreviewOpen(true)
        } else {
          setImportError(res.errors[0] || 'تعذر استيراد الجدول من الملف.')
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <Sheet
        isOpen={isOpen}
        onClose={onClose}
        title="صمم لي جدولي الخاص (مرشد الذكاء الاصطناعي)"
      >
        <div
          className="ai-designer-modal"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            paddingBottom: '32px',
          }}
        >
          {/* Header intro */}
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              أنشئ برنامجاً تدريبياً علمياً مصمماً خصيصاً لك عبر محادثة تفاعلية
              مع مدرب رياضي معتمد مبني بالذكاء الاصطناعي (مثل Claude أو ChatGPT
              أو Gemini).
            </p>
          </div>

          {/* 4 Process Steps */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {/* Step 1 */}
            <Card
              padding="md"
              style={{ border: '1px solid var(--border-color, #2a2e37)' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary, #ff5722)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  1
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  تجهيز ونسخ برومبت المدرب
                </h4>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  margin: '0 0 12px',
                  lineHeight: 1.5,
                }}
              >
                اختر البيانات التي ترغب في إدراجها لمساعدة المدرب الذكي في فهم
                مستواك وحالتك البدنية بدقة:
              </p>

              {/* Toggles */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '12px',
                }}
              >
                <Toggle
                  label="تضمين بيانات ملفك الرياضي (الوزن، الطول، الهدف، أيام التدريب)"
                  checked={includeProfileData}
                  onChange={(val) => setIncludeProfileData(val)}
                />
                <Toggle
                  label="تضمين سجل الإصابات والقيود الحركية"
                  checked={includeInjuryData}
                  onChange={(val) => setIncludeInjuryData(val)}
                />
              </div>

              {(includeProfileData || includeInjuryData) && (
                <div style={{ marginBottom: '12px' }}>
                  <Callout variant="warning">
                    <span style={{ fontSize: '12px' }}>
                      تنبيه خصوصية: سيتم تضمين البيانات المحددة في نص البرومبت
                      وإرسالها إلى نموذج الذكاء الاصطناعي الخارجي الذي تختاره
                      أنت.
                    </span>
                  </Callout>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={handleCopyPrompt}>
                  <Icon name="copy" size={16} />
                  <span>نسخ البرومبت بالكامل</span>
                </Button>
                <Button variant="secondary" onClick={handleDownloadPrompt}>
                  <Icon name="download" size={16} />
                  <span>حفظ كملف نصي (.txt)</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowPromptPreview(!showPromptPreview)}
                >
                  <span>
                    {showPromptPreview
                      ? 'إخفاء معاينة النص'
                      : 'معاينة نص البرومبت'}
                  </span>
                </Button>
              </div>

              {/* Prompt Preview Block */}
              {showPromptPreview && (
                <div style={{ marginTop: '12px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      حجم البرومبت:{' '}
                      {promptInfo.characterCount.toLocaleString('ar-EG')} حرف
                      (أقل من 30,000)
                    </span>
                    <span>{promptInfo.catalogCount} تمرين بالكتالوج</span>
                  </div>
                  <label htmlFor={promptTextareaId} className="sr-only">
                    معاينة نص البرومبت
                  </label>
                  <textarea
                    id={promptTextareaId}
                    readOnly
                    value={promptInfo.prompt}
                    style={{
                      width: '100%',
                      height: '180px',
                      direction: 'ltr',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      background: 'var(--bg-secondary, #12151b)',
                      color: 'var(--text-secondary, #cbd5e1)',
                      border: '1px solid var(--border-color, #2a2e37)',
                      borderRadius: '6px',
                      padding: '8px',
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}
            </Card>

            {/* Step 2 */}
            <Card
              padding="md"
              style={{ border: '1px solid var(--border-color, #2a2e37)' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary, #2a2e37)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  2
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  المحادثة مع الذكاء الاصطناعي
                </h4>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                افتح مساعد الذكاء الاصطناعي المفضل لديك (مثل Claude 3.5 Sonnet
                أو ChatGPT-4o أو Gemini Pro)، والصق البرومبت في رسالة جديدة.
                سيبدأ المدرب بمقابلتك خطوة بخطوة ويطرح عليك أسئلة تدريبية.
              </p>
            </Card>

            {/* Step 3 */}
            <Card
              padding="md"
              style={{ border: '1px solid var(--border-color, #2a2e37)' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary, #2a2e37)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  3
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  استلام كود البرنامج (JSON)
                </h4>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                في نهاية المحادثة وبعد تأكيدك لتفاصيل البرنامج، سيُخرج المدرب
                كود JSON محدد ومضبوط تماماً ليناسب تطبيق مجانيس وقواعد أطلس
                العضلات.
              </p>
            </Card>

            {/* Step 4 */}
            <Card
              padding="md"
              style={{ border: '1px solid var(--border-color, #2a2e37)' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary, #ff5722)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  4
                </div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                  استيراد الجدول إلى التطبيق
                </h4>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  margin: '0 0 10px',
                  lineHeight: 1.5,
                }}
              >
                انسخ كود JSON كاملاً والصقه في المربع أدناه، أو ارفع ملف .json
                إذا حفظته:
              </p>

              {importError && (
                <div style={{ marginBottom: '10px' }}>
                  <Callout variant="error">
                    <span style={{ fontSize: '12px' }}>{importError}</span>
                  </Callout>
                </div>
              )}

              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <label htmlFor={importTextareaId} className="sr-only">
                  لصق كود JSON للبرنامج
                </label>
                <textarea
                  id={importTextareaId}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="الصق كود JSON هنا (سواء داخل ```json أو ككائن مباشر)..."
                  style={{
                    width: '100%',
                    height: '110px',
                    direction: 'ltr',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    background: 'var(--bg-secondary, #12151b)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color, #2a2e37)',
                    borderRadius: '6px',
                    padding: '8px',
                    resize: 'vertical',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <Button variant="primary" onClick={handleProcessImport}>
                    <Icon name="check" size={16} />
                    <span>معاينة واستيراد الجدول</span>
                  </Button>

                  <label
                    htmlFor={fileInputId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      background: 'var(--bg-secondary, #2a2e37)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <Icon name="upload" size={16} />
                    <span>رفع ملف .json</span>
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".json,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Sheet>

      {/* Preview Sheet */}
      <ImportPreviewSheet
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        importResult={importResult}
        onSaveDraft={(prog) => {
          onSaveDraft(prog)
          onClose()
        }}
        onSaveAndActivate={(prog) => {
          onSaveAndActivate(prog)
          onClose()
        }}
      />
    </>
  )
}
