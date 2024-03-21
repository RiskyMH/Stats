'use server';

import { getRandomChannels } from "../actions/youtube/random-channels";
import { getRandomVideos } from "../actions/youtube/random-video";
import { getRandomCountries } from "../actions/country";
import type { Option } from "./page.client"

interface FetchOptionsProps {
    type: `youtube-video-${'views' | 'likes' | 'comments'}` |
    `youtube-channel-${'views' | 'subs' | 'videos'}` |
    'youtube-random' |
    `country-${'population' | 'area' | 'random'}`;
    group?: string
    size?: number
}

export async function fetchOptions({ type, group, size = 10 }: FetchOptionsProps): Promise<Option[]> {
    if (group === "popular") group = undefined

    if (type.startsWith("youtube-video")) {
        const vids = await getRandomVideos(size, group)
        return vids.map(option => {
            if (!option) throw new Error('No option')
            const [value, valueName] = ({
                "youtube-video-views": [option.viewCount, "views"],
                "youtube-video-likes": [option.likeCount, "likes"],
                "youtube-video-comments": [option.commentCount || 0, "comments"]
            } as Record<string, [number | bigint, string]>)[type] as [number | bigint, string]

            return {
                name: option.title,
                value,
                valueName,
                image: option.thumbnail,
                link: `https://www.youtube.com/watch?v=${option.videoId}`,
                lastModified: option.updatedAt,
                // higherButton: "More views",
                // lowerButton: "Less views"
            } satisfies Option
        })
    } else if (type.startsWith("youtube-channel")) {
        const channels = await getRandomChannels(10, group)
        return channels.map(option => {
            if (!option) throw new Error('No option')
            const [value, valueName] = ({
                "youtube-channel-views": [option.viewCount, "views"],
                "youtube-channel-subs": [option.subscriberCount, "subscribers"],
                "youtube-channel-videos": [option.videoCount || 0, "videos"]
            } as Record<string, [number | bigint, string]>)[type] as [number | bigint, string]

            return {
                name: option.name,
                value,
                valueName,
                image: option.thumbnail,
                link: `https://www.youtube.com/channel/${option.channelId}`,
                lastModified: option.updatedAt,
                // higherButton: "More views",
                // lowerButton: "Less views"
            } satisfies Option
        })
    } else if (type === "youtube-random") {
        // choose 10 random out of channel or videos
        // once chosen, choose a subtype of views, etc and update button text too
        const optionChoices = Array.from({ length: 10 }).map(() => Math.random() > 0.25 ? "channel" : "videos")

        const vidsAmount = optionChoices.filter((o => o === "videos")).length
        const channelsAmount = optionChoices.filter((o => o === "channel")).length
        const [vids, channels] = await Promise.all([
            vidsAmount ? getRandomVideos(vidsAmount, group) : [],
            channelsAmount ? await getRandomChannels(channelsAmount, group) : []
        ])

        return optionChoices.map(o => {
            if (o === "videos") {
                const option = vids.pop()
                if (!option) return null

                const subTypeR = Math.floor(Math.random() * 3)

                const [value, valueName] = {
                    0: [option.viewCount, "views"],
                    1: [option.likeCount, "likes"],
                    2: [option.commentCount || 0, "comments"]
                }[subTypeR] as [number, string]

                return {
                    name: option.title,
                    value,
                    valueName,
                    image: option.thumbnail,
                    link: `https://www.youtube.com/watch?v=${option.videoId}`,
                    lastModified: option.updatedAt,
                    higherButton: `More ${valueName}`,
                    lowerButton: `Less ${valueName}`
                } satisfies Option

            } else if (o === "channel") {
                const option = channels.pop()
                if (!option) return null

                const subTypeR = Math.floor(Math.random() * 3)

                const [value, valueName] = {
                    0: [option.viewCount, "views"],
                    1: [option.subscriberCount, "subscribers"],
                    2: [option.videoCount || 0, "videos"]
                }[subTypeR] as [number, string]

                return {
                    name: option.name,
                    value,
                    valueName,
                    image: option.thumbnail,
                    link: `https://www.youtube.com/channel/${option.channelId}`,
                    lastModified: option.updatedAt,
                    higherButton: `More ${valueName}`,
                    lowerButton: `Less ${valueName}`
                } satisfies Option

            }
            throw new Error("??")
        }).filter((a: any) => !!a) as Option[]

    } else if (type.startsWith("country")) {
        const countries = await getRandomCountries(size)
        return countries.map(option => {
            if (!option) throw new Error('No option')

            if (type === "country-random") {
                const randomType = Math.floor(Math.random() * 2)

                const [value, valueName] = {
                    0: [option.population, "population"],
                    1: [option.area, "area (km²)"]
                }[randomType] as [number, string]

                if (value === 0) return null

                return {
                    name: option.country,
                    value,
                    valueName,
                    image: option.image,
                    link: `https://en.wikipedia.org/wiki/${option.country.replace(/ /g, "_")}`,
                    lastModified: randomType === 0 ? option.populationUpdatedAt : undefined,
                    higherButton: `More ${valueName}`,
                    lowerButton: `Less ${valueName}`
                } satisfies Option
            }

            const [value, valueName] = ({
                "country-population": [option.population, "population"],
                "country-area": [option.area, "area (km²)"],
            } as Record<string, [number, string]>)[type] as [number, string]

            if (value === 0) return null

            return {
                name: option.country,
                value,
                valueName,
                image: option.image,
                link: `https://en.wikipedia.org/wiki/${option.country.replace(/ /g, "_")}`,
                lastModified: type === "country-population" ? option.populationUpdatedAt : undefined,
            } satisfies Option
        }).map((a: any) => a).filter((a: any) => !!a) as Option[]
    }

    throw new Error("?")
}