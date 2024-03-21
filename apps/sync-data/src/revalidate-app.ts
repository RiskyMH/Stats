
if (process.env.REVALIDATE_URL && process.env.REVALIDATE_TOKEN) {
    await fetch(process.env.REVALIDATE_URL!, {
        headers: {
            Authorization: process.env.REVALIDATE_TOKEN!
        }
    })
} else {
    console.warn('REVALIDATE_URL and REVALIDATE_TOKEN are not set, so revalidation will not occur.')
}