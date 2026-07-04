import { useState, useCallback } from 'react'

const KEYS = { favorites: 'aether_favorites', history: 'aether_history' }

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => load(KEYS.favorites))

  const toggle = useCallback((id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      save(KEYS.favorites, next)
      return next
    })
  }, [])

  return { favorites, toggle, isFav: (id) => favorites.includes(id) }
}

export function useHistory() {
  const [history, setHistory] = useState(() => load(KEYS.history))

  const addEntry = useCallback((id, durationSec) => {
    setHistory(prev => {
      const entry = { id, durationSec, completedAt: Date.now() }
      const next = [entry, ...prev.filter((_, i) => i < 49)] // 최대 50개
      save(KEYS.history, next)
      return next
    })
  }, [])

  const totalMinutes = Math.round(history.reduce((s, e) => s + (e.durationSec || 0), 0) / 60)
  const streak = calcStreak(history)

  return { history, addEntry, totalMinutes, streak }
}

function calcStreak(history) {
  if (!history.length) return 0
  const days = new Set(
    history.map(e => new Date(e.completedAt).toDateString())
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (days.has(d.toDateString())) streak++
    else break
  }
  return streak
}
