import type { Config } from "drizzle-kit";
console.log(process.env.DATABASE_URL);

export default {
    schema: "packages/db/schema.ts",
    out: "./drizzle",
    driver: 'turso',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        authToken: process.env.DATABASE_TOKEN!
    }
} satisfies Config;