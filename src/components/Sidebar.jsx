function initials(course) {
  return course
    .split(' ')
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export default function Sidebar({ view, onNavigate, courses, courseStats, reviewCount, onReset, collapsed, onToggleCollapse }) {
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

      <button className="reset-link" onClick={onReset} title="Reset progress">
        {collapsed ? '↺' : 'Reset progress'}
      </button>
    </nav>
  )
}
