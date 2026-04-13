import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

// ── Stock status badge ─────────────────────────────────────────────────────
function AvailabilityBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0)      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,110,132,0.18)] text-[#ff6e84] border border-[rgba(255,110,132,0.30)]">CRITICAL</span>
  if (qty <= min)     return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.18)] text-[#f59e0b] border border-[rgba(245,158,11,0.30)]">LOW STOCK</span>
  return               <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.18)] text-[#10b981] border border-[rgba(16,185,129,0.30)]">HEALTHY</span>
}

export default function Products() {
  const [search, setSearch] = useState('')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts()
  })

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-7 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f8f5fd]">
            Product Inventory
            <span className="ml-3 text-lg font-mono text-[#acaab1]">/ {products?.length ?? 0} Products</span>
          </h1>
          <p className="text-[#acaab1] text-sm mt-1">Manage your motorcycle component fleet with precision.</p>
        </div>
        <Button className="gap-2 text-[#0e0e13] font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #6063ee, #a3a6ff)' }}>
          <Plus size={15} /> Add New Product
        </Button>
      </div>

      {/* Search bar */}
      <div className="glass-card-subtle flex items-center gap-3 px-4 py-3">
        <Search size={15} className="text-[#76747b] flex-shrink-0" />
        <Input
          type="search"
          placeholder="Filter by part name, SKU, or barcode..."
          className="border-0 bg-transparent focus-visible:ring-0 text-[#f8f5fd] placeholder:text-[#76747b] text-sm p-0 h-auto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="flex items-center gap-1.5 text-xs text-[#acaab1] hover:text-[#f8f5fd] transition-colors ml-auto flex-shrink-0">
          <SlidersHorizontal size={13} /> Filters
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(72,71,77,0.30)]">
              {['BARCODE', 'PRODUCT DETAILS', 'BRAND', 'COST', 'PRICE', 'STOCK', 'AVAILABILITY', 'LOCATION'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-[#76747b] tracking-wider px-5 py-3 first:rounded-tl-xl">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="py-16 text-center text-[#acaab1]">Loading products...</td></tr>
            ) : (filtered ?? []).length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-[rgba(163,166,255,0.10)] flex items-center justify-center">
                    <Search size={20} className="text-[#a3a6ff] opacity-50" />
                  </div>
                  <p className="text-[#acaab1]">No products found</p>
                  <p className="text-xs text-[#76747b]">Try adjusting your search</p>
                </div>
              </td></tr>
            ) : (
              (filtered as any[]).map((p) => (
                <tr key={p.id} className="border-b border-[rgba(72,71,77,0.18)] last:border-0 hover:bg-[rgba(163,166,255,0.04)] transition-colors group">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs px-2 py-1 rounded bg-[rgba(163,166,255,0.10)] text-[#a3a6ff]">{p.barcode}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-[#f8f5fd]">{p.name}</td>
                  <td className="px-5 py-3 text-xs text-[#acaab1]">{p.brand || '—'}</td>
                  <td className="px-5 py-3 text-[#acaab1] text-sm">฿{p.cost_price}</td>
                  <td className="px-5 py-3 text-[#f8f5fd] font-medium">฿{p.sell_price}</td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-bold ${p.quantity === 0 ? 'text-[#ff6e84]' : p.quantity <= p.min_stock ? 'text-[#f59e0b]' : 'text-[#10b981]'}`}>
                      {p.quantity}
                    </span>
                    <span className="text-[#76747b] text-xs ml-1">/ {p.min_stock} min</span>
                  </td>
                  <td className="px-5 py-3"><AvailabilityBadge qty={p.quantity} min={p.min_stock} /></td>
                  <td className="px-5 py-3 text-xs text-[#acaab1]">{p.location || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination hint */}
        {(filtered ?? []).length > 0 && (
          <div className="px-5 py-3 border-t border-[rgba(72,71,77,0.20)] flex items-center justify-between">
            <p className="text-xs text-[#76747b]">
              Showing <span className="text-[#acaab1] font-medium">{filtered?.length}</span> of{' '}
              <span className="text-[#acaab1] font-medium">{products?.length}</span> products
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
