// Thin wrapper around window.electronAPI for use with TanStack Query
import { ProductInput } from '../../../preload/index.d'

export const api = {
  getProducts: () => window.electronAPI.getProducts(),
  getProductByBarcode: (barcode: string) => window.electronAPI.getProductByBarcode(barcode),
  addProduct: (product: ProductInput) => window.electronAPI.addProduct(product),
  updateProduct: (id: number, product: Partial<ProductInput>) => window.electronAPI.updateProduct(id, product),
  stockIn: (productId: number, qty: number, reason?: string) => window.electronAPI.stockIn(productId, qty, reason),
  stockOut: (productId: number, qty: number, reason?: string) => window.electronAPI.stockOut(productId, qty, reason),
  getLowStockProducts: () => window.electronAPI.getLowStockProducts(),
  getStockHistory: (limit?: number) => window.electronAPI.getStockHistory(limit),
  getDashboardStats: () => window.electronAPI.getDashboardStats(),
}
