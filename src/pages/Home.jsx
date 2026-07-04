import { useNavigate } from 'react-router-dom'
import { sessions } from '../data/sessions'
import SessionCard from '../components/SessionCard'
import { useHistory } from '../hooks/useUserData'

const featured = sessions.slice(0, 2)
const recent = sessions.slice(2, 5)

export default function Home() {
  const { totalMinutes, streak, history } = useHistory()
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting =
    hour < 5 ? '고요한 밤이에요' :
    hour < 12 ? '좋은 아침이에요' :
    hour < 18 ? '평온한 오후에요' :
    hour < 22 ? '편안한 저녁이에요' : '고요한 밤이에요'

  return (
    <div className="soft-gradient-bg min-h-dvh pb-24 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <p className="text-on-surface-variant text-sm tracking-widest uppercase mb-2">Aether</p>
        <h1 className="text-[32px] font-light leading-tight text-on-surface tracking-tight">
          {greeting}
        </h1>
        <p className="text-on-surface-variant mt-2 text-sm">오늘도 내면의 고요함을 찾아보세요</p>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="px-6 mb-6">
          <div className="glass-card rounded-xl px-5 py-4 flex items-center gap-6">
            <div className="text-center flex-1">
              <p className="text-2xl font-light text-on-surface tabular-nums">{totalMinutes}</p>
              <p className="text-on-surface-variant text-xs mt-0.5">총 명상 분</p>
            </div>
            <div className="w-px h-8 bg-outline-variant" />
            <div className="text-center flex-1">
              <p className="text-2xl font-light text-tertiary tabular-nums">{streak}</p>
              <p className="text-on-surface-variant text-xs mt-0.5">연속 일수</p>
            </div>
            <div className="w-px h-8 bg-outline-variant" />
            <div className="text-center flex-1">
              <p className="text-2xl font-light text-on-surface tabular-nums">{history.length}</p>
              <p className="text-on-surface-variant text-xs mt-0.5">완료 세션</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/play/1')}
            className="glass-card rounded-xl p-5 text-left transition-all duration-200 hover:bg-white/[0.07] active:scale-[0.97]"
          >
            <span className="material-icon text-tertiary text-[28px] mb-3 block">air</span>
            <p className="text-on-surface font-medium text-sm">호흡 명상</p>
            <p className="text-on-surface-variant text-xs mt-1">지금 바로 시작</p>
          </button>
          <button
            onClick={() => navigate('/sleep')}
            className="glass-card rounded-xl p-5 text-left transition-all duration-200 hover:bg-white/[0.07] active:scale-[0.97]"
          >
            <span className="material-icon text-primary text-[28px] mb-3 block">bedtime</span>
            <p className="text-on-surface font-medium text-sm">수면 모드</p>
            <p className="text-on-surface-variant text-xs mt-1">편안한 밤으로</p>
          </button>
        </div>
      </div>

      {/* Breath Circle CTA */}
      <div className="px-6 mb-10">
        <button
          onClick={() => navigate('/play/2')}
          className="w-full glass-card rounded-2xl p-6 flex items-center gap-5 transition-all duration-200 hover:bg-white/[0.07] active:scale-[0.98]"
        >
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full border border-tertiary/30 flex items-center justify-center glow-lavender animate-pulse-glow">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 border border-tertiary/40 flex items-center justify-center">
                <span className="material-icon text-tertiary text-[20px]">self_improvement</span>
              </div>
            </div>
          </div>
          <div className="flex-1 text-left">
            <p className="text-on-surface font-medium">오늘의 추천</p>
            <p className="text-tertiary text-sm mt-0.5 font-medium">고요한 정적 · 20분</p>
            <p className="text-on-surface-variant text-xs mt-1">깊은 명상으로 하루를 마무리하세요</p>
          </div>
          <span className="material-icon text-on-surface-variant">chevron_right</span>
        </button>
      </div>

      {/* Featured Sessions */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-on-surface font-medium">추천 세션</h2>
          <button onClick={() => navigate('/library')} className="text-tertiary text-sm">전체 보기</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featured.map(s => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      </div>

      {/* Recent */}
      <div className="px-6">
        <h2 className="text-on-surface font-medium mb-4">계속하기</h2>
        <div className="flex flex-col gap-3">
          {recent.map(s => (
            <SessionCard key={s.id} session={s} compact />
          ))}
        </div>
      </div>
    </div>
  )
}
