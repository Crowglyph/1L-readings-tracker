export function todayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return isoFromDate(d)
}

export function isoFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, days) {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  return isoFromDate(d)
}

export function formatShort(iso) {
  if (!iso) return '—'
  const d = parseISO(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatLong(iso) {
  if (!iso) return '—'
  const d = parseISO(iso)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function isBefore(a, b) {
  return a < b
}
