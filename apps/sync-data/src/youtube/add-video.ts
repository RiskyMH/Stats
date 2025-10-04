import type { youtube_v3 } from "googleapis";
import { convertDuration, getHighestQualityThumbnail, sliceName } from "../tools.js";
import db from "../drizzle.js";
import schema from "@stats-compare/db"
import { sql } from "drizzle-orm/sql"

import { addChannels } from "./add-channel.js";
import { inArray } from "drizzle-orm";
import { getChannels } from "./youtube-api.js";

export function addVideos(videos: youtube_v3.Schema$Video[]) {
    const data = [];
    for (const video of videos) {
        if (!video?.id || !video.snippet?.title || !video.statistics || !video.snippet.publishedAt || !video.contentDetails?.duration || !video.snippet.channelId) {
            throw new Error("Video not found")
        };

        data.push({
            title: sliceName(video.snippet.title, 255),
            thumbnail: video.snippet.thumbnails && getHighestQualityThumbnail(video.snippet.thumbnails),
            publishedAt: new Date(video.snippet.publishedAt),
            viewCount: parseInt(video.statistics.viewCount || '0'),
            likeCount: parseInt(video.statistics.likeCount || '0'),
            commentCount: video.statistics.commentCount ? parseInt(video.statistics.commentCount || '0') : null,
            duration: convertDuration(video.contentDetails.duration || '0'),
            videoId: video.id,
            channelId: video.snippet.channelId,
            updatedAt: new Date(),
        })
    }

    const insert = () => db.insert(schema.YouTubeVideo)
        .values(data)
        .onConflictDoUpdate({
            target: schema.YouTubeVideo.videoId,
            set: {
                title: sql`excluded.title`,
                thumbnail: sql`excluded.thumbnail`,
                publishedAt: sql`excluded.published_at`,
                viewCount: sql`excluded.view_count`,
                likeCount: sql`excluded.like_count`,
                commentCount: sql`excluded.comment_count`,
                duration: sql`excluded.duration`,
                updatedAt: sql`excluded.updated_at`,
                channelId: sql`excluded.channel_id`
            }
        })
        .execute();

        return insert().catch(async e => {
            const channelIds = videos.map(v => v.snippet?.channelId || '');
            const channels = await db.query.YouTubeChannel.findMany({
                columns: {
                    channelId: true,
                },
                where: inArray(schema.YouTubeChannel.channelId, channelIds)
            });
            const toFetchChannels = channels.map(c => c.channelId).filter(id => !channelIds.includes(id));

            await addChannels(await getChannels(toFetchChannels) || []);
            return insert();
          }
        );
}