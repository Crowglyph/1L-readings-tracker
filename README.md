# 1L Readings Docket

A React + Vite version of your Obsidian readings tracker: a due-date list,
a spaced-repetition review queue (pass 1 → 2 → 3), per-course progress, and
a month-view calendar tab. Built to serve more than one group from a single
codebase — see "Hosting more than one group" below.

## How data is split

This matters, so it's worth being explicit about:

- **The schedule** (what's assigned, to whom, and when) is shared. It comes
  from a Google Sheet you control. Edit the sheet, and everyone using the
  app sees the update — no redeploy.
- **Personal progress** (checked off, review pass count, last reviewed) is
  private to each person's browser (`localStorage`). Nobody's checkmarks
  affect anyone else's, and editing the schedule never marks anything as
  read for anyone.

Without any setup, the app runs off a small generic example schedule
(`src/data/tasks.json`) with no live updates — good for trying it out.
The steps below turn on live updates from your own Google Sheet.

## Run it locally

You'll need [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Set up the live, editable schedule

**1. Create the Google Sheet.**
Make a new sheet with exactly these column headers in row 1:

| ID (optional) | Course | Description | Due Date | Pages | Type |
|---|---|---|---|---|---|

- `Due Date` should be `YYYY-MM-DD`.
- `Type` is `reading`, `essay`, `exercise`, or `examprep` (defaults to
  `reading` if left blank).
- Leave `ID` blank for new rows — the app derives a stable ID from the
  course/date/description automatically. Only fill in `ID` if you want to
  **rename or reschedule** an existing reading without resetting everyone's
  progress on it (see "A note on editing existing rows" below).

To seed it with your current 202 readings instead of retyping them: open
`1L_Schedule_Import.csv` (delivered alongside this project), then in Google
Sheets go to **File → Import → Upload**, choose the file, and select
"Replace current sheet."

**2. Publish it.**
File → Share → **Publish to web** → pick the specific sheet/tab → format
**Comma-separated values (.csv)** → Publish. Copy the link it gives you.

**3. Point the app at it.**

The URL is set via an environment variable, `VITE_SCHEDULE_CSV_URL`, not a
file in the code — this is what lets one codebase serve multiple groups
(see "Hosting more than one group" below). For local testing you can also
hardcode a fallback in `src/config.js`.

On Vercel: Project → Settings → Environment Variables → add
`VITE_SCHEDULE_CSV_URL` with your published link as the value → redeploy.

**4. Deploy / redeploy.** This is the one time you need to touch Vercel for
a schedule change — after this, editing the sheet is enough.

### Updating the schedule day to day

Just edit the Google Sheet: change a due date, add a row, delete a row.
Everyone's app picks it up automatically the next time they load it (Google
caches published sheets for a few minutes, so it's not instantaneous). There's
also a **"Check for updates"** button in the app's sidebar that fetches
immediately, useful if you want to confirm a change went out. The app also
quietly re-checks on its own once an hour, and any time someone switches
back to a tab that's been open a while.

### A note on editing existing rows

The app tracks progress by ID, and by default an ID is derived from
`course + due date + description`. That means:

- Fixing a typo in a case name, nudging a due date, or splitting a reading
  into two rows will look like a *new* reading to the app — anyone who'd
  already checked off the old version starts fresh on it.
- If you want to correct something without resetting progress, give that
  row an explicit value in the `ID` column first (any short unique string,
  e.g. `contracts-14`), matching what's already there if you're editing a
  row that already had one.

For typo-level fixes this usually doesn't matter. For a genuine schedule
change (reading swapped, date moved), resetting is arguably correct anyway.

## Hosting more than one group

The whole point of the environment-variable setup above is that this same
codebase can run several independent groups, each with its own reading
schedule, without maintaining separate copies of the code:

1. Keep one GitHub repo (this one). Don't fork it per group — a future fix
   or feature then only has to be pushed once and every group's deployment
   picks it up on its own.
2. In Vercel, create a **separate project per group**, all importing from
   the same GitHub repo. Each project gets its own URL.
3. Give each project its own `VITE_SCHEDULE_CSV_URL` environment variable,
   pointing at that group's own Google Sheet.
4. Hand `Reading_Schedule_Template.csv` (delivered alongside this project)
   to each group's volunteer. It's a blank sheet with the right column
   headers and one example row — they fill it in, publish it the same way
   you did, and send you the link to paste into that project's settings.

Volunteers never touch code, GitHub, or Vercel — just a spreadsheet.
Progress is stored per-website in each person's browser, so there's no risk
of one group's checkmarks or reading list crossing into another's.

Before a group's sheet is connected, their deployment shows a small
generic example schedule (`src/data/tasks.json`) rather than your own real
readings, so nobody sees the wrong group's content by mistake.

## Calendar View

A dedicated tab with a real month grid — click Calendar View in the sidebar.
Each day shows the readings due that day as small colored chips (color =
course); click a chip to open a detail panel with the due date, pages,
type, completion status, and review-pass info, plus the same Mark Read /
Mark Reviewed / Mark Done actions available elsewhere in the app. Nothing
shown there is generated commentary — it's exactly the same data as the
rest of the app, just laid out on a calendar. Navigate months with the
‹ Today › controls at the top.

## Deploy it

### Vercel (easiest)

```bash
npm install -g vercel
vercel
```

Or push this folder to a GitHub repo and
[import it on vercel.com](https://vercel.com/new) — no config needed.

### Firebase Hosting

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting   # public directory: "dist", single-page app: Yes
firebase deploy
```

## Editing the bundled fallback

`src/data/tasks.json` is only used when `VITE_SCHEDULE_CSV_URL` isn't set,
or as an offline fallback if the sheet can't be reached. It ships as a
small generic example schedule on purpose — see "Hosting more than one
group" above for why.
