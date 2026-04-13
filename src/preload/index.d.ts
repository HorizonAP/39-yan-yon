import { ElectronAPI as ToolkitAPI } from '@electron-toolkit/preload'

export interface ProductInput {
  barcode: string
  name: string
  brand?: string
  cost_price: number
  sell_price: number
  quantity: number
  min_stock: number
  location?: string
}

export interface ElectronAPI {
  getProducts: () => Promise<any[]>
  getProductByBarcode: (barcode: string) => Promise<any>
  addProduct: (product: ProductInput) => Promise<any>
  updateProduct: (id: number, product: Partial<ProductInput>) => Promise<any>
  stockIn: (productId: number, qty: number, reason?: string) => Promise<boolean>
  stockOut: (productId: number, qty: number, reason?: string) => Promise<boolean>
  getLowStockProducts: () => Promise<any[]>
  getStockHistory: (limit?: number) => Promise<any[]>
  getDashboardStats: () => Promise<any>
}

declare global {
  interface Window {
    electron: ToolkitAPI
    electronAPI: ElectronAPI
  }
}
