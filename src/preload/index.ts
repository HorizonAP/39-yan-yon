import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI as toolkitAPI } from '@electron-toolkit/preload'

const inventoryApi = {
  getProducts: () => ipcRenderer.invoke('inventory:getProducts'),
  getProductByBarcode: (barcode: string) => ipcRenderer.invoke('inventory:getProductByBarcode', barcode),
  stockIn: (productId: number, qty: number, reason?: string) => ipcRenderer.invoke('inventory:stockIn', productId, qty, reason),
  stockOut: (productId: number, qty: number, reason?: string) => ipcRenderer.invoke('inventory:stockOut', productId, qty, reason),
  getLowStockProducts: () => ipcRenderer.invoke('inventory:getLowStockProducts'),
  getStockHistory: (limit?: number) => ipcRenderer.invoke('inventory:getStockHistory', limit),
  getDashboardStats: () => ipcRenderer.invoke('inventory:getDashboardStats'),
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', toolkitAPI)
    contextBridge.exposeInMainWorld('api', inventoryApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = toolkitAPI
  // @ts-ignore (define in dts)
  window.api = inventoryApi
}
