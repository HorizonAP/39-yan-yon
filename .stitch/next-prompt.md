---
page: settings
---
Settings page for 39-YanYon motorcycle parts inventory app.

**DESIGN SYSTEM (REQUIRED):**
- Dark mode. Base background: #0e0e13 (surface). Sidebar: #131318.
- Cards: glassmorphism — rgba(26,26,46,0.40) backdrop-blur(24px) border rgba(45,47,74,0.50).
- Primary color: #6366f1 → generates #a3a6ff (light) and #6063ee (dim). Gradient: 135deg #6063ee→#a3a6ff.
- Secondary/Violet: #8b5cf6 → generates #ac8aff.
- Font: Inter. Headline weights 600–700. Body 400.
- Roundness: 8px cards, 12px larger containers, full-pill for status badges.
- Status: Stock In = emerald #10b981, Stock Out = rose #f43f5e, Low Stock = #ff6e84, Warning = #f59e0b.
- Text: primary text #f8f5fd (on-surface), muted #acaab1 (on-surface-variant).

**Page Description:**
Settings and configuration page. Sections:
1. Google Drive Backup — toggle enable/disable, last backup time, manual backup button, backup folder path
2. Low Stock Threshold — global default minimum stock level input
3. App Preferences — language (TH/EN), auto-scan mode toggle, notification settings
4. Database — database size, compact/vacuum button, export backup .db file
5. About — app version, license info, github link

Left sidebar with navigation matching other pages (Dashboard, Scanner, Products, History, Settings=active).
