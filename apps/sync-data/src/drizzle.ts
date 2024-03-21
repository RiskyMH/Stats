import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client';
import schema from "@stats-compare/db"

if (!process.env.DATABASE_URL || !process.env.DATABASE_TOKEN) {
    throw new Error('DATABASE_URL or DATABASE_TOKEN is not set')
}

// create the connection
const client = createClient({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_TOKEN });

const db = drizzle(client, { schema });

export default db