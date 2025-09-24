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

    const table = $(".wikitable").first()
    const rows = table.find("tr")

    const countries = [] as { name: string; population: number, date: Date, image?: string }[]

    for (const row of rows) {
        const cells = $(row).find('td')

        if (cells.length === 0) continue

        const nameCell = cells.eq(0)
        const countryName = nameCell.find('a').first().text().trim()
        const populationText = cells.eq(1).text().replace(/,/g, "").trim()
        const populationValue = parseInt(populationText)
        const dateText = cells.eq(3).text().trim()

        const country = {
            name: countryName,
            population: Number.isFinite(populationValue) ? populationValue : 0,
            date: new Date(dateText),
            image: nameCell.find('img').attr('src')
        }

        if (country.image?.endsWith(".svg.png")) {
            // un-optimize to get the svg
            country.image = country.image
                .replace("thumb/", "")
                .replace(/\/\d+px-.+\.svg\.png/, "")
                .replace("//", "https://")
        }

        if (country.name && country.population > 0) {
            countries.push(country)
        }
    }

    return countries
}

export async function getCountryArea() {
    const html = await fetch(sizeUrl).then((res) => res.text())
    const $ = load(html)

    const table = $(".wikitable").first()
    const rows = table.find("tr")

    const countries = [] as { name: string; area: number, image?: string }[]

    for (const row of rows) {
        const cells = $(row).find('td')

        if (cells.length === 0) continue
        const hasSharedRank = cells.length === 6

        let countryName: string
        let areaText: string

        if (hasSharedRank) {
            const nameCell = cells.eq(0)
            countryName = nameCell.find('a').first().text().trim()
            if (!countryName) {
                const cellClone = nameCell.clone()
                cellClone.find('img').remove()
                countryName = cellClone.text().trim()
                    .replace(/\[.*?\]/g, '')
                    .trim()
            }
            areaText = cells.eq(1).text()
        } else {
            const nameCell = cells.eq(1)
            countryName = nameCell.find('a').first().text().trim()
            if (!countryName) {
                const cellClone = nameCell.clone()
                cellClone.find('img').remove()
                countryName = cellClone.text().trim()
                    .replace(/\[.*?\]/g, '')
                    .trim()
            }
            areaText = cells.eq(2).text()
        }

        areaText = areaText
            .split('(')[0]
            .replace(/,/g, "")
            .trim()
        const areaValue = parseInt(areaText)

        const country = {
            name: countryName === "Earth" ? "World" : countryName,
            area: Number.isFinite(areaValue) ? areaValue : 0,
        }

        if (country.name && country.area > 0) {
            countries.push(country)
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