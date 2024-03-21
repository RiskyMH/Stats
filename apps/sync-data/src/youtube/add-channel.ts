import type { youtube_v3 } from "googleapis";
import { getHighestQualityThumbnail, sliceName } from "../tools.js";
import db from "../drizzle.js";
import schema from "@stats-compare/db"
import { sql } from "drizzle-orm/sql"

export async function addChannels(channels: youtube_v3.Schema$Channel[]) {
    const data = [];
    for (const channel of channels) {
        if (!channel?.id || !channel.statistics || !channel.snippet?.title || !channel.snippet.publishedAt || !channel.snippet.customUrl) {
            throw new Error("Channel not found")
        };

        data.push({
            channelId: channel.id,
            createdAt: new Date(channel.snippet.publishedAt),
            name: sliceName(channel.snippet.title, 50),
            videoCount: parseInt(channel.statistics.videoCount || '0'),
            viewCount: parseInt(channel.statistics.viewCount || '0'),
            subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
            handle: channel.snippet.customUrl,
            thumbnail: channel.snippet.thumbnails && getHighestQualityThumbnail(channel.snippet.thumbnails),
            updatedAt: new Date(),
        })
    }

    return db.insert(schema.YouTubeChannel)
        .values(data)
        .onConflictDoUpdate({
            target: schema.YouTubeChannel.channelId,
            set: {
                name: sql`EXCLUDED.name`,
                thumbnail: sql`EXCLUDED.thumbnail`,
                createdAt: sql`EXCLUDED.created_at`,
                viewCount: sql`EXCLUDED.view_count`,
                subscriberCount: sql`EXCLUDED.subscriber_count`,
                videoCount: sql`EXCLUDED.video_count`,
                handle: sql`EXCLUDED.handle`,
                updatedAt: sql`EXCLUDED.updated_at`,
            }
        })
        .execute()
}
