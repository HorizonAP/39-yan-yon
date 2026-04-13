import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ScanLine, ArrowDownToLine, ArrowUpFromLine, PackageSearch } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog'
import { toast } from 'sonner'

export default function BarcodeScanner() {
  const [barcode, setBarcode] = useState('')
  const [scannedBarcode, setScannedBarcode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Modal states
  const [openAction, setOpenAction] = useState<'in' | 'out' | null>(null)
  const [qty, setQty] = useState(1)
  const [reason, setReason] = useState('')

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus()
  }, [])

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['product', scannedBarcode],
    queryFn: () => api.getProductByBarcode(scannedBarcode),
    enabled: !!scannedBarcode,
    retry: false
  })

  const stockInMutation = useMutation({
    mutationFn: () => api.stockIn(product!.id, qty, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', scannedBarcode] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['recentHistory'] })
      queryClient.invalidateQueries({ queryKey: ['lowStock'] })
      toast.success(`Successfully added ${qty} to ${product!.name}`)
      closeModal()
      inputRef.current?.focus()
    },
    onError: (err: any) => {
      toast.error('Failed to stock in', { description: err.message })
    }
  })

  const stockOutMutation = useMutation({
    mutationFn: () => api.stockOut(product!.id, qty, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', scannedBarcode] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['recentHistory'] })
      queryClient.invalidateQueries({ queryKey: ['lowStock'] })
      toast.success(`Successfully dispensed ${qty} from ${product!.name}`)
      closeModal()
      inputRef.current?.focus()
    },
    onError: (err: any) => {
      toast.error('Failed to stock out', { description: err.message })
    }
  })

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode.trim()) return
    setScannedBarcode(barcode.trim())
    setBarcode('')
  }

  const handleAction = (action: 'in' | 'out') => {
    setQty(1)
    setReason('')
    setOpenAction(action)
  }

  const closeModal = () => {
    setOpenAction(null)
  }

  const confirmAction = () => {
    if (openAction === 'in') {
      stockInMutation.mutate()
    } else if (openAction === 'out') {
      stockOutMutation.mutate()
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mt-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
          <ScanLine className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Barcode Scanner</h2>
        <p className="text-muted-foreground">Scan an item to update inventory</p>
      </div>

      <Card className="bg-card/60 backdrop-blur-xl border-primary/20 shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardContent className="pt-6">
          <form onSubmit={handleScan} className="flex gap-2">
            <Input 
              ref={inputRef}
              placeholder="Aim scanner or type barcode + Enter" 
              className="text-lg bg-background/50 h-14"
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              autoFocus
            />
            <Button type="submit" size="lg" className="h-14 px-8">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground animate-pulse">
          Searching database...
        </div>
      )}

      {scannedBarcode && !isLoading && !product && (
        <Card className="border-destructive/50 bg-destructive/10 animate-in slide-in-from-bottom-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <PackageSearch className="w-12 h-12 text-destructive mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-destructive">Product Not Found</h3>
            <p className="text-muted-foreground mt-2">No item found for barcode <span className="font-mono bg-background p-1 rounded text-foreground">{scannedBarcode}</span></p>
            <Button variant="outline" className="mt-6">Add New Product</Button>
          </CardContent>
        </Card>
      )}

      {product && (
        <Card className="animate-in slide-in-from-bottom-4 shadow-lg border-primary/10 bg-card/40 backdrop-blur">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="font-mono">{product.barcode}</Badge>
                  {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
                  {product.location && <Badge variant="outline" className="border-dashed">Loc: {product.location}</Badge>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Current Stock</div>
                <div className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {product.quantity}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="grid grid-cols-2 gap-4 mt-4">
            <Button 
              size="lg" 
              variant="default"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-16 text-lg"
              onClick={() => handleAction('in')}
            >
              <ArrowDownToLine className="mr-2 h-6 w-6" /> Stock In
            </Button>
            <Button 
              size="lg" 
              variant="destructive"
              className="w-full h-16 text-lg"
              onClick={() => handleAction('out')}
            >
              <ArrowUpFromLine className="mr-2 h-6 w-6" /> Stock Out
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={!!openAction} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {openAction === 'in' ? 'Stock In' : 'Stock Out'} - {product?.name}
            </DialogTitle>
            <DialogDescription>
              {openAction === 'in' ? 'Add items to inventory.' : 'Dispense items from inventory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="qty" className="text-sm font-medium">Quantity</label>
              <Input
                id="qty"
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                className="text-lg"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-medium">Reason / Note (Optional)</label>
              <Input
                id="reason"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={openAction === 'in' ? 'e.g., Supplier Delivery' : 'e.g., Repair Job #123'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button 
              disabled={qty <= 0 || stockInMutation.isPending || stockOutMutation.isPending} 
              onClick={confirmAction}
              className={openAction === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={openAction === 'out' ? 'destructive' : 'default'}
            >
              {stockInMutation.isPending || stockOutMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
