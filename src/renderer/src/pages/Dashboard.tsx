import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight } from 'lucide-react'

import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, accent, badge
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent: string
  badge?: { text: string; color: string }
}) {
  return (
    <div className="glass-card p-5 relative overflow-hidden flex flex-col gap-3">
      {/* top row */}
      <div className="flex items-start justify-between">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl`} style={{ background: `${accent}18` }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${accent}20`, color: accent }}>
            {badge.text}
          </span>
        )}
      </div>
      {/* value */}
      <div>
        <p className="text-[13px] text-[#acaab1]">{label}</p>
        <p className="text-3xl font-bold mt-0.5" style={{ color: accent }}>{value}</p>
        {sub && <p className="text-xs text-[#76747b] mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ── Type badge ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: 'stock_in' | 'stock_out' }) {
  return type === 'stock_in' ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.30)] tracking-wide">IN</span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(244,63,94,0.15)] text-[#f43f5e] border border-[rgba(244,63,94,0.30)] tracking-wide">OUT</span>
  )
}

// ── Stock badge ────────────────────────────────────────────────────────────
function StockBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(255,110,132,0.20)] text-[#ff6e84]">EMPTY</span>
  if (qty <= min) return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.20)] text-[#f59e0b]">LOW</span>
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.20)] text-[#10b981]">OK</span>
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.getDashboardStats()
  })
  const { data: lowStock, isLoading: lowStockLoading } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => api.getLowStockProducts()
  })
  const { data: recentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['recentHistory'],
    queryFn: () => api.getStockHistory(8)
  })

  const totalProducts    = statsLoading ? '—' : stats?.totalProducts ?? 0
  const lowStockCount    = statsLoading ? '—' : stats?.lowStockCount ?? 0
  const todayIn          = statsLoading ? '—' : `+${stats?.todayTransactions ?? 0}`
  const totalValue       = statsLoading ? '—' : `฿${(stats?.totalStockValue ?? 0).toLocaleString()}`

  return (
    <div className="p-7 space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f8f5fd]">Dashboard</h1>
        <p className="text-[#acaab1] text-sm mt-1">Overview of your motorcycle spare parts inventory and recent movement.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Products"    value={totalProducts} icon={Package}       accent="#a3a6ff" />
        <StatCard label="Low Stock Items"   value={lowStockCount} icon={AlertTriangle}  accent="#ff6e84" badge={{ text: 'WARNING', color: '#ff6e84' }} />
        <StatCard label="Stock In Today"    value={todayIn}       icon={TrendingUp}     accent="#10b981" />
        <StatCard label="Total Stock Value" value={totalValue}    icon={TrendingDown}   accent="#f59e0b" />
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-7 gap-5">
        {/* Recent transactions — 4 cols */}
        <div className="col-span-4 glass-card">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-base font-semibold text-[#f8f5fd]">Recent Transactions</h2>
              <p className="text-xs text-[#acaab1] mt-0.5">Latest stock movements</p>
            </div>
            <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-xs text-[#a3a6ff] hover:text-[#f8f5fd] transition-colors">
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          {/* Table */}
          <div className="px-5 pb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(72,71,77,0.30)]">
                  {['DATE', 'TYPE', 'PRODUCT', 'QTY', 'REASON'].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-[#76747b] tracking-wider pb-2 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-[#acaab1] text-sm">Loading...</td></tr>
                ) : (recentHistory ?? []).length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-[#acaab1] text-sm">No recent activity</td></tr>
                ) : (
                  (recentHistory as any[]).map((r) => (
                    <tr key={r.id} className="border-b border-[rgba(72,71,77,0.15)] last:border-0 hover:bg-[rgba(163,166,255,0.04)] transition-colors">
                      <td className="py-3 pr-4 text-xs text-[#acaab1] whitespace-nowrap">
                        {format(new Date(r.created_at + 'Z'), 'MMM d, HH:mm')}
                      </td>
                      <td className="py-3 pr-4"><TypeBadge type={r.type} /></td>
                      <td className="py-3 pr-4 font-medium text-[#f8f5fd] max-w-[160px] truncate">{r.product_name}</td>
                      <td className={`py-3 pr-4 font-bold ${r.type === 'stock_in' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                        {r.type === 'stock_in' ? '+' : '-'}{r.change_qty}
                      </td>
                      <td className="py-3 text-xs text-[#76747b] max-w-[120px] truncate">{r.reason || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alerts — 3 cols */}
        <div className="col-span-3 glass-card flex flex-col">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-base font-semibold text-[#f8f5fd]">Low Stock Alerts</h2>
            <p className="text-xs text-[#acaab1] mt-0.5">Items needing immediate attention</p>
          </div>

          <div className="flex flex-col gap-2 px-4 pb-5 flex-1 overflow-y-auto">
            {lowStockLoading ? (
              <p className="text-sm text-center text-[#acaab1] py-6">Loading...</p>
            ) : (lowStock ?? []).length === 0 ? (
              <p className="text-sm text-center text-[#10b981] py-6">All stocks healthy 🎉</p>
            ) : (
              (lowStock as any[]).map((item) => (
                <div key={item.id} className="rounded-lg border border-[rgba(72,71,77,0.30)] bg-[rgba(19,19,24,0.60)] p-3 flex items-center gap-3">
                  {/* Left accent */}
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${item.quantity === 0 ? 'bg-[#ff6e84]' : 'bg-[#f59e0b]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#f8f5fd] truncate">{item.name}</p>
                      <StockBadge qty={item.quantity} min={item.min_stock} />
                    </div>
                    <p className="text-[11px] text-[#acaab1] mt-0.5 font-mono">{item.barcode}</p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 rounded-full bg-[rgba(72,71,77,0.40)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (item.quantity / Math.max(item.min_stock, 1)) * 100)}%`,
                          background: item.quantity === 0 ? '#ff6e84' : item.quantity <= item.min_stock ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[#76747b] mt-1">{item.quantity} / {item.min_stock} min</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {(lowStock ?? []).length > 0 && (
            <div className="px-4 pb-4">
              <button
                onClick={() => navigate('/barcode')}
                className="w-full py-2 rounded-lg text-xs font-semibold text-[#0e0e13] transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6063ee, #a3a6ff)' }}
              >
                Go to Scanner → Restock
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
