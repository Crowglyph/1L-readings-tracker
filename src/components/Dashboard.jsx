import TaskRow from './TaskRow'
import { todayISO, addDays, formatLong } from '../utils/dates'

function Section({ title, tasks, overdue, onMarkRead, onToggleComplete }) {
  if (tasks.length === 0) return null
  return (
    <section className="section">
      <h3 className="section-title">{title}</h3>
      <div className="rows">
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            mode="due"
            showCourse
            overdue={!!overdue}
            onMarkRead={onMarkRead}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </section>
  )
}

export default function Dashboard({ tasks, onMarkRead, onToggleComplete }) {
  const today = todayISO()
  const weekEnd = addDays(today, 7)
  const twoWeekEnd = addDays(today, 14)

  const pending = tasks.filter((t) => !t.completed && t.type !== 'examprep')
  const examPrep = tasks.filter((t) => !t.completed && t.type === 'examprep')

  const overdue = pending.filter((t) => t.due && t.due < today).sort((a, b) => a.due.localeCompare(b.due))
  const thisWeek = pending
    .filter((t) => t.due && t.due >= today && t.due <= weekEnd)
    .sort((a, b) => a.due.localeCompare(b.due))
  const nextTwoWeeks = pending
    .filter((t) => t.due && t.due > weekEnd && t.due <= twoWeekEnd)
    .sort((a, b) => a.due.localeCompare(b.due))
  const later = pending
    .filter((t) => !t.due || t.due > twoWeekEnd)
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))

  const nothingPending =
    overdue.length === 0 && thisWeek.length === 0 && nextTwoWeeks.length === 0 && later.length === 0

  const noScheduleAtAll = tasks.length === 0

  const handlers = { onMarkRead, onToggleComplete }

  return (
    <div>
      <header className="view-header">
        <p className="eyebrow">{formatLong(today)}</p>
        <h1>Readings List</h1>
      </header>

      {noScheduleAtAll ? (
        <p className="empty">
          No reading schedule connected yet. If you're setting this up, add your Google Sheet's link as the
          VITE_SCHEDULE_CSV_URL environment variable — see README.md.
        </p>
      ) : (
        nothingPending && <p className="empty">Nothing pending. Enjoy the quiet.</p>
      )}

      <Section title="Overdue" tasks={overdue} overdue {...handlers} />
      <Section title="This Week" tasks={thisWeek} {...handlers} />
      <Section title="Next Two Weeks" tasks={nextTwoWeeks} {...handlers} />
      <Section title="Later" tasks={later} {...handlers} />
      {examPrep.length > 0 && <Section title="Exam Prep & Other Deadlines" tasks={examPrep} {...handlers} />}
    </div>
  )
}
