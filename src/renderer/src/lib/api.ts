export interface Product {
  id: number
  barcode: string
  name: string
  brand: string | null
  category_id: number | null
  category_name: string | null
  cost_price: number
  sell_price: number
  quantity: number
  min_stock: number
  location: string | null
  created_at: string
  updated_at: string
}

export interface LowStockProduct {
  id: number
  barcode: string
  name: string
  brand: string | null
  category_name: string | null
  quantity: number
  min_stock: number
  location: string | null
}

export interface StockHistoryEntry {
  id: number
  product_id: number
  product_name: string
  product_barcode: string
  type: 'stock_in' | 'stock_out'
  change_qty: number
  reason: string | null
  created_at: string
}

export interface DashboardStats {
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
  todayTransactions: number
}

function getDesktopApi() {
  if (!window.api) {
    throw new Error('Electron inventory API is unavailable')
  }

  return window.api
}

export const api = {
  getProducts: () => getDesktopApi().getProducts() as Promise<Product[]>,
  getProductByBarcode: async (barcode: string) => {
    const product = await getDesktopApi().getProductByBarcode(barcode)
    if (!product) {
      throw new Error('Product not found')
    }
    return product as Product
  },
  stockIn: (productId: number, qty: number, reason?: string) => getDesktopApi().stockIn(productId, qty, reason),
  stockOut: (productId: number, qty: number, reason?: string) => getDesktopApi().stockOut(productId, qty, reason),
  getLowStockProducts: () => getDesktopApi().getLowStockProducts() as Promise<LowStockProduct[]>,
  getStockHistory: (limit = 100) => getDesktopApi().getStockHistory(limit) as Promise<StockHistoryEntry[]>,
  getDashboardStats: () => getDesktopApi().getDashboardStats() as Promise<DashboardStats>,
}
