function initials(course) {
  return course
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function timeAgo(date) {
  if (!date) return null
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function syncLabel(source, lastSynced, loading, error) {
  if (loading) return 'Syncing…'
  if (source === 'bundled') return 'Built-in schedule'
  if (source === 'live') return `Synced ${timeAgo(lastSynced) || 'just now'}`
  if (source === 'cache') return error ? 'Offline — showing saved copy' : 'Showing saved copy'
  return null
}

export default function Sidebar({
  view,
  onNavigate,
  courses,
  courseStats,
  reviewCount,
  onReset,
  collapsed,
  onToggleCollapse,
  syncSource,
  syncLastSynced,
  syncLoading,
  syncError,
  onRefresh,
}) {
  const label = syncLabel(syncSource, syncLastSynced, syncLoading, syncError)

  return (
    <nav className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="brand">
          <span className="brand-mark">§</span>
          {!collapsed && (
            <div>
              <div className="brand-title">1L Docket</div>
              <div className="brand-sub">Readings & Review</div>
            </div>
          )}
        </div>
        <button
          className="collapse-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <div className="nav-group">
        <button
          className={`nav-item${view.type === 'dashboard' ? ' nav-item--active' : ''}`}
          onClick={() => onNavigate({ type: 'dashboard' })}
          title="Readings List"
        >
          <span className="nav-item-icon">R</span>
          {!collapsed && <span className="nav-item-label">Readings List</span>}
        </button>
        <button
          className={`nav-item${view.type === 'review' ? ' nav-item--active' : ''}`}
          onClick={() => onNavigate({ type: 'review' })}
          title="Review Queue"
        >
          <span className="nav-item-icon">V</span>
          {!collapsed && <span className="nav-item-label">Review Queue</span>}
          {reviewCount > 0 && <span className="nav-badge">{collapsed ? '' : reviewCount}</span>}
        </button>
        <button
          className={`nav-item${view.type === 'calendar' ? ' nav-item--active' : ''}`}
          onClick={() => onNavigate({ type: 'calendar' })}
          title="Calendar View"
        >
          <span className="nav-item-icon">C</span>
          {!collapsed && <span className="nav-item-label">Calendar View</span>}
        </button>
      </div>

      <div className="nav-group">
        {!collapsed && <div className="nav-label">Courses</div>}
        {courses.map((c) => {
          const stat = courseStats[c]
          return (
            <button
              key={c}
              className={`nav-item${view.type === 'course' && view.course === c ? ' nav-item--active' : ''}`}
              onClick={() => onNavigate({ type: 'course', course: c })}
              title={c}
            >
              <span className="nav-item-icon">{initials(c)}</span>
              {!collapsed && (
                <>
                  <span className="nav-item-label">{c}</span>
                  <span className="nav-item-stat">
                    {stat.done}/{stat.total}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>

      <div className="sidebar-bottom">
        {!collapsed && label && (
          <div className={`sync-status${syncSource === 'live' ? ' sync-status--live' : ''}`}>
            <span className="sync-dot" />
            <span>{label}</span>
          </div>
        )}
        <button
          className="sync-refresh"
          onClick={onRefresh}
          disabled={syncLoading}
          title="Check the sheet for updates now"
        >
          {collapsed ? '⟳' : syncLoading ? 'Checking…' : 'Check for updates'}
        </button>
        <button className="reset-link" onClick={onReset} title="Reset progress">
          {collapsed ? '↺' : 'Reset progress'}
        </button>
      </div>
    </nav>
  )
}
