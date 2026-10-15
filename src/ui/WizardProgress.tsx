import React from 'react'
import { fmtNumber } from '../utils/bidi.ts'

export interface WizardProgressProps {
  currentStep: number // 1-indexed
  totalSteps: number
  className?: string
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  className = '',
}) => {
  return (
    <div
      className={`wizard-progress ${className}`.trim()}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
    >
      <div className="wizard-progress__bars" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum <= currentStep
          return (
            <div
              key={stepNum}
              className={`wizard-progress__bar ${isCompleted ? 'wizard-progress__bar--completed' : ''}`}
            />
          )
        })}
      </div>
      <div className="wizard-progress__text">
        <span>الخطوة </span>
        <bdi>{fmtNumber(currentStep)}</bdi>
        <span> من </span>
        <bdi>{fmtNumber(totalSteps)}</bdi>
      </div>
    </div>
  )
}
