import { ElectronAPI as ToolkitAPI } from '@electron-toolkit/preload'

interface InventoryProduct {
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

interface LowStockProduct {
  id: number
  barcode: string
  name: string
  brand: string | null
  category_name: string | null
  quantity: number
  min_stock: number
  location: string | null
}

interface StockHistoryEntry {
  id: number
  product_id: number
  product_name: string
  product_barcode: string
  type: 'stock_in' | 'stock_out'
  change_qty: number
  reason: string | null
  created_at: string
}

interface InventoryDashboardStats {
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
  todayTransactions: number
}

interface InventoryApi {
  getProducts: () => Promise<InventoryProduct[]>
  getProductByBarcode: (barcode: string) => Promise<InventoryProduct | null>
  stockIn: (productId: number, qty: number, reason?: string) => Promise<{ id: number; quantity: number }>
  stockOut: (productId: number, qty: number, reason?: string) => Promise<{ id: number; quantity: number }>
  getLowStockProducts: () => Promise<LowStockProduct[]>
  getStockHistory: (limit?: number) => Promise<StockHistoryEntry[]>
  getDashboardStats: () => Promise<InventoryDashboardStats>
}

declare global {
  interface Window {
    electron: ToolkitAPI
    api: InventoryApi
  }
}
