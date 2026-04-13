import Database, { Database as DBType } from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

let db: DBType

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

export function initDatabase() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'yanyon.db')
  
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      brand TEXT,
      cost_price REAL DEFAULT 0,
      sell_price REAL DEFAULT 0,
      quantity INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      location TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      type TEXT CHECK(type IN ('stock_in','stock_out')),
      change_qty INTEGER NOT NULL,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `)
  
  // Seed data if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }
  if (count.count === 0) {
    console.log("Seeding initial data...")
    const stmt = db.prepare(`
      INSERT INTO products (barcode, name, brand, cost_price, sell_price, quantity, min_stock, location)
      VALUES 
      ('1234567890123', 'Motul 3000 Plus 10W40', 'Motul', 150, 200, 2, 5, 'Shelf A1'),
      ('1234567890124', 'NGK Spark Plug CPR6EA-9', 'NGK', 80, 120, 15, 10, 'Shelf A2'),
      ('1234567890125', 'IRC Tire 70/90-17', 'IRC', 350, 450, 0, 4, 'Floor B1'),
      ('1234567890126', 'Honda Brake Pad Front', 'Honda', 120, 180, 8, 5, 'Shelf C1'),
      ('1234567890127', 'Yamaha V-Belt', 'Yamaha', 250, 350, 3, 5, 'Shelf C2')
    `)
    stmt.run()
  }
}

export function getDb(): DBType {
  if (!db) throw new Error("Database not initialized")
  return db
}

export const dbOperations = {
  getProducts: () => {
    return getDb().prepare('SELECT * FROM products ORDER BY name').all()
  },
  
  getProductByBarcode: (barcode: string) => {
    return getDb().prepare('SELECT * FROM products WHERE barcode = ?').get(barcode)
  },
  
  addProduct: (product: ProductInput) => {
    const stmt = getDb().prepare(`
      INSERT INTO products (barcode, name, brand, cost_price, sell_price, quantity, min_stock, location)
      VALUES (@barcode, @name, @brand, @cost_price, @sell_price, @quantity, @min_stock, @location)
    `)
    return stmt.run(product)
  },
  
  updateProduct: (id: number, product: Partial<ProductInput>) => {
    const fields = Object.keys(product)
      .filter(k => product[k as keyof ProductInput] !== undefined)
      .map(k => `${k} = @${k}`)
      .join(', ')
      
    if (!fields) return null
    
    const stmt = getDb().prepare(`
      UPDATE products SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = @id
    `)
    return stmt.run({ ...product, id })
  },
  
  stockIn: (productId: number, qty: number, reason?: string) => {
    const db = getDb()
    const transaction = db.transaction(() => {
      db.prepare('UPDATE products SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(qty, productId)
      db.prepare('INSERT INTO stock_history (product_id, type, change_qty, reason) VALUES (?, ?, ?, ?)')
        .run(productId, 'stock_in', qty, reason || null)
    })
    transaction()
    return true
  },
  
  stockOut: (productId: number, qty: number, reason?: string) => {
    const db = getDb()
    const transaction = db.transaction(() => {
      // Allow negative stock or not? Let's just deduct it. Or throw if not enough.
      const product = db.prepare('SELECT quantity FROM products WHERE id = ?').get(productId) as any
      if (!product || product.quantity < qty) throw new Error("Insufficient stock")
      
      db.prepare('UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(qty, productId)
      db.prepare('INSERT INTO stock_history (product_id, type, change_qty, reason) VALUES (?, ?, ?, ?)')
        .run(productId, 'stock_out', qty, reason || null)
    })
    transaction()
    return true
  },
  
  getLowStockProducts: () => {
    return getDb().prepare('SELECT * FROM products WHERE quantity <= min_stock ORDER BY quantity ASC').all()
  },
  
  getStockHistory: (limit = 100) => {
    return getDb().prepare(`
      SELECT h.*, p.name as product_name, p.barcode as product_barcode
      FROM stock_history h
      JOIN products p ON h.product_id = p.id
      ORDER BY h.created_at DESC
      LIMIT ?
    `).all(limit)
  },
  
  getDashboardStats: () => {
    const db = getDb()
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any
    const totalStockValue = db.prepare('SELECT SUM(quantity * cost_price) as value FROM products').get() as any
    const lowStockCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock').get() as any
    const todayTransactions = db.prepare(`SELECT COUNT(*) as count FROM stock_history WHERE date(created_at) = date('now')`).get() as any
    
    return {
      totalProducts: totalProducts.count,
      totalStockValue: totalStockValue.value || 0,
      lowStockCount: lowStockCount.count,
      todayTransactions: todayTransactions.count
    }
  }
}
