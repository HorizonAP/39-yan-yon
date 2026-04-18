import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import { closeDatabase, initDatabase } from './db'
import { dbOperations } from './database'

function createWindow(): void {
  const icon = join(__dirname, '../../resources/icon.png')
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

function registerInventoryHandlers() {
  ipcMain.handle('inventory:getProducts', () => dbOperations.getProducts())
  ipcMain.handle('inventory:getProductByBarcode', (_event, barcode: string) => dbOperations.getProductByBarcode(barcode))
  ipcMain.handle('inventory:stockIn', (_event, productId: number, qty: number, reason?: string) => dbOperations.stockIn(productId, qty, reason))
  ipcMain.handle('inventory:stockOut', (_event, productId: number, qty: number, reason?: string) => dbOperations.stockOut(productId, qty, reason))
  ipcMain.handle('inventory:getLowStockProducts', () => dbOperations.getLowStockProducts())
  ipcMain.handle('inventory:getStockHistory', (_event, limit?: number) => dbOperations.getStockHistory(limit))
  ipcMain.handle('inventory:getDashboardStats', () => dbOperations.getDashboardStats())
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  await initDatabase()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))
  registerInventoryHandlers()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    void closeDatabase()
    app.quit()
  }
})
