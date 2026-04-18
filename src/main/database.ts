import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

import { db } from './db'
import { categories, products, stockHistory } from './schema'

export interface InventoryProduct {
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

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

function mapProduct(row: {
  id: number
  barcode: string
  name: string
  brand: string | null
  categoryId: number | null
  categoryName: string | null
  costPrice: string
  sellPrice: string
  quantity: number
  minStock: number
  location: string | null
  createdAt: Date | string
  updatedAt: Date | string
}): InventoryProduct {
  return {
    id: row.id,
    barcode: row.barcode,
    name: row.name,
    brand: row.brand,
    category_id: row.categoryId,
    category_name: row.categoryName,
    cost_price: Number(row.costPrice),
    sell_price: Number(row.sellPrice),
    quantity: row.quantity,
    min_stock: row.minStock,
    location: row.location,
    created_at: toIsoString(row.createdAt),
    updated_at: toIsoString(row.updatedAt),
  }
}

export const dbOperations = {
  async getProducts(): Promise<InventoryProduct[]> {
    const rows = await db
      .select({
        id: products.id,
        barcode: products.barcode,
        name: products.name,
        brand: products.brand,
        categoryId: products.categoryId,
        categoryName: categories.name,
        costPrice: products.costPrice,
        sellPrice: products.sellPrice,
        quantity: products.quantity,
        minStock: products.minStock,
        location: products.location,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(products.name)

    return rows.map(mapProduct)
  },

  async getProductByBarcode(barcode: string): Promise<InventoryProduct | null> {
    const [row] = await db
      .select({
        id: products.id,
        barcode: products.barcode,
        name: products.name,
        brand: products.brand,
        categoryId: products.categoryId,
        categoryName: categories.name,
        costPrice: products.costPrice,
        sellPrice: products.sellPrice,
        quantity: products.quantity,
        minStock: products.minStock,
        location: products.location,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.barcode, barcode))
      .limit(1)

    return row ? mapProduct(row) : null
  },

  async stockIn(productId: number, qty: number, reason?: string) {
    if (qty <= 0) {
      throw new Error('qty must be greater than 0')
    }

    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({
          quantity: sql`${products.quantity} + ${qty}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning({ id: products.id, quantity: products.quantity })

      if (!updated) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      await tx.insert(stockHistory).values({
        productId,
        type: 'stock_in',
        changeQty: qty,
        reason: reason?.trim() || null,
      })

      return updated
    })
  },

  async stockOut(productId: number, qty: number, reason?: string) {
    if (qty <= 0) {
      throw new Error('qty must be greater than 0')
    }

    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({ quantity: products.quantity })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1)

      if (!current) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      if (current.quantity < qty) {
        throw new Error('INSUFFICIENT_STOCK')
      }

      const [updated] = await tx
        .update(products)
        .set({
          quantity: sql`${products.quantity} - ${qty}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning({ id: products.id, quantity: products.quantity })

      await tx.insert(stockHistory).values({
        productId,
        type: 'stock_out',
        changeQty: qty,
        reason: reason?.trim() || null,
      })

      return updated
    })
  },

  async getLowStockProducts(): Promise<LowStockProduct[]> {
    return db
      .select({
        id: products.id,
        barcode: products.barcode,
        name: products.name,
        brand: products.brand,
        category_name: categories.name,
        quantity: products.quantity,
        min_stock: products.minStock,
        location: products.location,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(lte(products.quantity, products.minStock))
      .orderBy(products.quantity, products.name)
  },

  async getStockHistory(limit = 100): Promise<StockHistoryEntry[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 1000)
    const rows = await db
      .select({
        id: stockHistory.id,
        product_id: stockHistory.productId,
        product_name: products.name,
        product_barcode: products.barcode,
        type: stockHistory.type,
        change_qty: stockHistory.changeQty,
        reason: stockHistory.reason,
        created_at: stockHistory.createdAt,
      })
      .from(stockHistory)
      .innerJoin(products, eq(stockHistory.productId, products.id))
      .orderBy(desc(stockHistory.createdAt))
      .limit(safeLimit)

    return rows.map((row) => ({
      ...row,
      created_at: toIsoString(row.created_at),
    }))
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalProducts] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)

    const [totalStockValue] = await db
      .select({ value: sql<number>`coalesce(sum(quantity * cost_price::numeric), 0)` })
      .from(products)

    const [lowStockCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(lte(products.quantity, products.minStock))

    const [todayTransactions] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(stockHistory)
      .where(
        and(
          gte(stockHistory.createdAt, sql`current_date::timestamptz`),
          lte(stockHistory.createdAt, sql`(current_date + interval '1 day')::timestamptz`),
        ),
      )

    return {
      totalProducts: totalProducts?.count ?? 0,
      totalStockValue: Number(totalStockValue?.value ?? 0),
      lowStockCount: lowStockCount?.count ?? 0,
      todayTransactions: todayTransactions?.count ?? 0,
    }
  },
}
