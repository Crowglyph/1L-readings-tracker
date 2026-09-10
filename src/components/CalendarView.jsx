import { useMemo, useState } from 'react'
import { isoFromDate, formatShort, formatLong, todayISO } from '../utils/dates'
import { buildCourseColorMap } from '../utils/courseColors'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const VISIBLE_EVENTS = 3

function startOfMonth(year, month) {
  return new Date(year, month, 1)
}

function startOfGrid(monthStart) {
  const d = new Date(monthStart)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDaysDate(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export default function CalendarView({ tasks, courses, onMarkRead, onToggleComplete }) {
  const now = new Date()
  const [cursor, setCursor] = useState(() => startOfMonth(now.getFullYear(), now.getMonth()))
  const [selectedId, setSelectedId] = useState(null)
  const [expandedDays, setExpandedDays] = useState(() => new Set())

  const colorMap = useMemo(() => buildCourseColorMap(courses), [courses])

  const byDate = useMemo(() => {
    const map = {}
    for (const t of tasks) {
      if (!t.due) continue
      if (!map[t.due]) map[t.due] = []
      map[t.due].push(t)
    }
    for (const key in map) {
      map[key].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return a.course.localeCompare(b.course)
      })
    }
    return map
  }, [tasks])

  const gridStart = startOfGrid(cursor)
  const days = Array.from({ length: 42 }, (_, i) => addDaysDate(gridStart, i))
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const todayIso = todayISO()
  const selectedTask = selectedId ? tasks.find((t) => t.id === selectedId) : null

  function goPrev() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
  }
  function goNext() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
  }
  function goToday() {
    setCursor(startOfMonth(now.getFullYear(), now.getMonth()))
  }
  function toggleExpand(iso) {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  const passNum = selectedTask ? parseInt(selectedTask.pass, 10) || 0 : 0

  return (
    <div className="calendar-view">
      <header className="view-header calendar-view-header">
        <p className="eyebrow">Term calendar</p>
        <h1>Calendar View</h1>
      </header>

      <div className="cal2-toolbar">
        <div className="cal2-nav">
          <button className="btn" onClick={goPrev} aria-label="Previous month">
            ‹
          </button>
          <button className="btn" onClick={goToday}>
            Today
          </button>
          <button className="btn" onClick={goNext} aria-label="Next month">
            ›
          </button>
        </div>
        <div className="cal2-month-label">{monthLabel}</div>
        <div className="cal2-legend">
          {courses.map((c) => (
            <span className="cal2-legend-item" key={c}>
              <span className="cal2-legend-dot" style={{ background: colorMap[c] }} />
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="cal2-body">
        <div className="cal2-grid-wrap">
          <div className="cal2-dow-row">
            {DOW.map((d) => (
              <div className="cal2-dow" key={d}>
                {d}
              </div>
            ))}
          </div>
          <div className="cal2-grid">
            {days.map((day, i) => {
              const iso = isoFromDate(day)
              const inMonth = day.getMonth() === cursor.getMonth()
              const isToday = iso === todayIso
              const events = byDate[iso] || []
              const isExpanded = expandedDays.has(iso)
              const visible = isExpanded ? events : events.slice(0, VISIBLE_EVENTS)
              const hiddenCount = events.length - VISIBLE_EVENTS

              return (
                <div
                  key={i}
                  className={`cal2-cell${inMonth ? '' : ' cal2-cell--outside'}${isToday ? ' cal2-cell--today' : ''}`}
                >
                  <div className="cal2-cell-date-row">
                    <span className="cal2-cell-date">{day.getDate()}</span>
                  </div>
                  <div className="cal2-events">
                    {visible.map((t) => (
                      <button
                        key={t.id}
                        className={`cal2-event${t.completed ? ' cal2-event--done' : ''}${
                          selectedId === t.id ? ' cal2-event--selected' : ''
                        }`}
                        style={{ '--event-color': colorMap[t.course] }}
                        onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
                        title={t.desc}
                      >
                        {t.desc}
                      </button>
                    ))}
                    {hiddenCount > 0 && (
                      <button className="cal2-more" onClick={() => toggleExpand(iso)}>
                        {isExpanded ? 'Show less' : `+${hiddenCount} more`}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedTask && (
          <aside className="cal2-detail">
            <button className="cal2-detail-close" onClick={() => setSelectedId(null)} aria-label="Close">
              ×
            </button>
            <p className="eyebrow" style={{ color: colorMap[selectedTask.course] }}>
              {selectedTask.course}
            </p>
            <h3 className="cal2-detail-desc">{selectedTask.desc}</h3>
            <dl className="cal2-detail-facts">
              <div>
                <dt>Due</dt>
                <dd>{formatLong(selectedTask.due)}</dd>
              </div>
              {selectedTask.pages && (
                <div>
                  <dt>Pages</dt>
                  <dd>{selectedTask.pages}</dd>
                </div>
              )}
              {selectedTask.type !== 'reading' && (
                <div>
                  <dt>Type</dt>
                  <dd>{selectedTask.type}</dd>
                </div>
              )}
              <div>
                <dt>Status</dt>
                <dd>{selectedTask.completed ? 'Completed' : 'Not read yet'}</dd>
              </div>
              {selectedTask.type === 'reading' && passNum > 0 && (
                <div>
                  <dt>Review pass</dt>
                  <dd>
                    {passNum}
                    {selectedTask.last_review ? ` (last ${formatShort(selectedTask.last_review)})` : ''}
                  </dd>
                </div>
              )}
            </dl>
            <div className="cal2-detail-actions">
              {selectedTask.type === 'reading' ? (
                <>
                  {!selectedTask.completed && (
                    <button className="btn btn--ghost" onClick={() => onMarkRead(selectedTask.id)}>
                      Mark Read
                    </button>
                  )}
                  {selectedTask.completed && passNum < 3 && (
                    <button className="btn btn--ghost" onClick={() => onMarkRead(selectedTask.id)}>
                      Mark Reviewed (pass {passNum + 1})
                    </button>
                  )}
                  {selectedTask.completed && passNum >= 3 && <p className="cal2-detail-note">Fully reviewed.</p>}
                </>
              ) : (
                <button className="btn btn--ghost" onClick={() => onToggleComplete(selectedTask.id)}>
                  {selectedTask.completed ? 'Mark Not Done' : 'Mark Done'}
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
