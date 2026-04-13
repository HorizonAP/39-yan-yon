import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog'
import { toast } from 'sonner'
import { ScanLine, PackageSearch, CheckCircle2, MinusCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

// local scan history (session-only)
interface ScanEntry {
  id: string
  type: 'stock_in' | 'stock_out'
  name: string
  barcode: string
  qty: number
  ts: number
}

export default function BarcodeScanner() {
  const [barcode, setBarcode]         = useState('')
  const [scannedBarcode, setScanned]  = useState('')
  const [openAction, setOpenAction]   = useState<'in' | 'out' | null>(null)
  const [qty, setQty]                 = useState(1)
  const [reason, setReason]           = useState('')
  const [scanLog, setScanLog]         = useState<ScanEntry[]>([])

  const inputRef    = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => { inputRef.current?.focus() }, [])

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', scannedBarcode],
    queryFn:  () => api.getProductByBarcode(scannedBarcode),
    enabled:  !!scannedBarcode,
    retry:    false
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['product', scannedBarcode] })
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    queryClient.invalidateQueries({ queryKey: ['recentHistory'] })
    queryClient.invalidateQueries({ queryKey: ['lowStock'] })
  }

  const stockInMutation = useMutation({
    mutationFn: () => api.stockIn(product!.id, qty, reason),
    onSuccess: () => {
      addToLog('stock_in')
      invalidateAll()
      toast.success(`Added ${qty} × ${product!.name}`)
      closeModal()
    },
    onError: (err: any) => toast.error('Stock In failed', { description: err.message })
  })

  const stockOutMutation = useMutation({
    mutationFn: () => api.stockOut(product!.id, qty, reason),
    onSuccess: () => {
      addToLog('stock_out')
      invalidateAll()
      toast.success(`Dispensed ${qty} × ${product!.name}`)
      closeModal()
    },
    onError: (err: any) => toast.error('Stock Out failed', { description: err.message })
  })

  const addToLog = (type: 'stock_in' | 'stock_out') => {
    setScanLog(prev => [{
      id:      crypto.randomUUID(),
      type,
      name:    product!.name,
      barcode: product!.barcode,
      qty,
      ts:      Date.now()
    }, ...prev.slice(0, 7)])
  }

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode.trim()) return
    setScanned(barcode.trim())
    setBarcode('')
  }

  const handleAction = (action: 'in' | 'out') => {
    setQty(1); setReason(''); setOpenAction(action)
  }

  const closeModal = () => {
    setOpenAction(null)
    inputRef.current?.focus()
  }

  const isPending = stockInMutation.isPending || stockOutMutation.isPending

  return (
    <div className="p-7 h-full flex gap-6">
      {/* ── Left — Scanner ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-5 max-w-[640px]">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#f8f5fd]">
            Inventory <span className="gradient-text">Scanner</span>
          </h1>
          <p className="text-[#acaab1] text-sm mt-1">
            Process incoming stock or fulfill orders by scanning the unique part identifier.
          </p>
        </div>

        {/* Scan input */}
        <div className="glass-card p-5">
          <p className="text-[10px] font-semibold text-[#a3a6ff] tracking-widest mb-3">READY TO SCAN</p>
          <form onSubmit={handleScan} className="flex gap-2">
            <div className="relative flex-1">
              <ScanLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a6ff]" />
              <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Aim scanner or type barcode..."
                className="w-full pl-9 pr-4 py-3 rounded-lg bg-[rgba(0,0,0,0.40)] border border-[rgba(72,71,77,0.30)] text-[#f8f5fd] placeholder:text-[#76747b] text-sm focus:outline-none focus:border-[#a3a6ff] focus:ring-2 focus:ring-[rgba(163,166,255,0.15)] transition-all font-mono"
              />
            </div>
            <Button type="submit" className="text-[#0e0e13] font-semibold" style={{ background: 'linear-gradient(135deg, #6063ee, #a3a6ff)' }}>
              Search
            </Button>
          </form>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="glass-card-subtle p-5 text-center text-[#acaab1] animate-pulse text-sm">
            Searching database...
          </div>
        )}

        {/* Not found */}
        {scannedBarcode && !isLoading && !product && (
          <div className="glass-card p-8 flex flex-col items-center text-center gap-3 border border-[rgba(255,110,132,0.25)]">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(255,110,132,0.10)] flex items-center justify-center">
              <PackageSearch size={24} className="text-[#ff6e84] opacity-60" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#ff6e84]">Product Not Found</p>
              <p className="text-sm text-[#acaab1] mt-1">
                No item found for barcode{' '}
                <span className="font-mono bg-[rgba(255,110,132,0.10)] px-2 py-0.5 rounded text-[#f8f5fd]">
                  {scannedBarcode}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Product found */}
        {product && (
          <div className="glass-card border border-[rgba(163,166,255,0.25)]">
            {/* Product info */}
            <div className="p-5 flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-[rgba(163,166,255,0.08)] flex items-center justify-center flex-shrink-0">
                <PackageSearch size={28} className="text-[#a3a6ff] opacity-50" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-[#76747b] tracking-widest">PRODUCT IDENTITY</p>
                <p className="text-xl font-bold text-[#f8f5fd] mt-1">{product.name}</p>
                <p className="font-mono text-xs text-[#a3a6ff] mt-0.5">{product.barcode}</p>
                {product.brand && <p className="text-xs text-[#acaab1] mt-0.5">{product.brand}</p>}
              </div>

              {/* Stock */}
              <div className="text-right">
                <p className="text-[10px] font-semibold text-[#76747b] tracking-widest">CURRENT AVAILABILITY</p>
                <p className="text-4xl font-bold text-[#a3a6ff] mt-1">{product.quantity}</p>
                <p className="text-xs text-[#76747b]">Units in Stock</p>
                {/* mini progress */}
                <div className="mt-2 h-1 w-24 ml-auto rounded-full bg-[rgba(72,71,77,0.40)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (product.quantity / Math.max((product as any).min_stock ?? 10, 1)) * 100)}%`,
                      background: 'linear-gradient(90deg, #6063ee, #a3a6ff)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => handleAction('in')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-[#f8f5fd] border border-[rgba(16,185,129,0.40)] bg-[rgba(16,185,129,0.12)] hover:bg-[rgba(16,185,129,0.20)] transition-all"
              >
                <CheckCircle2 size={16} className="text-[#10b981]" /> STOCK IN
              </button>
              <button
                onClick={() => handleAction('out')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-[#f8f5fd] border border-[rgba(244,63,94,0.40)] bg-[rgba(244,63,94,0.12)] hover:bg-[rgba(244,63,94,0.20)] transition-all"
              >
                <MinusCircle size={16} className="text-[#f43f5e]" /> STOCK OUT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right — Scan History ─────────────────────────────────── */}
      <div className="w-[310px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#f8f5fd]">Scan History</h2>
          {scanLog.length > 0 && (
            <button onClick={() => setScanLog([])} className="text-xs text-[#76747b] hover:text-[#f8f5fd] transition-colors">
              Clear All
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          {scanLog.length === 0 ? (
            <div className="glass-card-subtle p-6 text-center">
              <Clock size={20} className="text-[#76747b] mx-auto mb-2 opacity-40" />
              <p className="text-xs text-[#76747b]">No scans yet this session</p>
            </div>
          ) : (
            scanLog.map(entry => (
              <div key={entry.id} className={`glass-card-subtle p-3.5 border ${entry.type === 'stock_in' ? 'border-[rgba(16,185,129,0.25)]' : 'border-[rgba(244,63,94,0.25)]'}`}>
                <div className="flex items-center justify-between mb-1">
                  {entry.type === 'stock_in' ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.30)]">STOCK IN</span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(244,63,94,0.15)] text-[#f43f5e] border border-[rgba(244,63,94,0.30)]">STOCK OUT</span>
                  )}
                  <span className="text-[10px] text-[#76747b]">{format(new Date(entry.ts), 'HH:mm')}</span>
                </div>
                <p className="text-sm font-semibold text-[#f8f5fd] truncate">{entry.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono text-[10px] text-[#76747b]">{entry.barcode}</span>
                  <span className={`text-sm font-bold ${entry.type === 'stock_in' ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                    {entry.type === 'stock_in' ? '+' : '-'}{entry.qty} Units
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sync indicator */}
        <div className="glass-card-subtle p-3.5 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#f8f5fd]">Local Sync Active</p>
            <p className="text-[11px] text-[#acaab1] mt-0.5">Transactions are being saved to the local database in real-time.</p>
          </div>
        </div>
      </div>

      {/* ── Confirm Dialog ────────────────────────────────────────── */}
      <Dialog open={!!openAction} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md bg-[#1f1f26] border border-[rgba(72,71,77,0.40)] text-[#f8f5fd]">
          <DialogHeader>
            <DialogTitle className="text-[#f8f5fd]">
              {openAction === 'in' ? '✅ Stock In' : '📦 Stock Out'} — {product?.name}
            </DialogTitle>
            <DialogDescription className="text-[#acaab1]">
              {openAction === 'in' ? 'Add items to inventory.' : 'Dispense items from inventory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#acaab1]">Quantity</label>
              <Input
                type="number" min="1" autoFocus
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)] text-[#f8f5fd] text-lg h-12"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-[#acaab1]">Reason / Note <span className="text-[#76747b]">(optional)</span></label>
              <Input
                type="text" value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={openAction === 'in' ? 'e.g., Supplier Delivery' : 'e.g., Repair Job #123'}
                className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)] text-[#f8f5fd]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal} className="text-[#acaab1] hover:text-[#f8f5fd]">Cancel</Button>
            <Button
              disabled={qty <= 0 || isPending}
              onClick={() => openAction === 'in' ? stockInMutation.mutate() : stockOutMutation.mutate()}
              className="text-[#0e0e13] font-semibold"
              style={{ background: openAction === 'in' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #e11d48, #f43f5e)' }}
            >
              {isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
