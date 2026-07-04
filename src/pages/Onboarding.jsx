import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    icon: 'nightlight_round',
    iconColor: 'text-primary',
    glowColor: 'rgba(193,198,217,0.15)',
    title: '여름밤의 고요',
    subtitle: 'Aether',
    desc: '바쁜 일상 속 내면의 정적을 찾아드립니다.\n달빛처럼 부드러운 명상의 세계로 오세요.',
  },
  {
    icon: 'air',
    iconColor: 'text-tertiary',
    glowColor: 'rgba(196,192,252,0.2)',
    title: '호흡으로 시작하세요',
    subtitle: '가이드 호흡',
    desc: '과학적으로 검증된 4-7-8, 박스 호흡법으로\n몸과 마음의 긴장을 자연스럽게 풀어드려요.',
  },
  {
    icon: 'bedtime',
    iconColor: 'text-secondary',
    glowColor: 'rgba(193,199,207,0.15)',
    title: '깊은 잠으로 이끌게요',
    subtitle: '수면 모드',
    desc: '자연 소리와 함께 서서히 잠들어보세요.\n타이머가 조용히 당신을 지켜드릴 거예요.',
  },
  {
    icon: 'self_improvement',
    iconColor: 'text-tertiary',
    glowColor: 'rgba(196,192,252,0.18)',
    title: '나만의 루틴을 만들어요',
    subtitle: '라이브러리',
    desc: '수면, 불안 해소, 집중력 향상까지\n상황에 맞는 세션을 언제든 선택하세요.',
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  const next = () => {
    if (isLast) {
      localStorage.setItem('aether_onboarded', '1')
      navigate('/')
    } else {
      setStep(s => s + 1)
    }
  }

  const skip = () => {
    localStorage.setItem('aether_onboarded', '1')
    navigate('/')
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-between px-8 py-16"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a1a30 0%, #131314 65%)' }}
    >
      {/* Skip */}
      <div className="w-full flex justify-end">
        {!isLast && (
          <button onClick={skip} className="text-on-surface-variant text-sm">
            건너뛰기
          </button>
        )}
      </div>

      {/* Icon */}
      <div className="flex flex-col items-center gap-10 animate-[fadeIn_0.5s_ease-out]" key={step}>
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `0 0 80px 20px ${slide.glowColor}`,
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <span className={`material-icon text-[44px] ${slide.iconColor}`}>{slide.icon}</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-3">{slide.subtitle}</p>
          <h1 className="text-3xl font-light text-on-surface tracking-tight mb-4">{slide.title}</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line">{slide.desc}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="w-full flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 h-2 bg-tertiary'
                  : 'w-2 h-2 bg-on-surface-variant/30'
              }`}
            />
          ))}
        </div>

        {/* Next / Start button */}
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          style={{
            background: 'rgba(196,192,252,0.12)',
            border: '1px solid rgba(196,192,252,0.25)',
            boxShadow: '0 0 40px 4px rgba(196,192,252,0.08)',
          }}
        >
          <span className="text-tertiary">{isLast ? '시작하기' : '다음'}</span>
          <span className="material-icon text-tertiary text-[20px]">
            {isLast ? 'check' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </div>
  )
}
