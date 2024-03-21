'use server'
import { inArray, eq } from "drizzle-orm"
import db from "@/utils/drizzle";
import schema from "@stats-compare/db";
import { unstable_cache } from "next/cache";

const getChannelIds = unstable_cache(async (group?: string) => {
    const results = await db
        .select({ channelId: schema.YouTubeChannel.channelId })
        .from(schema.YouTubeChannel)
        .where(group ? eq(schema.YouTubeChannel.group, group) : eq(schema.YouTubeChannel.popular, true))
        .execute()

    return results.map(e => e.channelId)
}, undefined, { tags: ['youtube:channels'], revalidate: 60 * 60 * 24 })


export async function getRandomChannels(size = 10, group?: string) {
    const ids = await getChannelIds(group)
    if (ids.length < size) {
        console.warn(`Not enough channels for group ${group}`)
        return []
    }

    const chosenIds: string[] = []
    for (var i = 0; i < size; i++) {
        var idx = Math.floor(Math.random() * ids.length);
        chosenIds.push(ids[idx]);
        ids.splice(idx, 1);
    }

    const channels = await db.query.YouTubeChannel.findMany({
        columns: {
            channelId: true,
            name: true,
            thumbnail: true,
            viewCount: true,
            subscriberCount: true,
            videoCount: true,
            handle: true,
            createdAt: true,
            updatedAt: true,
        },
        where: inArray(schema.YouTubeChannel.channelId, chosenIds)
    })

    return channels
}