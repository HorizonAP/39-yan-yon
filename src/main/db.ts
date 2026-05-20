import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required for Electron inventory operations')
}

export const client = postgres(connectionString)
export const db = drizzle(client, { schema })

async function ensureSchema() {
  await client`
    do $$
    begin
      create type stock_type as enum ('stock_in', 'stock_out');
    exception
      when duplicate_object then null;
    end
    $$;
  `

  await client`
    create table if not exists categories (
      id serial primary key,
      name text not null unique,
      description text,
      created_at timestamptz not null default now()
    )
  `

  await client`
    create table if not exists products (
      id serial primary key,
      barcode text not null unique,
      name text not null,
      brand text,
      category_id integer references categories(id) on delete set null,
      cost_price numeric(10, 2) not null default 0,
      sell_price numeric(10, 2) not null default 0,
      quantity integer not null default 0,
      min_stock integer not null default 5,
      location text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `

  await client`
    create table if not exists stock_history (
      id serial primary key,
      product_id integer not null references products(id) on delete cascade,
      type stock_type not null,
      change_qty integer not null,
      reason text,
      created_at timestamptz not null default now()
    )
  `
}

export async function initDatabase() {
  await client`select 1`
  await ensureSchema()
}

export async function closeDatabase() {
  await client.end({ timeout: 5 })
}