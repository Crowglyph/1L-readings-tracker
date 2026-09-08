import { useEffect, useMemo, useState } from 'react'
import baseTasks from '../data/tasks.json'
import { todayISO } from '../utils/dates'

const OVERRIDES_KEY = '1l-readings-tracker:overrides:v1'

function loadOverrides() {
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveOverrides(overrides) {
  window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
}

function mergeTasks(overrides) {
  return baseTasks.map((t) => ({ ...t, ...(overrides[t.id] || {}) }))
}

export function useTasks() {
  const [overrides, setOverrides] = useState(() => loadOverrides())
  const tasks = useMemo(() => mergeTasks(overrides), [overrides])

  useEffect(() => {
    saveOverrides(overrides)
  }, [overrides])

  function updateTask(id, patch) {
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch },
    }))
  }

  function markRead(id) {
    const current = tasks.find((t) => t.id === id)
    if (!current) return
    const pass = (parseInt(current.pass, 10) || 0) + 1
    updateTask(id, { completed: true, pass: String(pass), last_review: todayISO() })
  }

  function toggleComplete(id) {
    const current = tasks.find((t) => t.id === id)
    if (!current) return
    updateTask(id, { completed: !current.completed })
  }

  function resetProgress() {
    // A true reset means every task goes back to "never touched" -
    // not back to whatever completed/pass state shipped in tasks.json.
    const blank = {}
    for (const t of baseTasks) {
      blank[t.id] = { completed: false, pass: '0', last_review: '' }
    }
    setOverrides(blank)
    saveOverrides(blank)
  }

  return { tasks, markRead, toggleComplete, resetProgress }
}
