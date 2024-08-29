'use server'
import { eq, inArray } from "drizzle-orm"
import db, { client } from "@/utils/drizzle";
import schema from "@stats-compare/db";
import { unstable_cache } from "next/cache";

const getVideoIds = unstable_cache(async (group?: string) => {
    if (group) {
        const results = await db
            .select({ videoId: schema.YouTubeVideo.videoId })
            .from(schema.YouTubeVideo)
            .innerJoin(
                schema.YouTubeChannel,
                eq(schema.YouTubeVideo.channelId, schema.YouTubeChannel.channelId)
            )
            .where(eq(schema.YouTubeChannel.group, group))
            .execute();

        return results.map(e => e.videoId);
    } else {
        const results = await db
            .select({ videoId: schema.YouTubeVideo.videoId })
            .from(schema.YouTubeVideo)
            .where(eq(schema.YouTubeVideo.popular, true))
            .execute();

        return results.map(e => e.videoId);
    }
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