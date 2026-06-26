# Ironman Tracker

🔗 **Live demo:** https://brainiak-inc.github.io/Activity_Tracker/

A web app for tracking Ironman training. It imports workouts from Garmin Connect (CSV) and builds progress analytics using the fitness–fatigue model — overall and per discipline (run, bike, swim). It also includes a discipline calendar where you manually log how well you stuck to your plan.

No backend: all data is stored locally in the browser.

## Features

- Import of Garmin Connect CSV exports (Activities → Export CSV)
- Form metrics: **CTL** (fitness), **ATL** (fatigue), **TSB** (freshness) — overall and per discipline
- Form trend chart
- Discipline tabs: 🏊 swim · 🚴 bike · 🏃 run
- Plan-adherence calendar (a year laid out by weeks): mark days as done / partial / missed, with comments
- Export and import of all data as a single JSON file — to move between devices

## How to use

1. In Garmin Connect: **Activities → Export CSV** (scroll the list to load the period you need).
2. In the app, click **Import CSV** and pick the file.
3. The analytics build automatically; switch between discipline tabs.
4. The burger menu on the left holds the discipline calendar and the export / import / delete controls.

Re-importing a CSV only adds new workouts (duplicates are skipped) and never touches the calendar.

## Analytics

Garmin doesn't include TSS in the CSV, so training load is computed from heart rate:

- **hrTSS** = `hours × (avg HR / threshold)² × 100`
- **CTL** — 42-day exponential average of load (fitness)
- **ATL** — 7-day average (fatigue)
- **TSB** = CTL − ATL (form)

The threshold heart rate (LTHR) is estimated automatically from your runs.

## Stack

- Angular 19 — standalone components, signals
- LESS + BEM
- `localStorage` for persistence
- Custom SVG chart and CSV parser — no third-party libraries

## Running locally

```bash
npm install
npm start          # http://localhost:4200
```

Build:

```bash
npm run build
```

## Deployment

GitHub Pages via `angular-cli-ghpages`:

```bash
ng deploy --base-href=/Activity_Tracker/
```
