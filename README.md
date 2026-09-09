# 1L Readings Docket

A React + Vite version of your Obsidian readings tracker: a due-date list,
a spaced-repetition review queue (pass 1 → 2 → 3), and per-course progress.

## How data is split

This matters, so it's worth being explicit about:

- **The schedule** (what's assigned, to whom, and when) is shared. It comes
  from a Google Sheet you control. Edit the sheet, and everyone using the
  app sees the update — no redeploy.
- **Personal progress** (checked off, review pass count, last reviewed) is
  private to each person's browser (`localStorage`). Nobody's checkmarks
  affect anyone else's, and editing the schedule never marks anything as
  read for anyone.

Without any setup, the app runs fine off a bundled snapshot
(`src/data/tasks.json`) with no live updates — good for trying it out.
The steps below turn on live updates.

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
Open `src/config.js` and paste the link into `SCHEDULE_CSV_URL`.

**4. Deploy.** (See below.) This is the one time you need to redeploy for
a schedule change — after this, editing the sheet is enough.

### Updating the schedule day to day

Just edit the Google Sheet: change a due date, add a row, delete a row.
Everyone's app picks it up automatically the next time they load it (Google
caches published sheets for a few minutes, so it's not instantaneous). There's
also a **"Check for updates"** button in the app's sidebar that fetches
immediately, useful if you want to confirm a change went out.

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

`src/data/tasks.json` is only used when `SCHEDULE_CSV_URL` is empty, or as
an offline fallback if the sheet can't be reached. You generally don't need
to touch it once the live sheet is set up.
