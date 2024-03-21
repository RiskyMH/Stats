import { load } from "cheerio"
import db from "../drizzle"
import schema from "@stats-compare/db"
import { sql } from "drizzle-orm/sql"
import { chunkArray } from "../tools"

const populationUrl = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population"
const sizeUrl = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_area"

export async function getCountryPopulation() {
    const html = await fetch(populationUrl).then((res) => res.text())
    const $ = load(html)

    const table = $(".wikitable")
    const rows = table.find("tr")

    const countries = [] as { name: string; population: number, date: Date, image?: string }[]

    for (const row of rows) {
        const cells = $(row).find('td')

        // because if its a 1/2 it means the one above only has it
        const prev = $(row).prev().find('td')
        const baseIndex = prev.eq(0).text().trim().includes("1/2") ? -1 : 0

        const country = {
            _: cells.eq(baseIndex + 0).text().trim(),
            name: cells.eq(baseIndex + 1).text().trim().replace("[disputed  – discuss] ", ''),
            population: parseInt(cells.eq(baseIndex + 2).text().replace(/,/g, "")),
            populationn: (cells.eq(baseIndex + 2).text()),
            "%world": cells.eq(baseIndex + 3).text(),
            date: new Date(cells.eq(baseIndex + 4).text().trim()),
            source: cells.eq(baseIndex + 5).text(),
            image: cells.eq(baseIndex + 1).find('img').attr('src')
        }
        if (country.image?.endsWith(".svg.png")) {
            // un-optimize to get the svg
            country.image = country.image
                .replace("thumb/", "")
                .replace(/\/\d+px-.+\.svg\.png/, "")
                .replace("//", "https://")
        }

        if (country.name && country.population) {
            countries.push({ ...country })
        }
    }

    return countries
}

export async function getCountryArea() {
    const html = await fetch(sizeUrl).then((res) => res.text())
    const $ = load(html)

    const table = $(".wikitable")
    const rows = table.find("tr")

    const countries = [] as { name: string; area: number, image?: string }[]
    // because if its a 1/3 it means the one above only has it

    for (const row of rows) {
        const cells = $(row).find('td')

        const prev = $(row).prev().find('td')
        const baseIndex = prev.eq(0).text().trim().includes("3/4") ? -1 : 0

        const countryName = cells.eq(baseIndex + 1).text().trim()

        const country = {
            name: countryName === "Earth" ? "World" : countryName,
            area: parseInt(cells.eq(baseIndex + 2).text().replace(/,/g, "").replace(/\s\(.*\)/, "").trim()),
        }

        if (country.name && country.area) {
            countries.push({ ...country })
        }
    }

    return countries
}


async function getCountries() {
    const population = await getCountryPopulation()
    const area = await getCountryArea()

    const countries = new Map<string, { population: number, populationSyncedDate: Date, image?: string, area: number }>()

    for (const country of population) {
        countries.set(country.name, { population: country.population, populationSyncedDate: country.date, image: country.image, area: 0 })
    }

    for (const country of area) {
        const c = countries.get(country.name)
        if (c) {
            c.area = country.area
            countries.set(country.name, c)
        } else {
            countries.set(country.name, { area: country.area, population: 0, populationSyncedDate: new Date() })
        }
    }

    return Array.from(countries).map(([name, data]) => ({ name, ...data }))
}

const countries = await getCountries()

await db.insert(schema.Country)
    .values(chunkArray(countries, 50)[0].map(e => ({
        country: e.name,
        population: e.population,
        populationUpdatedAt: e.populationSyncedDate,
        area: e.area,
        image: e.image
    })))
    .onConflictDoUpdate({
        target: schema.Country.country,
        set: {
            population: sql`excluded.population`,
            populationUpdatedAt: sql`excluded.population_updated_at`,
            area: sql`excluded.area`,
            image: sql`excluded.image`
        }
    })


console.log(`Synced ${countries.length} countries from wikipedia`)