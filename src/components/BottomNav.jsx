import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/', icon: 'home', label: '홈' },
  { path: '/library', icon: 'library_music', label: '라이브러리' },
  { path: '/sleep', icon: 'bedtime', label: '수면' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // hide nav on player and onboarding screens
  if (location.pathname.startsWith('/play') || location.pathname === '/onboarding') return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass-card border-t border-outline-variant">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-6">
        {navItems.map(({ path, icon, label }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 min-w-[56px] transition-all duration-200"
            >
              <span
                className={`material-icon text-[26px] transition-colors duration-200 ${
                  active ? 'text-tertiary material-icon-filled' : 'text-on-surface-variant'
                }`}
              >
                {icon}
              </span>
              <span
                className={`text-[11px] font-medium tracking-wide transition-colors duration-200 ${
                  active ? 'text-tertiary' : 'text-on-surface-variant'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
