import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type Product } from '../lib/api'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Plus, Search, SlidersHorizontal, PenSquare, Trash2 } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface ProductFormState {
  barcode: string
  name: string
  brand: string
  categoryId: string
  costPrice: string
  sellPrice: string
  quantity: string
  minStock: string
  location: string
}

const initialFormState: ProductFormState = {
  barcode: '',
  name: '',
  brand: '',
  categoryId: '',
  costPrice: '0',
  sellPrice: '0',
  quantity: '0',
  minStock: '5',
  location: '',
}

// ── Stock status badge ─────────────────────────────────────────────────────
function AvailabilityBadge({ qty, min }: { qty: number; min: number }) {
  if (qty === 0)      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(255,110,132,0.18)] text-[#ff6e84] border border-[rgba(255,110,132,0.30)]">CRITICAL</span>
  if (qty <= min)     return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.18)] text-[#f59e0b] border border-[rgba(245,158,11,0.30)]">LOW STOCK</span>
  return               <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.18)] text-[#10b981] border border-[rgba(16,185,129,0.30)]">HEALTHY</span>
}

export default function Products() {
  const [search, setSearch] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [targetDelete, setTargetDelete] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductFormState>(initialFormState)
  const [newCategoryName, setNewCategoryName] = useState('')

  const queryClient = useQueryClient()

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts()
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  })

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    queryClient.invalidateQueries({ queryKey: ['lowStock'] })
  }

  const createProductMutation = useMutation({
    mutationFn: () => api.createProduct({
      barcode: form.barcode.trim(),
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      costPrice: Number(form.costPrice || 0),
      sellPrice: Number(form.sellPrice || 0),
      quantity: Number(form.quantity || 0),
      minStock: Number(form.minStock || 5),
      location: form.location.trim() || null,
    }),
    onSuccess: () => {
      refreshProducts()
      toast.success('Product created')
      closeForm()
    },
    onError: (err: any) => toast.error('Create product failed', { description: err?.message })
  })

  const updateProductMutation = useMutation({
    mutationFn: () => api.updateProduct(editing!.id, {
      barcode: form.barcode.trim(),
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      costPrice: Number(form.costPrice || 0),
      sellPrice: Number(form.sellPrice || 0),
      quantity: Number(form.quantity || 0),
      minStock: Number(form.minStock || 5),
      location: form.location.trim() || null,
    }),
    onSuccess: () => {
      refreshProducts()
      toast.success('Product updated')
      closeForm()
    },
    onError: (err: any) => toast.error('Update product failed', { description: err?.message })
  })

  const deleteProductMutation = useMutation({
    mutationFn: () => api.deleteProduct(targetDelete!.id),
    onSuccess: () => {
      refreshProducts()
      toast.success('Product deleted')
      setOpenDelete(false)
      setTargetDelete(null)
    },
    onError: (err: any) => toast.error('Delete product failed', { description: err?.message })
  })

  const createCategoryMutation = useMutation({
    mutationFn: () => api.createCategory(newCategoryName.trim()),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      setForm((prev) => ({ ...prev, categoryId: String(created.id) }))
      setNewCategoryName('')
      toast.success('Category created')
    },
    onError: (err: any) => toast.error('Create category failed', { description: err?.message })
  })

  const closeForm = () => {
    setOpenForm(false)
    setEditing(null)
    setForm(initialFormState)
    setNewCategoryName('')
  }

  const openCreateForm = () => {
    setEditing(null)
    setForm(initialFormState)
    setOpenForm(true)
  }

  const openEditForm = (product: Product) => {
    setEditing(product)
    setForm({
      barcode: product.barcode,
      name: product.name,
      brand: product.brand ?? '',
      categoryId: product.category_id ? String(product.category_id) : '',
      costPrice: String(product.cost_price),
      sellPrice: String(product.sell_price),
      quantity: String(product.quantity),
      minStock: String(product.min_stock),
      location: product.location ?? '',
    })
    setOpenForm(true)
  }

  const onSubmitForm = (e: FormEvent) => {
    e.preventDefault()
    if (!form.barcode.trim() || !form.name.trim()) {
      toast.error('Barcode and name are required')
      return
    }
    if (editing) {
      updateProductMutation.mutate()
      return
    }
    createProductMutation.mutate()
  }

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const isSaving = createProductMutation.isPending || updateProductMutation.isPending

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
        <Button onClick={openCreateForm} className="gap-2 text-[#0e0e13] font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #6063ee, #a3a6ff)' }}>
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
              {['BARCODE', 'PRODUCT DETAILS', 'BRAND', 'COST', 'PRICE', 'STOCK', 'AVAILABILITY', 'LOCATION', 'ACTIONS'].map(h => (
                <th key={h} className="text-left text-[10px] font-semibold text-[#76747b] tracking-wider px-5 py-3 first:rounded-tl-xl">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="py-16 text-center text-[#acaab1]">Loading products...</td></tr>
            ) : (filtered ?? []).length === 0 ? (
              <tr><td colSpan={9} className="py-16 text-center">
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
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEditForm(p)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#acaab1] hover:text-[#f8f5fd] hover:bg-[rgba(163,166,255,0.12)]"
                      >
                        <PenSquare size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetDelete(p)
                          setOpenDelete(true)
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#ff6e84] hover:bg-[rgba(255,110,132,0.16)]"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
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

      <Dialog open={openForm} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="sm:max-w-xl bg-[#1f1f26] border border-[rgba(72,71,77,0.40)] text-[#f8f5fd]">
          <form onSubmit={onSubmitForm}>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Product Master' : 'Create Product Master'}</DialogTitle>
              <DialogDescription className="text-[#acaab1]">
                Maintain core product data used by stock-in and stock-out workflow.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="space-y-1">
                <label htmlFor="product-barcode" className="text-xs font-medium text-[#acaab1]">
                  Barcode <span className="text-[#ff6e84]">*</span>
                </label>
                <Input
                  id="product-barcode"
                  value={form.barcode}
                  onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))}
                  placeholder="e.g. 8851234567890"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="product-name" className="text-xs font-medium text-[#acaab1]">
                  Product name <span className="text-[#ff6e84]">*</span>
                </label>
                <Input
                  id="product-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. NGK Iridium Spark Plug"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="product-brand" className="text-xs font-medium text-[#acaab1]">
                  Brand <span className="text-[#76747b]">(optional)</span>
                </label>
                <Input
                  id="product-brand"
                  value={form.brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g. NGK"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="product-location" className="text-xs font-medium text-[#acaab1]">
                  Storage location <span className="text-[#76747b]">(optional)</span>
                </label>
                <Input
                  id="product-location"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Rack A2"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label htmlFor="product-category" className="text-xs font-medium text-[#acaab1]">
                  Category <span className="text-[#76747b]">(optional)</span>
                </label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <select
                    id="product-category"
                    value={form.categoryId}
                    onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="h-10 rounded-md bg-[#0a0a0f] border border-[rgba(72,71,77,0.40)] px-3 text-sm text-[#f8f5fd]"
                  >
                    <option value="">No category</option>
                    {(categories ?? []).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    onClick={() => createCategoryMutation.mutate()}
                    className="border-[rgba(72,71,77,0.40)] bg-[#0a0a0f] text-[#acaab1] hover:text-[#f8f5fd]"
                  >
                    + Category
                  </Button>
                </div>
              </div>

              <div className="col-span-2 space-y-1">
                <label htmlFor="new-category-name" className="text-xs font-medium text-[#acaab1]">
                  New category name <span className="text-[#76747b]">(for + Category button)</span>
                </label>
                <Input
                  id="new-category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Engine Oil"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="product-cost-price" className="text-xs font-medium text-[#acaab1]">
                  Cost price <span className="text-[#76747b]">(optional)</span>
                </label>
                <Input
                  id="product-cost-price"
                  type="number"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))}
                  placeholder="0.00"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="product-sell-price" className="text-xs font-medium text-[#acaab1]">
                  Sell price <span className="text-[#76747b]">(optional)</span>
                </label>
                <Input
                  id="product-sell-price"
                  type="number"
                  min="0"
                  value={form.sellPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, sellPrice: e.target.value }))}
                  placeholder="0.00"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="product-quantity" className="text-xs font-medium text-[#acaab1]">
                  Initial quantity <span className="text-[#76747b]">(optional)</span>
                </label>
                <Input
                  id="product-quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="product-min-stock" className="text-xs font-medium text-[#acaab1]">
                  Min stock alert <span className="text-[#76747b]">(optional)</span>
                </label>
                <Input
                  id="product-min-stock"
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) => setForm((prev) => ({ ...prev, minStock: e.target.value }))}
                  placeholder="5"
                  className="bg-[#0a0a0f] border-[rgba(72,71,77,0.40)]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeForm} className="text-[#acaab1] hover:text-[#f8f5fd]">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="text-[#0e0e13] font-semibold"
                style={{ background: 'linear-gradient(135deg, #6063ee, #a3a6ff)' }}
              >
                {isSaving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={(open) => !open && setOpenDelete(false)}>
        <DialogContent className="sm:max-w-md bg-[#1f1f26] border border-[rgba(72,71,77,0.40)] text-[#f8f5fd]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription className="text-[#acaab1]">
              This will permanently delete <span className="font-semibold text-[#f8f5fd]">{targetDelete?.name}</span> from master data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpenDelete(false)} className="text-[#acaab1] hover:text-[#f8f5fd]">
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteProductMutation.isPending}
              onClick={() => deleteProductMutation.mutate()}
            >
              {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
