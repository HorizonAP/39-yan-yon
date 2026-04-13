# Design System Document: The Nocturnal Ethereal – 39-YanYon

## 1. Creative North Star: The Celestial Curator
This design system moves away from the "boxy" utility of standard dashboards and toward a "Celestial Curator" aesthetic. The goal is to create a UI that feels less like a software interface and more like a high-end digital gallery, using **Atmospheric Depth** — glassmorphism and tonal layering to create a sense of infinite space. By rejecting rigid borders in favor of soft, luminous boundaries, we invite the user into a premium, immersive environment where content feels suspended in a low-light, ethereal void.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian and cosmic indigos, designed to reduce eye strain while projecting sophisticated authority.

### Named Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `surface` | `#0e0e13` | Base background |
| `surface-container-low` | `#131318` | Sidebar sections |
| `surface-container` | `#19191f` | Card backgrounds |
| `surface-container-high` | `#1f1f26` | Elevated cards |
| `surface-bright` | `#2b2b33` | Modals/popovers |
| `primary` | `#a3a6ff` | Primary text on dark |
| `primary-dim` | `#6063ee` | Button gradients (start) |
| `primary-container` | `#9396ff` | Active states |
| `primary-fixed-dim` | `#8387ff` | Icons on glass |
| `secondary` | `#ac8aff` | Secondary accent |
| `secondary-container` | `#5516be` | Chips/badges |
| `on-surface` | `#f8f5fd` | Primary text |
| `on-surface-variant` | `#acaab1` | Secondary/muted text |
| `outline` | `#76747b` | Borders (subtle) |
| `outline-variant` | `#48474d` | Ghost borders |
| `error` | `#ff6e84` | Error/destructive |
| `tertiary` | `#ffa5d9` | Tertiary accent |

### Design Rules
- **The "No-Line" Rule**: 1px solid borders are avoided for structural sections. Use color weight transitions instead.
- **Surface Hierarchy**: Level 0 = `surface`, Level 1 = `surface-container-low`, Level 2 = Glass cards (`#1a1a2e` @ 40% with 24px backdrop blur), Level 3 = `surface-bright`.
- **Glassmorphism Specs**: Fill `#1a1a2e` @ 40%, Stroke `#2d2f4a` @ 50%, Backdrop Blur 20–32px.
- **The Glass & Gradient Rule**: Primary CTAs use linear gradient from `primary-dim` (#6063ee) to `primary` (#a3a6ff) at 135°.

---

## 3. Typography: Editorial Authority
Font: **Inter** used at all levels.

| Level | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|------------|----------------|
| `display-lg` | 3.5rem (56px) | 700 | 1.1 | -0.02em |
| `display-md` | 2.25rem (36px) | 700 | 1.2 | -0.01em |
| `heading-lg` | 1.5rem (24px) | 600 | 1.3 | 0em |
| `heading-md` | 1.25rem (20px) | 600 | 1.4 | 0em |
| `title-lg` | 1.125rem (18px) | 600 | 1.4 | 0em |
| `body-lg` | 1rem (16px) | 400 | 1.6 | 0em |
| `body-md` | 0.875rem (14px) | 400 | 1.5 | 0em |
| `body-sm` | 0.75rem (12px) | 400 | 1.4 | 0em |
| `label` | 0.75rem (12px) | 500 | 1 | 0.05em |
| `mono` | 0.8125rem (13px) | 400 | 1.5 | 0em (JetBrains Mono, monospace) |

---

## 4. Elevation & Depth: Tonal Layering (Frosted Obsidian)
- **Flat backgrounds** use surface tokens with no shadows.
- **Glassmorphism cards**: `backdrop-filter: blur(24px)`, `background: rgba(26,26,46,0.40)`, `border: 1px solid rgba(45,47,74,0.50)`.
- **Ambient glow for modals**: `box-shadow: 0 0 40px rgba(163,166,255,0.05), 0 24px 48px rgba(0,0,0,0.5)`.
- **Ghost Border Fallback**: `outline-variant` (#48474d) at 20% opacity — a suggestion, not a hard stop.

---

## 5. Components

### Buttons
- **Primary**: Gradient fill `linear-gradient(135deg, #6063ee, #a3a6ff)`. `border-radius: 8px`. No border.
- **Secondary**: Ghost style. `border: 1px solid rgba(118,116,123,0.30)`. Text in `primary`.
- **Destructive**: Fill `error` (#ff6e84) with `on-error` (#490013) text.

### Status Badges
- **Stock In**: `border: 1px solid #10b981; color: #10b981` (emerald)
- **Stock Out**: `border: 1px solid #f43f5e; color: #f43f5e` (rose)
- **Low Stock**: Background `secondary-container` (#5516be), text `on-secondary-container` (#d9c8ff)
- **OK**: Background `rgba(16,185,129,0.20)`, text `#10b981`
- **Critical**: Background `rgba(255,110,132,0.20)`, text `#ff6e84`

### Cards / Glassmorphism Container
```css
background: rgba(26, 26, 46, 0.40);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border: 1px solid rgba(45, 47, 74, 0.50);
border-radius: 12px;
```

### Input Fields
- Background `surface-container-lowest` (`#000000`)
- Border: `1px solid rgba(72,71,77,0.20)` (outline-variant at 20%)
- On focus: border → `primary` (#a3a6ff) with `box-shadow: 0 0 0 4px rgba(163,166,255,0.15)`

### Navigation Sidebar (250px wide)
- Background: `surface-container-low` (#131318)
- Active item: Background `rgba(163,166,255,0.10)`, left border `3px solid primary`, text `primary-container`
- Hover: Background `rgba(163,166,255,0.05)`

---

## 6. Design System Notes for Stitch Generation (Copy this block into every prompt)

```
DESIGN SYSTEM (REQUIRED):
- Dark mode. Base background: #0e0e13 (surface). Sidebar: #131318.
- Cards: glassmorphism — rgba(26,26,46,0.40) backdrop-blur(24px) border rgba(45,47,74,0.50).
- Primary color: #6366f1 → generates #a3a6ff (light) and #6063ee (dim). Gradient: 135deg #6063ee→#a3a6ff.
- Secondary/Violet: #8b5cf6 → generates #ac8aff.
- Font: Inter. Headline weights 600–700. Body 400.
- Roundness: 8px cards, 12px larger containers, full-pill for status badges.
- Status: Stock In = emerald #10b981, Stock Out = rose #f43f5e, Low Stock = #ff6e84, Warning = #f59e0b.
- Text: primary text #f8f5fd (on-surface), muted #acaab1 (on-surface-variant).
- Icons: #8387ff (primary-fixed-dim) on glass backgrounds.
- No pure white (#ffffff) for text or pure black for shadows.
```

---

## 7. Sitemap (Pages)
- [x] Dashboard — `/` — Main inventory overview
- [x] Scanner — `/barcode` — Barcode scan for stock in/out
- [x] Products — `/products` — Product catalog & management
- [x] History — `/history` — Transaction log

---

## 8. App Identity
- **App Name**: 39-YanYon
- **Icon**: Gear/sprocket (⚙) with indigo-violet gradient
- **Tagline**: Motorcycle Parts Inventory Management
- **Target**: Desktop Electron app (1440px+)
- **Stitch Project ID**: 11387067639078753557
