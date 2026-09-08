export default function ProgressBar({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label">
        {done} / {total} · {pct}%
      </span>
    </div>
  )
}
