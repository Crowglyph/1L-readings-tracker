import TaskRow from './TaskRow'

export default function ReviewQueue({ tasks, onMarkRead }) {
  const inReview = tasks
    .filter((t) => {
      if (t.type !== 'reading') return false
      const pass = parseInt(t.pass, 10) || 0
      return pass >= 1 && pass < 3
    })
    .sort((a, b) => (a.last_review || '0000-00-00').localeCompare(b.last_review || '0000-00-00'))

  return (
    <div>
      <header className="view-header">
        <p className="eyebrow">Spaced review</p>
        <h1>Review Queue</h1>
      </header>

      {inReview.length === 0 ? (
        <p className="empty">Nothing in review right now.</p>
      ) : (
        <div className="rows">
          {inReview.map((t) => (
            <TaskRow key={t.id} task={t} mode="review" showCourse onMarkRead={onMarkRead} />
          ))}
        </div>
      )}
    </div>
  )
}
