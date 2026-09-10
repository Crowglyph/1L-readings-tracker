import { Fragment, useMemo, useState } from 'react'
import { parseISO, isoFromDate, formatLong, todayISO } from '../utils/dates'
import { buildCourseColorMap, stripeGradient } from '../utils/courseColors'

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDaysDate(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function monthLabel(date) {
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const yy = String(date.getFullYear()).slice(-2)
  return `${month} '${yy}`
}

export default function CalendarHeatmap({ tasks, courses, collapsed, onToggleCollapse }) {
  const colorMap = useMemo(() => buildCourseColorMap(courses), [courses])
  const [selectedDate, setSelectedDate] = useState(null)

  const { weeks, byDate } = useMemo(() => {
    const dated = tasks.filter((t) => t.due)
    if (dated.length === 0) return { weeks: [], byDate: {} }

    const dueTimes = dated.map((t) => parseISO(t.due).getTime())
    const minDate = new Date(Math.min(...dueTimes))
    const maxDate = new Date(Math.max(...dueTimes))

    const byDate = {}
    for (const t of dated) {
      if (!byDate[t.due]) byDate[t.due] = new Set()
      byDate[t.due].add(t.course)
    }

    const gridStart = startOfWeek(minDate)
    const gridEndWeekStart = startOfWeek(maxDate)
    const msPerWeek = 7 * 24 * 60 * 60 * 1000
    const totalWeeks = Math.round((gridEndWeekStart.getTime() - gridStart.getTime()) / msPerWeek) + 1

    const weeks = []
    for (let w = 0; w < totalWeeks; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        week.push(addDaysDate(gridStart, w * 7 + d))
      }
      weeks.push(week)
    }

    return { weeks, byDate }
  }, [tasks])

  if (collapsed) {
    return (
      <aside className="cal-panel cal-panel--collapsed">
        <button
          className="cal-toggle"
          onClick={onToggleCollapse}
          title="Show term overview"
          aria-label="Show term overview"
        >
          ‹
        </button>
      </aside>
    )
  }

  const today = todayISO()
  const selectedTasks = selectedDate ? tasks.filter((t) => t.due === selectedDate) : []
  let lastMonthKey = null

  return (
    <aside className="cal-panel">
      <div className="cal-header">
        <div>
          <p className="eyebrow">Term overview</p>
          <h2>Reading Density</h2>
        </div>
        <button
          className="cal-toggle"
          onClick={onToggleCollapse}
          title="Hide term overview"
          aria-label="Hide term overview"
        >
          ›
        </button>
      </div>

      {weeks.length === 0 ? (
        <p className="empty">No dated readings yet.</p>
      ) : (
        <>
          <div className="cal-dow-row">
            {DOW_LABELS.map((d, i) => (
              <span key={i} className="cal-dow">
                {d}
              </span>
            ))}
          </div>

          <div className="cal-grid">
            {weeks.map((week, wi) => {
              const monthKey = `${week[0].getFullYear()}-${week[0].getMonth()}`
              const showMonth = monthKey !== lastMonthKey
              lastMonthKey = monthKey
              return (
                <Fragment key={wi}>
                  {showMonth && <div className="cal-month-row">{monthLabel(week[0])}</div>}
                  <div className="cal-week-row">
                    {week.map((day, di) => {
                      const iso = isoFromDate(day)
                      const dayCourses = byDate[iso] ? [...byDate[iso]] : []
                      const isEmpty = dayCourses.length === 0
                      const isToday = iso === today
                      const isSelected = iso === selectedDate
                      return (
                        <button
                          key={di}
                          className={`cal-cell${isEmpty ? ' cal-cell--empty' : ''}${isToday ? ' cal-cell--today' : ''}${isSelected ? ' cal-cell--selected' : ''}`}
                          title={`${day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${isEmpty ? '' : ': ' + dayCourses.join(', ')}`}
                          onClick={() => !isEmpty && setSelectedDate(isSelected ? null : iso)}
                          disabled={isEmpty}
                        >
                          {!isEmpty && (
                            <span
                              className="cal-cell-fill"
                              style={{ background: stripeGradient(dayCourses.map((c) => colorMap[c])) }}
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Fragment>
              )
            })}
          </div>

          <div className="cal-legend">
            {courses.map((c) => (
              <div className="cal-legend-item" key={c}>
                <span className="cal-legend-swatch" style={{ background: colorMap[c] }} />
                <span>{c}</span>
              </div>
            ))}
          </div>

          {selectedDate && (
            <div className="cal-detail">
              <div className="cal-detail-header">{formatLong(selectedDate)}</div>
              <ul className="cal-detail-list">
                {selectedTasks.map((t) => (
                  <li key={t.id}>
                    <span className="cal-detail-dot" style={{ background: colorMap[t.course] }} />
                    <span className="cal-detail-desc">{t.desc}</span>
                    <span className="cal-detail-course">{t.course}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
