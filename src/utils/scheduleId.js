// Every reading needs a stable ID so a person's local progress (checked off,
// review pass, etc.) stays attached to the right row even as the shared
// schedule gets edited elsewhere.
//
// If the sheet has an ID column filled in, we use that — it's the only way
// to rename or reschedule a reading without resetting everyone's progress
// on it. Otherwise we derive one from its content, which is stable as long
// as the course/due date/description don't change.
export function scheduleId(row) {
  if (row.id && String(row.id).trim()) return String(row.id).trim()

  const raw = `${row.course}|${row.due}|${row.desc}`.trim().toLowerCase()
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i)
  }
  return 'r' + (hash >>> 0).toString(36)
}
