import { pgEnum, pgTable, integer, numeric, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const stockTypeEnum = pgEnum('stock_type', ['stock_in', 'stock_out'])

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  barcode: text('barcode').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand'),
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }).notNull().default('0'),
  sellPrice: numeric('sell_price', { precision: 10, scale: 2 }).notNull().default('0'),
  quantity: integer('quantity').notNull().default(0),
  minStock: integer('min_stock').notNull().default(5),
  location: text('location'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const stockHistory = pgTable('stock_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  type: stockTypeEnum('type').notNull(),
  changeQty: integer('change_qty').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})