// Paste your published Google Sheet's CSV URL here to let everyone using this
// app pull schedule updates without you redeploying anything.
//
// How to get this URL:
//   1. Open the Google Sheet with your reading schedule (columns: Course,
//      Description, Due Date, Pages, Type — see README.md).
//   2. File → Share → Publish to web.
//   3. Under "Link", choose the specific sheet/tab, and "Comma-separated
//      values (.csv)" as the format.
//   4. Click Publish, copy the link, and paste it below.
//   5. Redeploy once. After that, editing the Sheet is enough — no more
//      redeploys needed. (Google's publish-to-web caches for a few minutes,
//      so changes aren't instant, and there's a manual refresh button in
//      the app's sidebar for testing.)
//
// Leave this empty to run the app entirely from the bundled snapshot in
// src/data/tasks.json (no live updates, but works out of the box).
export const SCHEDULE_CSV_URL = ''
