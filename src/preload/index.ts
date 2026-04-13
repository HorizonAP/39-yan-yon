import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI as toolkitAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getProducts: () => ipcRenderer.invoke('db:get-products'),
  getProductByBarcode: (barcode: string) => ipcRenderer.invoke('db:get-product-by-barcode', barcode),
  addProduct: (product: any) => ipcRenderer.invoke('db:add-product', product),
  updateProduct: (id: number, product: any) => ipcRenderer.invoke('db:update-product', id, product),
  stockIn: (productId: number, qty: number, reason?: string) => ipcRenderer.invoke('db:stock-in', productId, qty, reason),
  stockOut: (productId: number, qty: number, reason?: string) => ipcRenderer.invoke('db:stock-out', productId, qty, reason),
  getLowStockProducts: () => ipcRenderer.invoke('db:get-low-stock'),
  getStockHistory: (limit?: number) => ipcRenderer.invoke('db:get-stock-history', limit),
  getDashboardStats: () => ipcRenderer.invoke('db:get-dashboard-stats'),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', toolkitAPI)
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = toolkitAPI
  // @ts-ignore (define in dts)
  window.electronAPI = api
}
