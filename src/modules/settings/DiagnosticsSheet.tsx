import React, { useState, useEffect } from 'react'
import { Sheet } from '../../ui/Sheet.tsx'
import { Button } from '../../ui/Button.tsx'
import { KeyValueList, Icon } from '../../ui/index.ts'

interface DiagnosticsSheetProps {
  isOpen: boolean
  onClose: () => void
}

interface DiagnosticInfo {
  buildId: string
  displayMode: string
  isSecureContext: string
  swState: string
  cacheVersion: string
  viewport: string
  dpr: string
  rootFontSize: string
  safeArea: string
  hasSaveFilePicker: string
  shareCsv: string
  sharePdf: string
  shareText: string
  shareJson: string
  storagePersisted: string
  userAgent: string
}

export const DiagnosticsSheet: React.FC<DiagnosticsSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false)
  const [info, setInfo] = useState<DiagnosticInfo>({
    buildId: typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev',
    displayMode: 'browser',
    isSecureContext: 'false',
    swState: 'none',
    cacheVersion: 'none',
    viewport: '360 × 720',
    dpr: '1',
    rootFontSize: '16px',
    safeArea: 'top: 0, bottom: 0',
    hasSaveFilePicker: 'false',
    shareCsv: 'false',
    sharePdf: 'false',
    shareText: 'false',
    shareJson: 'false',
    storagePersisted: 'false',
    userAgent: '',
  })

  useEffect(() => {
    if (!isOpen) return

    async function gatherDiagnostics() {
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)',
      ).matches

      // Check canShare for specific file types
      const testShare = (mimeType: string, filename: string): boolean => {
        if (!navigator.canShare) return false
        try {
          const file = new File(['test'], filename, { type: mimeType })
          return navigator.canShare({ files: [file] })
        } catch {
          return false
        }
      }

      // Check cache versions
      let cacheVer = 'none'
      try {
        if ('caches' in window) {
          const keys = await caches.keys()
          cacheVer = keys.join(', ') || 'none'
        }
      } catch {
        cacheVer = 'error'
      }

      // Check storage persistence
      let persisted = 'unsupported'
      try {
        if (navigator.storage?.persisted) {
          const isPersisted = await navigator.storage.persisted()
          persisted = isPersisted ? 'true' : 'false'
        }
      } catch {
        persisted = 'error'
      }

      // Safe area measurement via computed variable or fallback
      let safeAreaStr = 'top: 0, bottom: 0'
      try {
        const div = document.createElement('div')
        div.style.paddingTop = 'env(safe-area-inset-top)'
        div.style.paddingBottom = 'env(safe-area-inset-bottom)'
        div.style.position = 'fixed'
        div.style.visibility = 'hidden'
        document.body.appendChild(div)
        const computed = window.getComputedStyle(div)
        safeAreaStr = `top: ${computed.paddingTop}, bottom: ${computed.paddingBottom}`
        document.body.removeChild(div)
      } catch {
        // fallback
      }

      const rootFs = window.getComputedStyle(document.documentElement).fontSize

      setInfo({
        buildId: typeof __BUILD_ID__ !== 'undefined' ? __BUILD_ID__ : 'dev',
        displayMode: isStandalone ? 'standalone' : 'browser',
        isSecureContext: window.isSecureContext ? 'true' : 'false',
        swState: navigator.serviceWorker?.controller
          ? navigator.serviceWorker.controller.state
          : 'uncontrolled',
        cacheVersion: cacheVer,
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
        dpr: String(window.devicePixelRatio),
        rootFontSize: rootFs,
        safeArea: safeAreaStr,
        hasSaveFilePicker: 'showSaveFilePicker' in window ? 'true' : 'false',
        shareCsv: testShare('text/csv', 'table.csv') ? 'true' : 'false',
        sharePdf: testShare('application/pdf', 'doc.pdf') ? 'true' : 'false',
        shareText: testShare('text/plain', 'note.txt') ? 'true' : 'false',
        shareJson: testShare('application/json', 'data.json') ? 'true' : 'false',
        storagePersisted: persisted,
        userAgent: navigator.userAgent.slice(0, 120),
      })
    }

    gatherDiagnostics()
  }, [isOpen])

  function handleCopy() {
    const textLines = [
      `Build ID: ${info.buildId}`,
      `Display Mode: ${info.displayMode}`,
      `Secure Context: ${info.isSecureContext}`,
      `Service Worker: ${info.swState}`,
      `Cache Version: ${info.cacheVersion}`,
      `Viewport: ${info.viewport}`,
      `DPR: ${info.dpr}`,
      `Root Font Size: ${info.rootFontSize}`,
      `Safe Area: ${info.safeArea}`,
      `showSaveFilePicker: ${info.hasSaveFilePicker}`,
      `canShare(text/csv): ${info.shareCsv}`,
      `canShare(application/pdf): ${info.sharePdf}`,
      `canShare(text/plain): ${info.shareText}`,
      `canShare(application/json): ${info.shareJson}`,
      `storage.persisted: ${info.storagePersisted}`,
      `User Agent: ${info.userAgent}`,
    ].join('\n')

    navigator.clipboard?.writeText?.(textLines)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const items = [
    { key: 'معرف البناء (Build ID)', value: info.buildId, bdi: true, stacked: true },
    { key: 'نمط العرض (Display Mode)', value: info.displayMode, bdi: true },
    { key: 'سياق آمن (isSecureContext)', value: info.isSecureContext, bdi: true },
    { key: 'حالة مسار الخدمة (SW State)', value: info.swState, bdi: true },
    { key: 'نسخة التخزين (Cache)', value: info.cacheVersion, bdi: true, stacked: true },
    { key: 'أبعاد الشاشة (Viewport)', value: info.viewport, bdi: true },
    { key: 'كثافة البكسل (DPR)', value: info.dpr, bdi: true },
    { key: 'حجم الخط الأساسي (Font)', value: info.rootFontSize, bdi: true },
    { key: 'حواشي الأمان (Safe Area)', value: info.safeArea, bdi: true },
    { key: 'showSaveFilePicker', value: info.hasSaveFilePicker, bdi: true },
    { key: 'مشاركة ملف CSV', value: info.shareCsv, bdi: true },
    { key: 'مشاركة ملف PDF', value: info.sharePdf, bdi: true },
    { key: 'مشاركة ملف نصي TXT', value: info.shareText, bdi: true },
    { key: 'مشاركة ملف JSON', value: info.shareJson, bdi: true },
    { key: 'تخزين دائم (Storage Persisted)', value: info.storagePersisted, bdi: true },
    { key: 'معرف المتصفح (User Agent)', value: info.userAgent, bdi: true, stacked: true },
  ]

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="معلومات تقنية"
      subtitle="بيانات تشغيل التطبيق على هذا الجهاز"
      footer={
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <Button
            variant="primary"
            onClick={handleCopy}
            style={{ flex: 1 }}
          >
            <Icon name={copied ? 'check' : 'copy'} size={18} />
            <span>{copied ? 'تم النسخ' : 'نسخ المعلومات'}</span>
          </Button>
          <Button variant="secondary" onClick={onClose} style={{ minWidth: '90px' }}>
            إغلاق
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <KeyValueList items={items} />
      </div>
    </Sheet>
  )
}
