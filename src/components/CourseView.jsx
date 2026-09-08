import TaskRow from './TaskRow'
import ProgressBar from './ProgressBar'
import { todayISO } from '../utils/dates'

export default function CourseView({ course, tasks, onMarkRead, onToggleComplete }) {
  const today = todayISO()
  const courseTasks = tasks.filter((t) => t.course === course).sort((a, b) => (a.due || '').localeCompare(b.due || ''))
  const done = courseTasks.filter((t) => t.completed).length

  return (
    <div>
      <header className="view-header">
        <p className="eyebrow">Course</p>
        <h1>{course}</h1>
        <ProgressBar done={done} total={courseTasks.length} />
      </header>

      <div className="rows">
        {courseTasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            mode="due"
            overdue={!t.completed && t.due && t.due < today}
            onMarkRead={onMarkRead}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </div>
  )
}
