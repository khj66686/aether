import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { sessions, breathingPatterns } from '../data/sessions'
import { useFavorites, useHistory } from '../hooks/useUserData'

const PHASES = ['들이쉬기', '참기', '내쉬기']

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = sessions.find(s => s.id === Number(id)) || sessions[0]
  const pattern = breathingPatterns[0]
  const { isFav, toggle: toggleFav } = useFavorites()
  const { addEntry } = useHistory()
  const [completed, setCompleted] = useState(false)

  const totalSeconds = parseInt(session.duration) * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const [playing, setPlaying] = useState(false)
  const [breathPhase, setBreathPhase] = useState(0) // 0=inhale,1=hold,2=exhale
  const [breathProgress, setBreathProgress] = useState(0)
  const [isBreathing, setIsBreathing] = useState(false)
  const [patternIdx, setPatternIdx] = useState(0)

  const timerRef = useRef(null)
  const breathRef = useRef(null)
  const patternRef = useRef(patternIdx)
  patternRef.current = patternIdx

  const getPhaseDurations = () => {
    const p = breathingPatterns[patternRef.current]
    return [p.inhale, p.hold, p.exhale]
  }

  const startBreathCycle = useCallback(() => {
    let phase = 0
    let elapsed = 0

    const tick = () => {
      elapsed += 0.1
      const phaseDurations = getPhaseDurations()
      const phaseDur = phaseDurations[phase]
      setBreathProgress(elapsed / phaseDur)

      if (elapsed >= phaseDur) {
        phase = (phase + 1) % 3
        elapsed = 0
        setBreathPhase(phase)
      }
    }

    breathRef.current = setInterval(tick, 100)
    setIsBreathing(true)
    setBreathPhase(0)
    setBreathProgress(0)
  }, [])

  const handlePatternChange = (idx) => {
    setPatternIdx(idx)
    // 재생 중이면 호흡 사이클 재시작
    if (playing) {
      clearInterval(breathRef.current)
      setTimeout(() => startBreathCycle(), 50)
    }
  }

  const stopBreathCycle = useCallback(() => {
    clearInterval(breathRef.current)
    setIsBreathing(false)
  }, [])

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setPlaying(false)
            stopBreathCycle()
            setCompleted(true)
            addEntry(session.id, totalSeconds)
            return 0
          }
          return r - 1
        })
      }, 1000)
      startBreathCycle()
    } else {
      clearInterval(timerRef.current)
      stopBreathCycle()
    }
    return () => {
      clearInterval(timerRef.current)
      clearInterval(breathRef.current)
    }
  }, [playing])

  const progress = (totalSeconds - remaining) / totalSeconds
  const circumference = 2 * Math.PI * 54
  const strokeDash = circumference * (1 - progress)

  const breathScale = breathPhase === 0
    ? 1 + breathProgress * 0.25
    : breathPhase === 1
    ? 1.25
    : 1.25 - breathProgress * 0.25

  const breathGlow = breathPhase === 0
    ? `0 0 ${40 + breathProgress * 40}px ${5 + breathProgress * 15}px rgba(196,192,252,${0.1 + breathProgress * 0.2})`
    : breathPhase === 1
    ? '0 0 80px 20px rgba(196,192,252,0.3)'
    : `0 0 ${80 - breathProgress * 40}px ${20 - breathProgress * 15}px rgba(196,192,252,${0.3 - breathProgress * 0.2})`

  // 완료 오버레이
  if (completed) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-8 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, #1c1c3a 0%, #131314 65%)' }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{ background: 'rgba(196,192,252,0.1)', border: '1px solid rgba(196,192,252,0.25)', boxShadow: '0 0 60px 12px rgba(196,192,252,0.15)' }}>
          <span className="material-icon text-tertiary text-[44px] material-icon-filled">check_circle</span>
        </div>
        <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-3">완료</p>
        <h1 className="text-2xl font-light text-on-surface mb-2">{session.title}</h1>
        <p className="text-on-surface-variant text-sm mb-10">{session.duration} 명상을 마쳤어요. 수고하셨습니다 🌙</p>
        <div className="flex gap-3 w-full">
          <button onClick={() => { setCompleted(false); setRemaining(totalSeconds) }}
            className="flex-1 py-3 rounded-xl glass-card text-on-surface-variant text-sm transition-all active:scale-95">
            다시 하기
          </button>
          <button onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
            style={{ background: 'rgba(196,192,252,0.12)', border: '1px solid rgba(196,192,252,0.25)' }}>
            <span className="text-tertiary">홈으로</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: `radial-gradient(ellipse at 50% 20%, #1c1c3a 0%, #131314 65%), url('/meditation-bg.png') center/cover` }}
    >
      {/* Back button */}
      <div className="flex items-center px-6 pt-14 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full glass-card"
        >
          <span className="material-icon text-on-surface-variant text-[22px]">arrow_back</span>
        </button>
        <div className="flex-1 text-center">
          <p className="text-on-surface-variant text-xs tracking-widest uppercase">{session.subtitle}</p>
        </div>
        <button
          onClick={() => toggleFav(session.id)}
          className="w-10 h-10 flex items-center justify-center rounded-full glass-card"
        >
          <span className={`material-icon text-[22px] transition-colors duration-200 ${isFav(session.id) ? 'text-tertiary material-icon-filled' : 'text-on-surface-variant'}`}>
            favorite
          </span>
        </button>
      </div>

      {/* Session title */}
      <div className="text-center px-6 mb-8">
        <h1 className="text-2xl font-light text-on-surface">{session.title}</h1>
        <p className="text-on-surface-variant text-sm mt-1">{pattern.name} · {pattern.description}</p>
      </div>

      {/* Breath Circle */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="relative flex items-center justify-center">
          {/* Timer ring SVG */}
          <svg width="140" height="140" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(196,192,252,0.12)" strokeWidth="2" />
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke="rgba(196,192,252,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Breathing circle */}
          <div
            className="w-28 h-28 rounded-full border border-tertiary/30 flex items-center justify-center transition-all duration-300"
            style={{
              transform: `scale(${isBreathing ? breathScale : 1})`,
              boxShadow: isBreathing ? breathGlow : '0 0 40px 5px rgba(196,192,252,0.1)',
              background: 'rgba(196,192,252,0.05)',
            }}
          >
            <div className="w-16 h-16 rounded-full border border-tertiary/30 flex items-center justify-center"
              style={{ background: 'rgba(196,192,252,0.08)' }}>
              <span className="material-icon text-tertiary text-[28px]">self_improvement</span>
            </div>
          </div>
        </div>

        {/* Breath phase label */}
        <div className="h-8 flex items-center justify-center">
          {isBreathing && (
            <div className="text-center animate-[fadeIn_0.3s_ease-out]">
              <p className="text-tertiary text-sm font-medium tracking-widest uppercase">
                {PHASES[breathPhase]}
              </p>
              <div className="mt-2 w-24 h-0.5 bg-tertiary/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-tertiary/60 rounded-full transition-all duration-100"
                  style={{ width: `${breathProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          {!isBreathing && !playing && (
            <p className="text-on-surface-variant text-sm">시작 버튼을 눌러주세요</p>
          )}
        </div>

        {/* Timer display */}
        <div className="text-center">
          <p className="text-5xl font-light text-on-surface tracking-tight tabular-nums">
            {formatTime(remaining)}
          </p>
          <p className="text-on-surface-variant text-xs mt-2">
            {progress > 0 ? `${Math.round(progress * 100)}% 완료` : '준비'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 pb-16">
        {/* Progress bar */}
        <div className="progress-track h-1 mb-8">
          <div className="progress-fill h-full" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setRemaining(totalSeconds)}
            className="w-12 h-12 flex items-center justify-center rounded-full glass-card transition-all active:scale-95"
          >
            <span className="material-icon text-on-surface-variant text-[22px]">restart_alt</span>
          </button>

          <button
            onClick={() => setPlaying(p => !p)}
            className="w-20 h-20 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              background: 'rgba(196,192,252,0.15)',
              border: '1px solid rgba(196,192,252,0.3)',
              boxShadow: playing ? '0 0 32px 6px rgba(196,192,252,0.2)' : 'none',
            }}
          >
            <span className="material-icon text-tertiary text-[36px] material-icon-filled">
              {playing ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={() => navigate('/library')}
            className="w-12 h-12 flex items-center justify-center rounded-full glass-card transition-all active:scale-95"
          >
            <span className="material-icon text-on-surface-variant text-[22px]">playlist_add</span>
          </button>
        </div>

        {/* Pattern selector */}
        <div className="mt-6 flex gap-2 justify-center flex-wrap">
          {breathingPatterns.map((p, i) => (
            <button
              key={i}
              onClick={() => handlePatternChange(i)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                i === patternIdx
                  ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                  : 'text-on-surface-variant bg-surface-container border border-transparent hover:border-outline-variant'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="text-center text-on-surface-variant/60 text-xs mt-2">
          {breathingPatterns[patternIdx].inhale}-{breathingPatterns[patternIdx].hold}-{breathingPatterns[patternIdx].exhale} 패턴 · {breathingPatterns[patternIdx].description}
        </p>
      </div>
    </div>
  )
}
