# 1L Readings Docket

A small React + Vite web app version of your Obsidian readings tracker: a
due-date dashboard, a spaced-repetition review queue (pass 1 → 2 → 3), and a
per-course view with progress bars.

All 202 tasks from your vault are baked into `src/data/tasks.json`. Progress
(checkmarks, review passes, last-reviewed dates) is saved to the browser's
`localStorage`, so it's **per-device, not shared** between people — see
"Sharing with your study group" below if you want everyone to see the same
state.

## Run it locally

You'll need [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`).

## Deploy it

### Vercel (easiest)

```bash
npm install -g vercel
vercel
```

Follow the prompts (defaults are fine — Vercel auto-detects Vite). It'll give
you a live URL you can share.

Or without the CLI: push this folder to a GitHub repo, then
[import it on vercel.com](https://vercel.com/new) — no config needed.

### Firebase Hosting

```bash
npm run build
npm install -g firebase-tools
firebase login
firebase init hosting   # choose "dist" as the public directory, single-page app: Yes
firebase deploy
```

## Editing the reading list

Regenerate `src/data/tasks.json` any time your syllabus changes, or edit it
by hand. Each task looks like:

```json
{
  "id": "task-0004",
  "completed": false,
  "desc": "Read R v. Moyer on Canvas",
  "course": "Crim",
  "due": "2026-09-15",
  "pages": "",
  "pass": "0",
  "last_review": "",
  "type": "reading"
}
```

`type` can be `reading`, `essay`, `exercise`, or `examprep`.

## Sharing with your study group

Right now progress lives in each person's browser only — good for a quick
personal-use test, but it means classmates checking things off won't sync
with each other. If that turns out to matter, the natural next step is
swapping the `localStorage` calls in `src/hooks/useTasks.js` for a small
shared backend (Firebase Firestore is a easy fit alongside Firebase
Hosting) so everyone reads and writes the same task list. Happy to build
that out if you want to go that route.
