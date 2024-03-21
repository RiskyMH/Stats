
// gets all vid playlist from all the channels
// update all of them
// if the last one isn't in db before, go to second page of playlist (and so on)
// after that, sort the db by last updated and update the last 25k videos (but remember the ones from vid playlist)

import { chunkArray } from "../tools.js"
import { getPlaylist, getVideo } from "./youtube-api.js"
import { addVideos } from "./add-video.js";
import { eq, asc } from "drizzle-orm"
import { tokensUsed } from "./youtube-api.js";
import db from "../drizzle.js";
import schema from "@stats-compare/db";
import { youtube_v3 } from "googleapis";

const channels = await db.query.YouTubeChannel.findMany({
    columns: {
        channelId: true,
        name: true
    },
    where: eq(schema.YouTubeChannel.indexNewVideos, true),
})


const videosSynced = new Set<string>()
const vids = [] as youtube_v3.Schema$Video[]

// for (const channel of channels) {
await Promise.all(channels.map(async channel => {
    let nextPageToken: string | null = null;

    const playlistId = channel.channelId.replace('UC', 'UU');

    while (true) {
        const playlist = await getPlaylist(playlistId, nextPageToken || undefined);
        if (!playlist) return;

        nextPageToken = playlist.nextPageToken || null;

        const videos: string[] = playlist.items?.map(item => item?.contentDetails?.videoId || '') || [];

        const videosInfo = await getVideo(videos);

        // check if the last video is in db
        const lastVideo = await db.query.YouTubeVideo.findFirst({
            where: eq(schema.YouTubeVideo.videoId, playlist.items?.at(-1)?.contentDetails?.videoId || ''),
            columns: {
                videoId: true
            }
        }).execute();

        for (const video of videosInfo || []) {
            vids.push(video);
            videosSynced.add(video.id || '');
        }

        if (!nextPageToken || lastVideo) {
            return;
        }
    }
}));

console.log(`Fetched ${channels.length} channels last videos (including ${vids.length} videos)`)

// get all other videos
const videos = await db.query.YouTubeVideo.findMany({
    columns: {
        videoId: true,
    },
    orderBy: asc(schema.YouTubeVideo.updatedAt),
    limit: 25_000,
})

const videosList = videos.map(video => video.videoId)
    .filter(video => !videosSynced.has(video));

const chunkedVideos = chunkArray(videosList, 50);

await Promise.all(chunkedVideos.map(async (chunk, index) => {
    const result = await getVideo(chunk);
    if (result) vids.push(...result)
}));
console.log(`Fetched ${videosList.length} videos (${chunkedVideos.length} chunks)`)

await Promise.all(chunkArray(vids, 2000).map(addVideos))
console.log(`Updated ${vids.length} videos`)

console.log(`\nTokens used: ${tokensUsed}`)
