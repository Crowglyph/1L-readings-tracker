// This app can serve multiple groups from one codebase — each group gets
// its own Vercel project, and each project is told which Google Sheet to
// read from via an environment variable, VITE_SCHEDULE_CSV_URL, set in that
// project's Vercel dashboard (Settings → Environment Variables).
//
// That's the recommended way to configure this — see README.md for the
// full "hosting more than one group" walkthrough.
//
// For quick local testing without setting up an environment variable, you
// can also hardcode a URL as the fallback below.
const LOCAL_FALLBACK_URL = ''

export const SCHEDULE_CSV_URL = import.meta.env.VITE_SCHEDULE_CSV_URL || LOCAL_FALLBACK_URL
