import type { Config } from "drizzle-kit";

export default {
    schema: "packages/db/schema.ts",
    out: "./drizzle",
    driver: 'turso',
    dialect: 'sqlite',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN!
    }
} satisfies Config;