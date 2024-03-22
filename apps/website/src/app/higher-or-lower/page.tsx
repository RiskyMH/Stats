/* eslint-disable @next/next/no-img-element */

import ClientHigherOrLowerPage from './page.client'
import { fetchOptions } from './actions'

export const metadata = {
    title: "Higher or Lower",
    robots: {
        index: false
    }
}

export default async function HigherOrLowerPage({ searchParams }: { searchParams: { type?: string, group?: string } }) {
    const fn = fetchOptions.bind(null, {
        type: (searchParams.type as any) || "youtube-video-views",
        group: searchParams.group?.replaceAll("+", " ")
    })
    const initialOptions = await fn()

    return (
        <div className='overflow-x-hidden'>
            {initialOptions.length >= 4 ? (
                <ClientHigherOrLowerPage fetchOptions={fn} initialOptions={initialOptions} />
            ) : (
                <p>Not enough options for this selection...</p>
            )}
        </div>
    )
}
