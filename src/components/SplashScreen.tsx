import { useEffect, useState } from 'react'
import { assetUrl } from '../utils/assetUrl.ts'

interface SplashScreenProps {
  onFinish: () => void
}

const QUOTES = [
  'يا وحش الأكوان.. جهز الفوطة وإزازة المياه! 💪🔥',
  'النهارده مفيش أعذار.. فورمة الساحل بتتبني في الشتاء! 🏋️‍♂️',
  'د. مجانص معاك.. عضلات فولاذية وبدون إصابات 🎯',
  'جهّز نفسك.. عاش يا بطل، مفيش مستحيل! 🚀',
]

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fading, setFading] = useState(false)
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)],
  )

  useEffect(() => {
    // Show splash for 1.2s then fade out for 0.3s
    const timer = setTimeout(() => {
      setFading(true)
      const closeTimer = setTimeout(() => {
        onFinish()
      }, 350)
      return () => clearTimeout(closeTimer)
    }, 1200)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div
      className={`splash-screen ${fading ? 'splash-screen--fading' : ''}`}
      onClick={() => onFinish()}
      role="button"
      tabIndex={0}
      aria-label="تخطي شاشة البداية"
    >
      <div className="splash-content">
        <div className="splash-mascot-wrapper">
          <img
            src={assetUrl('branding/maganis-standing-transparent.png')}
            alt="د. مجانص"
            className="splash-mascot"
          />
        </div>
        <h1 className="splash-title">Maganis</h1>
        <p className="splash-subtitle">د. مجانص — مدربك وطبيبك الرياضي</p>
        <p className="splash-quote">{quote}</p>
        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>
    </div>
  )
}
