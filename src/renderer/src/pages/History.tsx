import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Input } from '../components/ui/input'
import { Download, Search, Archive } from 'lucide-react'
import { format } from 'date-fns'

// ── Type badge ─────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: 'stock_in' | 'stock_out' }) {
  return type === 'stock_in' ? (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.30)] tracking-wide">
      STOCK IN
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(244,63,94,0.15)] text-[#f43f5e] border border-[rgba(244,63,94,0.30)] tracking-wide">
      STOCK OUT
    </span>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <tr>
      <td colSpan={5} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(163,166,255,0.08)] flex items-center justify-center">
            <Archive size={24} className="text-[#a3a6ff] opacity-40" />
          </div>
          <div>
            <p className="text-[#acaab1] font-medium">No records found</p>
            <p className="text-xs text-[#76747b] mt-1">
              {search ? `No transactions matching "${search}"` : 'No transactions have been recorded yet'}
            </p>
          </div>
          {search && (
            <p className="text-xs text-[#a3a6ff] cursor-pointer hover:underline">Clear all filters</p>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const [search, setSearch] = useState('')

  const { data: history, isLoading } = useQuery({
    queryKey: ['fullHistory'],
    queryFn: () => api.getStockHistory(500)
  })

  const filtered = (history ?? []).filter((r: any) =>
    !search ||
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.product_barcode?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase())
  )

  const handleExport = () => {
    if (!filtered.length) return
    const csv = [
      ['Date', 'Type', 'Product', 'Barcode', 'Change', 'Reason'].join(','),
      ...filtered.map((r: any) => [
        format(new Date(r.created_at + 'Z'), 'yyyy-MM-dd HH:mm'),
        r.type,
        `"${r.product_name}"`,
        r.product_barcode,
        (r.type === 'stock_in' ? '+' : '-') + r.change_qty,
        `"${r.reason || ''}"`
      ].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `39-yanyon-history-${format(new Date(), 'yyyyMMdd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f8f5fd]">Transaction History</h1>
          <p className="text-[#acaab1] text-sm mt-1">
            Comprehensive audit log of all inventory movements.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#0e0e13] transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6063ee, #a3a6ff)' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="glass-card-subtle flex items-center gap-3 px-4 py-3">
        <Search size={15} className="text-[#76747b] flex-shrink-0" />
        <Input
          type="search"
          placeholder="Search product name, barcode, or reason..."
          className="border-0 bg-transparent focus-visible:ring-0 text-[#f8f5fd] placeholder:text-[#76747b] text-sm p-0 h-auto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-[#a3a6ff] hover:text-[#f8f5fd] transition-colors ml-auto flex-shrink-0">
            Clear ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(72,71,77,0.30)]">
              {['DATE & TIME', 'TYPE', 'PRODUCT', 'CHANGE', 'REASON'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-[#76747b] tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-16 text-center text-[#acaab1]">Loading history...</td></tr>
            ) : filtered.length === 0 ? (
              <EmptyState search={search} />
            ) : (
              filtered.map((r: any) => (
                <tr key={r.id} className="border-b border-[rgba(72,71,77,0.18)] last:border-0 hover:bg-[rgba(163,166,255,0.04)] transition-colors">
                  <td className="px-5 py-3.5 text-xs text-[#acaab1] whitespace-nowrap">
                    <div>{format(new Date(r.created_at + 'Z'), 'dd MMM yyyy')}</div>
                    <div className="text-[#76747b] mt-0.5">{format(new Date(r.created_at + 'Z'), 'HH:mm')}</div>
                  </td>
                  <td className="px-5 py-3.5"><TypeBadge type={r.type} /></td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-[#f8f5fd]">{r.product_name}</div>
                    <div className="font-mono text-[10px] text-[#76747b] mt-0.5">{r.product_barcode}</div>
                  </td>
                  <td className={`px-5 py-3.5 font-bold text-base ${r.type === 'stock_in' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                    {r.type === 'stock_in' ? '+' : '−'}{r.change_qty}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#acaab1]">{r.reason || <span className="text-[#76747b]">—</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer row count */}
        {filtered.length > 0 && !isLoading && (
          <div className="px-5 py-3 border-t border-[rgba(72,71,77,0.20)]">
            <p className="text-xs text-[#76747b]">
              Showing <span className="text-[#acaab1] font-medium">{filtered.length}</span>{' '}
              {search ? `of ${history?.length}` : ''} entries
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
