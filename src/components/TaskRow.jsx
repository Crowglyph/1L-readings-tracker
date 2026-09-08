import { formatShort } from '../utils/dates'

const TYPE_LABEL = {
  reading: null,
  essay: 'Essay',
  exercise: 'Exercise',
  examprep: 'Exam Prep',
}

export default function TaskRow({ task, mode, showCourse, overdue, onMarkRead, onToggleComplete }) {
  const isReading = task.type === 'reading'
  const typeLabel = TYPE_LABEL[task.type]

  return (
    <div className={`row${task.completed ? ' row--done' : ''}${overdue ? ' row--overdue' : ''}`}>
      <div className="row-check">
        {isReading ? (
          <span className="row-icon" aria-hidden="true">
            {task.completed ? '✓' : '☐'}
          </span>
        ) : (
          <input
            type="checkbox"
            checked={!!task.completed}
            onChange={() => onToggleComplete(task.id)}
            aria-label={`Mark "${task.desc}" complete`}
          />
        )}
      </div>

      <div className="row-main">
        <div className="row-desc">
          {task.desc}
          {typeLabel && <span className="pill pill--type">{typeLabel}</span>}
        </div>
        {showCourse && <div className="row-course">{task.course}</div>}
      </div>

      {mode === 'due' && (
        <>
          <div className="row-meta row-meta--due">{formatShort(task.due)}</div>
          <div className="row-meta row-meta--pages">{task.pages || '—'}</div>
        </>
      )}

      {mode === 'review' && (
        <>
          <div className="row-meta">Pass {task.pass}</div>
          <div className="row-meta row-meta--due">
            reviewed {task.last_review ? formatShort(task.last_review) : 'never'}
          </div>
        </>
      )}

      <div className="row-action">
        {isReading && !task.completed && mode === 'due' && (
          <button className="btn btn--ghost" onClick={() => onMarkRead(task.id)}>
            Mark Read
          </button>
        )}
        {mode === 'review' && (
          <button className="btn btn--ghost" onClick={() => onMarkRead(task.id)}>
            Mark Reviewed
          </button>
        )}
      </div>
    </div>
  )
}
