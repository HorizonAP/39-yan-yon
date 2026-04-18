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

export async function initDatabase() {
  await client`select 1`
}

export async function closeDatabase() {
  await client.end({ timeout: 5 })
}