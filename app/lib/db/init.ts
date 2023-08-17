import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL || '')
export const db: PostgresJsDatabase = drizzle(queryClient)
