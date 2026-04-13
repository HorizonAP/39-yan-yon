# 39-YanYon Inventory System — Site Vision

## 1. App Vision
A modern, premium desktop inventory management application for motorcycle spare parts shops. Built with Electron + React + TypeScript. Targets local shop managers who need fast barcode-driven stock in/out operations with clear visual reporting.

## 2. Stitch Project
- **Project ID**: `11387067639078753557`
- **URL**: https://stitch.google.com (requires Google sign-in)
- **Design Name**: The Nocturnal Ethereal
- **Device Type**: DESKTOP (2560px canvas)

## 3. Design Principles
- Dark-first: everything optimized for night/dim environments
- Glassmorphism depth over flat design
- Indigo → Violet gradient identity
- Speed-first UX: barcode scan → stock action in < 3 clicks

## 4. Sitemap
- [x] **Dashboard** — `/` — Stock overview, alerts, recent activity
- [x] **Scanner** — `/barcode` — Scan barcode → Stock In/Out
- [x] **Products** — `/products` — Full product catalog with stock levels
- [x] **History** — `/history` — Transaction audit log

## 5. Roadmap (Pending Screens)
- [ ] **Settings** — `/settings` — Google Drive backup config, app preferences
- [ ] **Add Product Modal** — Product creation form overlay
- [ ] **Low Stock Alert Modal** — Detailed restock action flow
- [ ] **Export Report** — PDF/CSV generation screen

## 6. Creative Freedom (Ideas for Future Screens)
- Supplier management page
- Monthly/weekly stock trend charts (Chart.js)
- Barcode label printing page
- Dark/light mode toggle (keep system preference)
- Category management page

## 7. Tech Stack
- Electron 28+ with electron-vite
- React 18 + TypeScript
- shadcn/ui components (Radix UI primitives)
- SQLite via better-sqlite3
- TanStack Query (data fetching)
- Tailwind CSS (utility styling)
- Lucide React (icons)
