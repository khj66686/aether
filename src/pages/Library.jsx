import { useState } from 'react'
import { sessions, categories } from '../data/sessions'
import SessionCard from '../components/SessionCard'
import { useFavorites } from '../hooks/useUserData'

export default function Library() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const { favorites, isFav, toggle: toggleFav } = useFavorites()
  const [showFavOnly, setShowFavOnly] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = sessions.filter(s => {
    const matchCat = activeCategory === '전체' || s.category === activeCategory
    const matchSearch = s.title.includes(search) || s.subtitle.includes(search) || s.tags.some(t => t.includes(search))
    const matchFav = !showFavOnly || isFav(s.id)
    return matchCat && matchSearch && matchFav
  })

  return (
    <div className="min-h-dvh pb-24 animate-[fadeIn_0.5s_ease-out]" style={{ background: 'radial-gradient(circle at 50% -10%, #1a1a2e 0%, #131314 55%)' }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-light text-on-surface tracking-tight mb-1">라이브러리</h1>
            <p className="text-on-surface-variant text-sm">모든 명상 세션을 탐색하세요</p>
          </div>
          <button
            onClick={() => setShowFavOnly(f => !f)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${showFavOnly ? 'bg-tertiary/15 border border-tertiary/30' : 'glass-card'}`}
          >
            <span className={`material-icon text-[22px] ${showFavOnly ? 'text-tertiary material-icon-filled' : 'text-on-surface-variant'}`}>
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 mb-5">
        <div className="glass-card rounded-xl flex items-center gap-3 px-4 py-3">
          <span className="material-icon text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="세션 검색..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <span className="material-icon text-on-surface-variant text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-6 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-tertiary/20 text-tertiary border border-tertiary/40'
                  : 'bg-surface-container text-on-surface-variant border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Session Count */}
      <div className="px-6 mb-4">
        <p className="text-on-surface-variant text-xs tracking-widest uppercase">
          {filtered.length}개 세션
        </p>
      </div>

      {/* Sessions Grid */}
      <div className="px-6">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(s => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-icon text-on-surface-variant text-[48px] mb-4">search_off</span>
            <p className="text-on-surface-variant text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
