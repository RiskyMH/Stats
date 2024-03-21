import type { youtube_v3 } from "googleapis"

export let tokensUsed = 0;

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not defined");
}

export async function getChannels(channels: string[]) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2Cstatistics&id=${channels.join(',')}&key=${YOUTUBE_API_KEY}`)
    if (!res.ok) throw new Error(await res.text())

    const data = await res.json() as youtube_v3.Schema$ChannelListResponse
    tokensUsed++;

    return data.items
}


export async function getPlaylist(playlistId: string, nextPageToken?: string) {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails%2Csnippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    if (nextPageToken) url += `&pageToken=${nextPageToken}`

    const res = await fetch(url)
    if (!res.ok) {
        if (res.status === 404) return null
        throw new Error(await res.text())
    }

    const data = await res.json() as youtube_v3.Schema$PlaylistItemListResponse
    tokensUsed++;

    return data
}

export async function getVideo(videoIds: string[]) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`)
    if (!res.ok) throw new Error(await res.text())

    const data = await res.json() as youtube_v3.Schema$VideoListResponse
    tokensUsed++;

    return data.items
}
