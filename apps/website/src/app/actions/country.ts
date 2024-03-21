'use server'
import { inArray } from "drizzle-orm"
import db from "@/utils/drizzle";
import schema from "@stats-compare/db";
import { unstable_cache } from "next/cache";

const getCountries = unstable_cache(async () => {
    const results = await db
        .select({ country: schema.Country.country })
        .from(schema.Country)
        .execute()

    return results.map(e => e.country)
}, undefined, { tags: ['countries'], revalidate: 60 * 60 * 24 })


export async function getRandomCountries(size = 10) {
    const ids = await getCountries()
    const chosenIds: string[] = []
    for (var i = 0; i < size; i++) {
        var idx = Math.floor(Math.random() * ids.length);
        chosenIds.push(ids[idx]);
        ids.splice(idx, 1);
    }
    const channels = await db.query.Country.findMany({
        columns: {
            country: true,
            image: true,
            population: true,
            populationUpdatedAt: true,
            area: true,
        },
        where: inArray(schema.Country.country, chosenIds)
    })

    return channels
}