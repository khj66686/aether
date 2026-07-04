import { useNavigate } from 'react-router-dom'

const colorMap = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
}

export default function SessionCard({ session, compact = false }) {
  const navigate = useNavigate()

  if (compact) {
    return (
      <button
        onClick={() => navigate(`/play/${session.id}`)}
        className="glass-card rounded-xl p-4 flex items-center gap-4 w-full text-left transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
          <span className={`material-icon text-[22px] ${colorMap[session.color] || 'text-primary'}`}>
            self_improvement
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-on-surface font-medium text-sm truncate">{session.title}</p>
          <p className="text-on-surface-variant text-xs mt-0.5">{session.subtitle} · {session.duration}</p>
        </div>
        <span className="material-icon text-on-surface-variant text-[20px]">chevron_right</span>
      </button>
    )
  }

  return (
    <button
      onClick={() => navigate(`/play/${session.id}`)}
      className="glass-card rounded-xl p-5 flex flex-col gap-3 text-left transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.98] w-full"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
          <span className={`material-icon text-[20px] ${colorMap[session.color] || 'text-primary'}`}>
            self_improvement
          </span>
        </div>
        <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
          {session.duration}
        </span>
      </div>
      <div>
        <p className="text-on-surface font-medium">{session.title}</p>
        <p className="text-on-surface-variant text-sm mt-0.5">{session.subtitle}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {session.tags.map(tag => (
          <span key={tag} className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}
