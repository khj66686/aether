import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { soundEngine } from '../audio/SoundEngine'

const SLEEP_DURATIONS = [15, 30, 45, 60, 90]

const SOUNDS = [
  { id: 'rain', icon: 'water_drop', label: '빗소리' },
  { id: 'ocean', icon: 'waves', label: '파도' },
  { id: 'wind', icon: 'air', label: '바람' },
  { id: 'forest', icon: 'forest', label: '숲' },
  { id: 'silence', icon: 'nightlight', label: '정적' },
]

function formatTime(min) {
  if (min >= 60) return `${Math.floor(min / 60)}시간 ${min % 60 ? `${min % 60}분` : ''}`
  return `${min}분`
}

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-center">
      <p className="text-6xl font-light text-on-surface tracking-tight tabular-nums">
        {time.getHours().toString().padStart(2, '0')}
        <span className="opacity-60 animate-pulse">:</span>
        {time.getMinutes().toString().padStart(2, '0')}
      </p>
      <p className="text-on-surface-variant text-sm mt-2">
        {time.toLocaleDateString('ko-KR', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}

export default function Sleep() {
  const navigate = useNavigate()
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [activeSound, setActiveSound] = useState('rain')
  const [sleeping, setSleeping] = useState(false)
  const [volume, setVolume] = useState(60)
  const [remaining, setRemaining] = useState(null)
  const timerRef = useRef(null)

  const startSleep = () => {
    soundEngine.play(activeSound, volume)
    setSleeping(true)
    setRemaining(selectedDuration * 60)
  }

  const stopSleep = () => {
    soundEngine.stop()
    setSleeping(false)
    clearInterval(timerRef.current)
    setRemaining(null)
  }

  // 볼륨 변경 시 실시간 반영
  const handleVolume = (val) => {
    setVolume(val)
    soundEngine.setVolume(val)
  }

  // 소리 변경 시 재생 중이면 즉시 교체
  const handleSound = (id) => {
    setActiveSound(id)
    if (sleeping) soundEngine.play(id, volume)
  }

  // 컴포넌트 언마운트 시 오디오 정리
  useEffect(() => () => soundEngine.stop(), [])

  useEffect(() => {
    if (sleeping && remaining !== null) {
      timerRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            soundEngine.stop()
            setSleeping(false)
            return null
          }
          return r - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [sleeping])

  if (sleeping) {
    const mins = remaining ? Math.ceil(remaining / 60) : 0
    return (
      <div className="sleep-gradient-bg min-h-dvh flex flex-col items-center justify-between py-16 px-6">
        <div className="text-center">
          <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-8">수면 모드</p>
          <Clock />
        </div>

        {/* Breathing circle — slow pulse */}
        <div className="flex flex-col items-center gap-8">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(196,192,252,0.04)',
              border: '1px solid rgba(196,192,252,0.12)',
              boxShadow: '0 0 80px 20px rgba(196,192,252,0.06)',
              animation: 'pulseGlow 12s ease-in-out infinite',
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(196,192,252,0.06)', border: '1px solid rgba(196,192,252,0.15)' }}>
              <span className="material-icon text-primary/60 text-[32px]">bedtime</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-on-surface-variant text-sm">
              {remaining ? `${Math.floor(remaining / 60)}분 ${remaining % 60}초 후 종료` : '곧 종료됩니다'}
            </p>
            <p className="text-on-surface-variant/50 text-xs mt-1">{SOUNDS.find(s => s.id === activeSound)?.label} 재생 중</p>
          </div>
        </div>

        <button
          onClick={stopSleep}
          className="glass-card px-8 py-3 rounded-full text-on-surface-variant text-sm transition-all active:scale-95"
        >
          수면 모드 종료
        </button>
      </div>
    )
  }

  return (
    <div className="sleep-gradient-bg min-h-dvh pb-24 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-3">수면 모드</p>
        <Clock />
      </div>

      {/* Moon decoration */}
      <div className="flex justify-center mb-10">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse-glow"
          style={{
            background: 'rgba(193,198,217,0.06)',
            border: '1px solid rgba(193,198,217,0.12)',
            boxShadow: '0 0 60px 10px rgba(193,198,217,0.08)',
          }}
        >
          <span className="material-icon text-primary/70 text-[40px]">bedtime</span>
        </div>
      </div>

      {/* Timer Selection */}
      <div className="px-6 mb-8">
        <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-4">수면 타이머</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {SLEEP_DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDuration(d)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedDuration === d
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-surface-container text-on-surface-variant border border-transparent'
              }`}
            >
              {formatTime(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Sound Selection */}
      <div className="px-6 mb-8">
        <p className="text-on-surface-variant text-xs tracking-widest uppercase mb-4">배경 소리</p>
        <div className="grid grid-cols-5 gap-2">
          {SOUNDS.map(s => (
            <button
              key={s.id}
              onClick={() => handleSound(s.id)}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl transition-all duration-200 ${
                activeSound === s.id
                  ? 'bg-primary/10 border border-primary/20'
                  : 'glass-card'
              }`}
            >
              <span className={`material-icon text-[24px] ${activeSound === s.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                {s.icon}
              </span>
              <span className={`text-[10px] font-medium ${activeSound === s.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-4">
          <span className="material-icon text-on-surface-variant text-[20px]">volume_down</span>
          <div className="flex-1 relative h-1 bg-outline-variant rounded-full">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => handleVolume(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
            />
            <div className="h-full bg-primary/50 rounded-full transition-all" style={{ width: `${volume}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background"
              style={{ left: `calc(${volume}% - 6px)` }}
            />
          </div>
          <span className="material-icon text-on-surface-variant text-[20px]">volume_up</span>
        </div>
      </div>

      {/* Start Button */}
      <div className="px-6">
        <button
          onClick={startSleep}
          className="w-full py-4 rounded-2xl font-medium text-on-primary transition-all duration-200 active:scale-[0.98]"
          style={{
            background: 'rgba(193,198,217,0.15)',
            border: '1px solid rgba(193,198,217,0.25)',
            boxShadow: '0 0 40px 4px rgba(193,198,217,0.08)',
          }}
        >
          <span className="text-primary">수면 모드 시작</span>
        </button>
        <p className="text-center text-on-surface-variant text-xs mt-3">
          {formatTime(selectedDuration)} 후 자동으로 종료됩니다
        </p>
      </div>
    </div>
  )
}
