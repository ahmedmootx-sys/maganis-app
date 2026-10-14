import { useState } from 'react'
import {
  MUSCLE_ATLAS,
  MUSCLE_REGIONS_AR,
  type MuscleRegion,
} from './muscleAtlasData.ts'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'
import { Select } from '../../components/Select'

export function MuscleAtlasDebug({ onClose }: { onClose?: () => void }) {
  const muscleList = Object.values(MUSCLE_ATLAS)
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentMuscle = muscleList[currentIndex]

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % muscleList.length)
  }

  function handlePrev() {
    setCurrentIndex(
      (prev) => (prev - 1 + muscleList.length) % muscleList.length,
    )
  }

  return (
    <div
      className="card muscle-atlas-debug"
      style={{
        padding: '18px',
        borderRadius: '16px',
        border: '2px solid var(--accent)',
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '10px',
          marginBottom: '14px',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--accent)' }}>
            🔬 أداة فحص ومراجعة الرؤوس العضلية (Muscle Atlas Inspector)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            فحص كل رأس عضلي من الـ 48 عضلة واحدة تلو الأخرى مع التأكد من مطابقة
            الحدود
          </span>
        </div>
        {onClose && (
          <button type="button" className="ghost tiny" onClick={onClose}>
            ✕ إغلاق
          </button>
        )}
      </div>

      {/* Muscle Selector & Stepper */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className="button-primary tiny"
            onClick={handlePrev}
          >
            ← السابق
          </button>
          <button
            type="button"
            className="button-primary tiny"
            onClick={handleNext}
          >
            التالي →
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '320px' }}>
          <Select
            id="muscle-select"
            value={currentMuscle.id}
            onChange={(val) => {
              const idx = muscleList.findIndex((m) => m.id === val)
              if (idx >= 0) setCurrentIndex(idx)
            }}
            options={muscleList.map((m, idx) => ({
              value: m.id,
              labelAr: `${idx + 1}. ${m.nameAr}`,
              labelEn: m.id,
            }))}
            sheetTitle="اختر العضلة للاختبار"
          />
        </div>

        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          {currentIndex + 1} / {muscleList.length}
        </span>
      </div>

      {/* Selected Muscle Card Info */}
      <div
        style={{
          background: 'var(--card-subtle)',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          <div>
            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>
              {currentMuscle.nameAr}
            </strong>
            <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
              {currentMuscle.nameEn} •{' '}
              <code style={{ color: 'var(--accent)' }}>{currentMuscle.id}</code>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                background: currentMuscle.layer === 'D' ? '#ede9fe' : '#e0f2fe',
                color: currentMuscle.layer === 'D' ? '#6d28d9' : '#0369a1',
                fontWeight: 700,
              }}
            >
              {currentMuscle.layer === 'D'
                ? 'طبقة عميقة (Deep)'
                : 'طبقة سطحية (Superficial)'}
            </span>

            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                fontWeight: 700,
              }}
            >
              المنظر:{' '}
              {currentMuscle.view === 'A'
                ? 'أمامي (A)'
                : currentMuscle.view === 'P'
                  ? 'خلفي (P)'
                  : 'أمامي وخلفي (A+P)'}
            </span>

            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
              }}
            >
              المنطقة: {MUSCLE_REGIONS_AR[currentMuscle.region as MuscleRegion]}
            </span>
          </div>
        </div>
      </div>

      {/* Live Map with highlighted muscle */}
      <AnatomyMuscleMap
        muscles={[{ id: currentMuscle.id, role: 'primary' }]}
        exerciseName={currentMuscle.nameAr}
        isFullView={true}
      />
    </div>
  )
}
