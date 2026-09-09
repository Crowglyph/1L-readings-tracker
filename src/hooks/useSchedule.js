import { useCallback, useEffect, useState } from 'react'
import Papa from 'papaparse'
import { SCHEDULE_CSV_URL } from '../config'
import bundledSchedule from '../data/tasks.json'
import { scheduleId } from '../utils/scheduleId'

const CACHE_KEY = '1l-readings-tracker:schedule-cache:v1'

function readCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

function normalizeRow(row) {
  const get = (...keys) => {
    const foundKey = Object.keys(row).find((k) => keys.includes(k.trim().toLowerCase()))
    const val = foundKey ? row[foundKey] : ''
    return val == null ? '' : String(val).trim()
  }

  const course = get('course')
  const desc = get('description', 'desc', 'reading', 'task')
  const due = get('due date', 'due', 'date')
  const pages = get('pages')
  const type = (get('type') || 'reading').toLowerCase()
  const explicitId = get('id')

  if (!course || !desc || !due) return null

  const base = { desc, course, due, pages, type }
  return { id: explicitId || scheduleId(base), ...base }
}

// Bundled fallback ships with real IDs already baked in (src/data/tasks.json),
// so progress carries over cleanly if you later switch a fresh install onto
// the live sheet.
function bundledAsSchedule() {
  return bundledSchedule
}

export function useSchedule() {
  const [schedule, setSchedule] = useState(() => readCache() || bundledAsSchedule())
  const [source, setSource] = useState(() => (readCache() ? 'cache' : 'bundled'))
  const [lastSynced, setLastSynced] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!SCHEDULE_CSV_URL) {
      setSource('bundled')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const sep = SCHEDULE_CSV_URL.includes('?') ? '&' : '?'
      const res = await fetch(`${SCHEDULE_CSV_URL}${sep}_=${Date.now()}`)
      if (!res.ok) throw new Error(`Sheet responded with HTTP ${res.status}`)
      const text = await res.text()
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      const rows = parsed.data.map(normalizeRow).filter(Boolean)
      if (rows.length === 0) throw new Error('The published sheet returned no readable rows')

      setSchedule(rows)
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(rows))
      setSource('live')
      setLastSynced(new Date())
    } catch (e) {
      console.warn('Could not refresh the schedule from the sheet; using the last known copy.', e)
      setError(e.message)
      setSource((prev) => (prev === 'live' ? 'cache' : prev))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { schedule, source, lastSynced, loading, error, refresh }
}
