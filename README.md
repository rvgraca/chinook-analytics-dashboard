# Chinook Analytics Dashboard

A full-stack analytics dashboard built on top of the classic **Chinook** database.

It provides interactive business insights for sales, customers, music catalog performance, geography, and employee support-rep performance using a modern card/chart UI.

## Overview

This project combines:

- **Express.js** API endpoints for analytics queries.
- **SQLite3** as the data source (`db/chinook.db`).
- **Vanilla HTML/CSS/JS** frontend (modularized JS).
- **Chart.js + chartjs-chart-geo** for data visualization.
- **PWA support** (manifest + service worker + offline fallback).

## Main Features

- Multi-section dashboard:
  - Overview
  - Sales
  - Music
  - Customers
  - Geography
  - Employees
- KPI metric cards for quick summaries.
- Interactive charts (line, bar, doughnut, choropleth map).
- Ranked tables with visual progress bars.
- Client-side data caching per section to avoid unnecessary refetches.
- Graph instance state management to prevent duplicate chart creation.
- Responsive sidebar/navigation behavior.

## Progressive Web App (PWA)

The app includes a PWA baseline:

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/offline.html`

Implemented behavior:

- App shell precaching.
- Runtime caching strategies:
  - Navigation: network-first with offline fallback.
  - API: network-first with timeout + cached fallback.
  - Static assets: stale-while-revalidate.
- Service worker update flow with `SKIP_WAITING` + `controllerchange` reload.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES modules)
- **Charts**: Chart.js, chartjs-chart-geo
- **Dev Tooling**: Nodemon

## Project Structure

```text
chinook-analytics-dashboard/
├─ index.js
├─ package.json
├─ db/
│  └─ chinook.db
├─ database/
│  └─ db.js
├─ routes/
│  └─ analytics.js
├─ public/
│  ├─ index.html
│  ├─ offline.html
│  ├─ manifest.webmanifest
│  ├─ sw.js
│  ├─ css/
│  │  └─ main.css
│  ├─ styles/
│  │  └─ globals.css
│  ├─ js/
│  │  ├─ main.js
│  │  └─ modules/
│  │     └─ utils.js
│  ├─ assets/
│  │  ├─ icons/
│  │  ├─ maps/
│  │  └─ vendor/chart/
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run in development mode

```bash
npm run devStart
```

The app runs on:

- `http://localhost:4000`

## API Endpoints

Base path: `/api/analytics`

- `GET /overview`
- `GET /sales`
- `GET /music`
- `GET /customers`
- `GET /geography`
- `GET /employees`

## Notes

- The project serves static frontend assets from `public/`.
- SQL logic is centralized in `routes/analytics.js`.
- Chart rendering and UI interactions are implemented in `public/js/main.js`.
---
