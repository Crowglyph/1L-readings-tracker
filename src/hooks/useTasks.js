import { useEffect, useMemo, useState } from 'react'
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

// Progress (completed / pass / last_review) lives ONLY here, keyed by
// schedule row id, and is never derived from the schedule itself. That's
// what makes the schedule safely shareable: editing a due date or adding a
// reading in the sheet can never accidentally mark something as read for
// someone, and "reset" always has an unambiguous blank state to return to.
function mergeTasks(schedule, overrides) {
  return schedule.map((t) => ({
    completed: false,
    pass: '0',
    last_review: '',
    ...t,
    ...(overrides[t.id] || {}),
  }))
}

export function useTasks(schedule) {
  const [overrides, setOverrides] = useState(() => loadOverrides())
  const tasks = useMemo(() => mergeTasks(schedule, overrides), [schedule, overrides])

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
    const blank = {}
    for (const t of schedule) {
      blank[t.id] = { completed: false, pass: '0', last_review: '' }
    }
    setOverrides(blank)
    saveOverrides(blank)
  }

  return { tasks, markRead, toggleComplete, resetProgress }
}
