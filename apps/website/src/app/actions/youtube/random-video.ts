'use server'
import { eq, inArray } from "drizzle-orm"
import db from "@/utils/drizzle";
import schema from "@stats-compare/db";
import { unstable_cache } from "next/cache";

const getVideoIds = unstable_cache(async (group?: string) => {
    const channels = group
        ? (await db
            .select({ channelId: schema.YouTubeChannel.channelId })
            .from(schema.YouTubeChannel)
            .where(eq(schema.YouTubeChannel.group, group))
            .execute()
        ).map(e => e.channelId)
        : null;

    const results = await db.query.YouTubeVideo.findMany({
        columns: {
            videoId: true
        },
        where: channels ? inArray(schema.YouTubeVideo.channelId, channels) : eq(schema.YouTubeVideo.popular, true)
    })
    return results.map(e => e.videoId)
}, undefined, { tags: ['youtube:videos'], revalidate: 60 * 60 * 24 })

export async function getRandomVideos(size = 10, group?: string) {
    const ids = await getVideoIds(group)

    if (ids.length < size) {
        console.warn(`Not enough videos for group ${group}`)
        return []
    }

    const chosenIds: string[] = []
    for (var i = 0; i < size; i++) {
        var idx = Math.floor(Math.random() * ids.length);
        chosenIds.push(ids[idx]);
        ids.splice(idx, 1);
    }

    const vids = await db.query.YouTubeVideo.findMany({
        columns: {
            videoId: true,
            title: true,
            thumbnail: true,
            viewCount: true,
            likeCount: true,
            commentCount: true,
            duration: true,
            publishedAt: true,
            updatedAt: true,
            channelId: true,
        },
        where: inArray(schema.YouTubeVideo.videoId, chosenIds)
    })

    return vids
}