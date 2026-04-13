import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Barcode, Package2, History, Cog } from 'lucide-react'
import { Toaster } from './components/ui/sonner'

// Pages
import Dashboard from './pages/Dashboard'
import BarcodeScanner from './pages/BarcodeScanner'
import Products from './pages/Products'
import HistoryPage from './pages/History'

const navItems = [
  { title: 'Dashboard', url: '/',        icon: LayoutDashboard },
  { title: 'Scanner',   url: '/barcode', icon: Barcode },
  { title: 'Products',  url: '/products',icon: Package2 },
  { title: 'History',   url: '/history', icon: History },
]

export default function App() {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <div className="dark flex h-screen w-screen overflow-hidden bg-[#0e0e13] text-[#f8f5fd]">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside className="flex flex-col w-[220px] min-w-[220px] border-r border-[rgba(72,71,77,0.25)] bg-[#131318]">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(163,166,255,0.15)]">
            <Cog size={16} className="text-[#a3a6ff]" />
          </div>
          <div>
            <p className="text-sm font-bold gradient-text leading-none">39-YanYon</p>
            <p className="text-[10px] text-[#acaab1] tracking-widest uppercase mt-0.5">Inventory</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[rgba(72,71,77,0.25)]" />

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navItems.map((item) => {
            const active = location.pathname === item.url
            return (
              <button
                key={item.title}
                onClick={() => navigate(item.url)}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full',
                  active
                    ? 'bg-[rgba(163,166,255,0.12)] text-[#a3a6ff] border-l-2 border-[#a3a6ff] pl-[10px]'
                    : 'text-[#acaab1] hover:bg-[rgba(163,166,255,0.06)] hover:text-[#f8f5fd]',
                ].join(' ')}
              >
                <item.icon size={16} className={active ? 'text-[#a3a6ff]' : 'text-[#76747b]'} />
                {item.title}
              </button>
            )
          })}
        </nav>

        {/* Footer spacer */}
        <div className="px-4 pb-5">
          <div className="rounded-lg bg-[rgba(163,166,255,0.06)] border border-[rgba(72,71,77,0.25)] p-3">
            <p className="text-[11px] text-[#acaab1] font-medium">Motor Parts Admin</p>
            <p className="text-[10px] text-[#76747b] mt-0.5">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#0e0e13]">
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/barcode"  element={<BarcodeScanner />} />
          <Route path="/products" element={<Products />} />
          <Route path="/history"  element={<HistoryPage />} />
        </Routes>
      </main>

      <Toaster theme="dark" />
    </div>
  )
}
