import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ReviewQueue from './components/ReviewQueue'
import CourseView from './components/CourseView'
import { useSchedule } from './hooks/useSchedule'
import { useTasks } from './hooks/useTasks'

const COLLAPSE_KEY = '1l-readings-tracker:sidebar-collapsed'
const AUTO_REFRESH_MS = 60 * 60 * 1000 // 1 hour

export default function App() {
  const { schedule, source, lastSynced, loading, error, refresh } = useSchedule()
  const { tasks, markRead, toggleComplete, resetProgress } = useTasks(schedule)
  const [view, setView] = useState({ type: 'dashboard' })
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(COLLAPSE_KEY) === '1')
  // Not read anywhere directly - just something to bump so the app re-renders
  // and re-evaluates "today" for the dashboard's date buckets, even if a tab
  // has been sitting open since yesterday.
  const [, setClockTick] = useState(0)

  useEffect(() => {
    function tick() {
      setClockTick((n) => n + 1)
      refresh()
    }
    const interval = setInterval(tick, AUTO_REFRESH_MS)
    function onVisible() {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const courses = useMemo(() => [...new Set(tasks.map((t) => t.course))].sort(), [tasks])

  const courseStats = useMemo(() => {
    const stats = {}
    for (const c of courses) {
      const list = tasks.filter((t) => t.course === c)
      stats[c] = { total: list.length, done: list.filter((t) => t.completed).length }
    }
    return stats
  }, [tasks, courses])

  const reviewCount = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.type !== 'reading') return false
        const pass = parseInt(t.pass, 10) || 0
        return pass >= 1 && pass < 3
      }).length,
    [tasks],
  )

  function handleReset() {
    if (window.confirm('Reset all progress? This clears every checkmark and review pass on this device.')) {
      resetProgress()
    }
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className={`app${collapsed ? ' app--sidebar-collapsed' : ''}`}>
      <Sidebar
        view={view}
        onNavigate={setView}
        courses={courses}
        courseStats={courseStats}
        reviewCount={reviewCount}
        onReset={handleReset}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        syncSource={source}
        syncLastSynced={lastSynced}
        syncLoading={loading}
        syncError={error}
        onRefresh={refresh}
      />
      <main className="main">
        {view.type === 'dashboard' && (
          <Dashboard tasks={tasks} onMarkRead={markRead} onToggleComplete={toggleComplete} />
        )}
        {view.type === 'review' && <ReviewQueue tasks={tasks} onMarkRead={markRead} />}
        {view.type === 'course' && (
          <CourseView course={view.course} tasks={tasks} onMarkRead={markRead} onToggleComplete={toggleComplete} />
        )}
      </main>
    </div>
  )
}
